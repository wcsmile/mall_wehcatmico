
import { Entity } from "./entity";
import { HttpErrorCode } from "./apierr";
import { DialogUtility } from "./dialog";
import { StorageUtility } from "./storage";
import { AppConfig } from "../config";
import { CommonUtility } from "./common";

interface OnLoginSucceed {
    (data: Entity.LoginInfo): void;
}
interface OnAuthSuccedd {
    (data: Entity.UserInfo): void;
}

enum PkgLoginState { init, doing, success, failure }
enum PkgUserState { init, doing, success, failure }

/**
 * 用户工具类
 *         
 * wx.getUserInfo:
 *  encryptedData: string
 *  errMsg:"getUserInfo:ok"
 *  iv:"cBV+Qdw6zzmYXBMK1lsakA=="
 *  rawData:"{"nickName":"Inner Peace","gender":1,"language":"zh_CN","city":"Chengdu","province":"Sichuan","country":"China","avatarUrl":"https://wx.qlogo.cn/mmopen/vi_32/PiajxSqBRaELMc7WA6ZZhPy0jCP1E79JJTZ8vG5xm16O3J0ImAaXZ73OE6j9g143muPj1xXY4fOlnYibP5ia9eic5Q/0"}"
 *  signature:"c7b44d5b2b95a3e533f3a3ff2edb6934f439ac63"
 *  userInfo:{
 *      avatarUrl:"https://wx.qlogo.cn/mmopen/vi_32/PiajxSqBRaELMc7WA6ZZhPy0jCP1E79JJTZ8vG5xm16O3J0ImAaXZ73OE6j9g143muPj1xXY4fOlnYibP5ia9eic5Q/0"
 *      city:"Chengdu"
 *      country:"China"
 *      gender:1
 *      language:"zh_CN"
 *      nickName:"Inner Peace"
 *      province:"Sichuan"
 *  }
 */
const loginInfoKey = "czth_sp_login_key";
const userInfoKey = "czth_sp_user_key";

export class UserUtility {
    private static loginSuccNotifyQueue: Array<OnLoginSucceed> = [];
    private static isLogining = false;
    private static loginInfo = StorageUtility.get(loginInfoKey);
    private static userInfo = StorageUtility.get(userInfoKey);
    private static currentNotifySession = "";

    static getLoginInfo(callback: OnLoginSucceed): void {
        if (this.loginInfo) {
            return callback(this.loginInfo);
        }

        if (this.isLogining) {
            this.loginSuccNotifyQueue.push(callback);
            console.log("等待静默授权回调...排队编号:", this.loginSuccNotifyQueue.length);
            return;
        }

        this.isLogining = true;
        this.loginSuccNotifyQueue.push(callback);

        console.log("开始静默授权...");
        wx.login({
            success: res => { // res=>Object {errMsg: "login:ok", code: "07169W1X0iTrUW1l3Y1X0HnC1X069W1Z"}
                console.log("wx.login.suc.res:", res);
                if (res.errMsg != "login:ok") {
                    return this.loginFailureHandle(`微信登录异常:${res.errMsg}，请退出并重新进入！`);
                }

                let data = CommonUtility.merge({ code: res.code, random: Math.random(), notify_session: this.currentNotifySession }, getApp().globalData.globalRequestParams);
                wx.request({
                    url: AppConfig.apiList.getUserInfo, // 通过code换取sessionId
                    data: data,
                    method: "GET",
                    success: res => {
                        console.log("http-request-login:", res);
                        if (res.statusCode != 200) {
                            let apiErr = HttpErrorCode.get(res.statusCode, "");
                            return this.loginFailureHandle(`登录失败(ERR-${apiErr.code})`);
                        }
                        this.loginSucceedHandle(res.data);
                    },
                    fail: err => {
                        console.log("http-err:", err);
                        this.loginFailureHandle(`UNREACHABLE HTTP ERROR(login)：${err.errMsg}`);
                    }
                });
            },
            fail: err => {
                // 代理错误：err => Object {errMsg: "login:fail Error: tunneling socket could not be es…lished, cause=connect ETIMEDOUT 192.168.0.50:8881"}
                // 网络错误：err => Object {errMsg: "login:fail Error: getaddrinfo ENOENT servicewechat.com:443"}
                // 网络错误：err => {errMsg: "login:fail Error: getaddrinfo ENOTFOUND servicewechat.com servicewechat.com:443"}
                console.log("wx.login.err:", err);
                this.loginFailureHandle("无法连接服务器，请检查网络连接");
            }
        });
    }

    private static loginSucceedHandle(loginData: any): void {
        this.isLogining = false;
        console.log(loginData)
        let loginInfo = {
            sessionId: loginData.session_id,
            userStatus: loginData.user_remark || Entity.PKGUserStatus.NORMAL,
            isSubscribed: loginData.subscribe_status == "0"
        };
        this.loginInfo = loginInfo;
        this.saveLoginInfoToStorage(loginInfo);
        this.checkLoginInfoStorageStatues(loginInfo);
        this.loginSuccNotifyQueue.forEach(item => item(loginInfo));
        this.loginSuccNotifyQueue.splice(0, this.loginSuccNotifyQueue.length);
    }

    private static loginFailureHandle(errMsg: string): void {
        this.isLogining = false;
        this.loginSuccNotifyQueue.splice(0, this.loginSuccNotifyQueue.length);
        this.showErrorTip(errMsg);
    }

    /**
     * 获取本地用户信息
     * 
     * @static
     * @returns {*} 
     * @memberof UserUtility
     */
    static getLocalUserInfo(): any {
        return this.userInfo;
    }

    /**
     * 获取用户信息(异步)
     * 当从缓存取不到时，将调用授权，并最终获得用户信息
     */
    static getUserInfo(code: string, callback: OnAuthSuccedd): void {
        if (this.userInfo) {
            return callback(this.userInfo);
        }

        wx.getUserInfo({
            withCredentials: true,
            success: res => {
                console.log("wx.getUserInfo.succ:", res);
                this.saveUserInfo(code, res);
            },
            fail: err => {
                console.log("wx.getUserInfo.err:", err);
                if (err.errMsg != "getUserInfo:fail auth deny") {
                    this.showErrorTip(`微信授权异常:${err.errMsg}`);
                    return;
                }
            },
            complete: () => {
                callback(this.userInfo || new Entity.UserInfo());
            }
        });
    };

    static saveUserInfo(code: string, loginInfo: any): void {
        console.log("saveUserInfo.userInfo:", loginInfo.userInfo);
        let userInfo = loginInfo.userInfo;
        if (userInfo && (userInfo.nickName || userInfo.avatarUrl)) {
            let data = { nickName: userInfo.nickName, headImg: userInfo.avatarUrl };
            this.userInfo = data;
            this.saveUserInfoToStorage(data);
            this.pushUserInfoToServer(code, loginInfo);
        }
    }

    /** 
     * 强制重刷用户信息(将会触发重新授权)
     * @param succ 
     * @param fail 
     */
    static refreshLoginInfo(sessionId: string, succ: OnLoginSucceed): void {
        if (this.loginInfo) {
            this.loginInfo = null;
            this.saveLoginInfoToStorage(null);
        }
        // 当前重刷用户session
        this.currentNotifySession = sessionId;
        return this.getLoginInfo(succ);
    }


    private static saveUserInfoToStorage(user: Entity.UserInfo): void {
        StorageUtility.set(userInfoKey, user, { expiredDay: 15 });
    }

    private static checkLoginInfoStorageStatues(login: Entity.LoginInfo) {
        // 检查重试
        let tempData: any = StorageUtility.get(loginInfoKey);
        console.log("↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓");
        console.log(tempData);
        console.log(login);
        console.log("↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑");
        if (tempData && login.sessionId == tempData.sessionId) {
            return;
        }
        // 异步重试
        StorageUtility.setAsyn(loginInfoKey, login, { expiredDay: 3 });

        let commonMsg: any = {};
        commonMsg.czthTag = "缓存到本地失败";
        commonMsg.storageData = login;

        console.log(commonMsg);
    }

    private static saveLoginInfoToStorage(login: Entity.LoginInfo): void {
        StorageUtility.set(loginInfoKey, login, { expiredDay: 3 });
    }

    private static showErrorTip(message: string): void {
        DialogUtility.tip(message, "danger");
    }

    /**
     * 每次用户授权之后，将用户的个人信息回传给服务器
     * @param user 
     */
    private static pushUserInfoToServer(code: string, loginInfo: any): void {
        let userInfo = loginInfo.userInfo;
        if (!this.loginInfo) {
            console.log("无登录状态，无法提交用户信息！");
            return;
        }

        if (!code) {
            console.log("code为空，无法保存个人信息");
            return;
        }

        wx.request({
            url: AppConfig.apiList.saveFansInfo,
            data: {
                fans_name: userInfo.nickName,
                head_img_url: userInfo.avatarUrl,
                gender: userInfo.gender,
                session_id: this.loginInfo.sessionId,
                login_code: code,
                raw_data: loginInfo.rawData,
                wx_signature: loginInfo.signature,
                wx_iv: loginInfo.iv,
                user_data: loginInfo.encryptedData
            },
            method: "GET",
            success: res => console.log("用户信息上传成功!", res),
            fail: err => {
                console.log("用户信息提交失败：", err)
                this.saveFansInfoAgain();
            },
        });
    }

    /**
     * 再次提交用户信息
     */
    static saveFansInfoAgain(): void {
        wx.login({
            success: result => {
                console.log("wx.login.suc.res.again:", result);
                let code = result.code;
                wx.getUserInfo({
                    withCredentials: true,
                    success: res => {
                        let loginInfo = res;
                        let userInfo = res.userInfo;
                        wx.request({
                            url: AppConfig.apiList.saveFansInfo,
                            data: {
                                fans_name: userInfo.nickName,
                                head_img_url: userInfo.avatarUrl,
                                gender: userInfo.gender,
                                session_id: this.loginInfo.sessionId,
                                login_code: code,
                                raw_data: loginInfo.rawData,
                                wx_signature: loginInfo.signature,
                                wx_iv: loginInfo.iv,
                                user_data: loginInfo.encryptedData,
                                saveFansInfoAgain: true
                            },
                            method: "GET",
                            success: res => console.log("用户信息上传成功!", res),
                            fail: err => console.log("用户信息提交失败：", err),
                        });
                    },
                    fail: err => {
                        console.log("wx.getUserInfo.err:", err);
                    }
                });
            },
            fail: err => {
                console.log("wx.login.err:", err);
            }
        });
    }
}

