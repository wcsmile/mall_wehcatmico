export module Entity {
    /**
     * 用户状态
     */
    export enum PKGUserStatus {
        /**
         * 正常
         */
        NORMAL = 0,
        /**
         * 白名单
         */
        WHITE = 1,
        /**
         * 黑名单
         */
        BLACK = 99,
    }

    /**
     * 用户信息
     */
    export class UserInfo {
        constructor(
            public nickName: string = "",
            public headImg: string = "http://static.100bm.cn/mall/ui/default/ic_default_head.png"
        ) { }
    }

    export class LoginInfo {
        constructor(
            public sessionId: string = "",
            public userStatus: PKGUserStatus = PKGUserStatus.NORMAL,
            public isSubscribed: boolean = false
        ) { }
    }

    export class ApiError {
        constructor(
            public code: number = 999,
            public msg: string = ""
        ) { }
    }
}