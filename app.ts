//app.js
import { APIUtility } from "./utils/api";
import { AppConfig } from "./config";
import { CommonUtility } from "./utils/common";
import { StorageUtility } from "./utils/storage";
import { RedirectUtility } from "./utils/redirect";
import { TimeUtility } from "./utils/time";

App({
    globalData: {
        globalRequestParams: {
            user_source: "",
            wxVersion: "",
            sdkVersion: "",
            brand: "",
            model: "",
            system: "",
            platform: "",
            user_session: ""
        },
        isFirst: 0,
        formIds: [],
        isExit: false
    },
    onLaunch(options) {
        console.log("小程序加载", options);
        if (options && options.query) {
            this.globalData.globalRequestParams.user_source = options.query.scene || "";
        }
    },
    onShow() {
        this.globalData.isFirst = StorageUtility.get(AppConfig.dkFirstLaunch) || 0;
    },
    onError(msg) {
        console.log("onError>>>>>>", msg);
    },
    onHide() {
        
    }
})