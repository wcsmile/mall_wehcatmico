
/**
 * 请求工具类
 */
import { UserUtility } from "./user";
import { Entity } from "./entity";
import { HttpErrorCode } from "./apierr";
import { DialogUtility } from "./dialog";
import { CommonUtility } from "./common";
import { DateUtility } from "./date";

export class APIUtility {

    private static requestStartTime: Date;

    /**
     * http get请求
     * @param options  
     */
    static get(rawOptions: RequestOptions): void {
        this.requestStartTime = new Date();

        console.log("====HTTP REQUEST START====", rawOptions.url);

        let options = CommonUtility.merge({}, rawOptions);
        UserUtility.getLoginInfo(user => {
            options.params = options.params || {};
            options.dic = options.dic || {};
            options.params.session_id = user.sessionId;

            let rawFail = options.fail;
            options.fail = (err: Entity.ApiError) => {
                // 返回401，则需要授权，并等待重新执行本请求<还要避免死循环,只重新授权一次>
                // 错误回调，也只执行一次
                if (this.firstMeet401(err.code, options)) {
                    return UserUtility.refreshLoginInfo(user.sessionId, (newLoginInfo) => {
                        options.params.session_id = newLoginInfo.sessionId;
                        this.getNoAuth(options);
                    });
                }
                // 执行错误处理函数
                rawFail ? rawFail(err) : this.showError(err.msg);
            };
            this.getNoAuth(options);
        });
    }

    private static getNoAuth(options: any): void {

        this.startLoadingAnimation();
        let params = options.params || {};
        let begainDate = new Date();
        console.log("====HTTP REQUEST BEGAIN====", options.url, new Date());
        wx.request({
            url: options.url,
            data: CommonUtility.merge(params, { random: Math.random() }),
            //header: { 'content-type': 'application/x-www-form-urlencoded' }, post时，这个才有用
            method: "GET",
            success: res => {
                console.log("api-res:", res, options.url, new Date());
                if (res.statusCode == 200) {
                    options.succ && options.succ(res.data);
                } else {
                    let apiErr = HttpErrorCode.get(res.statusCode, "");
                    // 新版接口会返回msg 直接取接口返回的msg
                    if (res.data && res.data.msg) {
                        apiErr = new Entity.ApiError(res.statusCode, res.data.msg);
                    }
                    options.fail ? options.fail(apiErr) : this.showError(apiErr.msg);
                }
            },
            fail: err => {
                console.log("api-err:", err, options.url);
                if (JSON.stringify(err).indexOf("interrupted") != -1) {
                    this.showError("连接超时，请稍后重试");
                }
                options.exception && options.exception(err);
            },
            complete: response => {
                this.closeLoadingAnimation();
                // 因401会强制二次请求（静默授权后），因此需要避免多次回调compelete
                if (response.statusCode != 401) {
                    options.compelete && options.compelete(response);
                }
                console.log("====HTTP REQUEST END====", options.url, response.statusCode, new Date().getTime() - this.requestStartTime.getTime(), new Date().getTime() - begainDate.getTime(), new Date());
            }
        });
    }

    private static firstMeet401(code: number, options: any): boolean {
        // 非401，或者服务器再次返回401
        if (code != 401 || options.dic["isRepeat"]) {
            return false;
        }
        console.log("sessionId已经过期，需要授权！等待授权后，重新发起本次API请求！");
        options.dic["isRepeat"] = true;
        return true;
    }

    private static showError(err: string) {
        DialogUtility.tip(err, "error");
    }

    private static startLoadingAnimation() {
        wx.showNavigationBarLoading();
    }

    private static closeLoadingAnimation() {
        wx.hideNavigationBarLoading();
    }
}

class RequestOptions {
    constructor(
        public url: string,
        public params?: { [key: string]: any },
        public succ?: (data: any) => void,
        public fail?: (err: Entity.ApiError) => void,
        public compelete?: (response: any) => void,
        public exception?: (e: any) => void,
        public dic?: { [key: string]: any }
    ) {
    }
}