import { Entity } from "./entity";

export class HttpErrorCode {
    static ErrorCode = {
        "0": "无法连接服务器,请检查网络连接",// const OK = 200
        //2成功（2字头）
        "200": "200-请求完成",// const OK = 200
        "201": "201-CREATED",// const CREATED = 201
        "202": "202-ACCEPTED",// const ACCEPTED = 202
        "203": "203-NON_AUTHORITATIVE_INFORMATION",// const NON_AUTHORITATIVE_INFORMATION = 203
        "204": "204-NO_CONTENT",// const NO_CONTENT = 204 //失败
        "205": "205-RESET_CONTENT",// const RESET_CONTENT = 205
        "206": "206-PARTIAL_CONTENT",// const PARTIAL_CONTENT = 206
        "207": "207-MULTI_STATUS",// const MULTI_STATUS = 207

        //3重定向（3字头）
        "300": "300-MULTIPLE_CHOICES",// const MULTIPLE_CHOICES = 300
        "301": "301-MOVED_PERMANENTLY",// const MOVED_PERMANENTLY = 301
        "302": "302-页面正在重定向",// const MOVE_TEMPORARILY = 302
        "303": "303-SEE_OTHER",// const SEE_OTHER = 303
        "304": "304-NOT_MODIFIED",// const NOT_MODIFIED = 304
        "305": "305-USE_PROXY",// const USE_PROXY = 305
        "306": "306-SWITCH_PROXY",// const SWITCH_PROXY = 306
        "307": "307-TEMPORARY_REDIRECT",// const TEMPORARY_REDIRECT = 307

        //4请求错误（4字头）
        "400": "400-请求错误",// const BAD_REQUEST = 400 //参数错误
        "401": "401-请求未授权",// const UNAUTHORIZED = 401
        "402": "402-需要预先支付",// const PAYMENT_REQUIRED = 402
        "403": "黑名单用户不允许下单",// const FORBIDDEN = 403
        "404": "404-无法找到请求的资源",// const NOT_FOUND = 404
        "405": "405-METHOD_NOT_ALLOWED",// const METHOD_NOT_ALLOWED = 405
        "406": "406-缺少必须参数",// const NOT_ACCEPTABLE = 406 //缺少必须参数
        "407": "407-代理请求认证",// const PROXY_AUTHENTICATION_REQUIRED = 407
        "408": "408-登录令牌过期",// const REQUEST_TIMEOUT = 408
        "409": "409-CONFLICT",// const CONFLICT = 409
        "410": "410-GONE",// const GONE = 410
        "411": "411-LENGTH_REQUIRED",// const LENGTH_REQUIRED = 411
        "412": "412-PRECONDITION_FAILED",// const PRECONDITION_FAILED = 412
        "413": "当日下单次数超过限制",// const REQUEST_ENTITY_TOO_LARGE = 413
        "414": "当月下单次数超过限制",// const REQUEST_URI_TOO_LONG = 414
        "415": "415-UNSUPPORTED_MEDIA_TYPE",// const UNSUPPORTED_MEDIA_TYPE = 415
        "416": "416-REQUESTED_RANGE_NOT_SATISFIABLE",// const REQUESTED_RANGE_NOT_SATISFIABLE = 416
        "417": "417-EXPECTATION_FAILED",// const EXPECTATION_FAILED = 417
        "422": "422-UNPROCESSABLE_ENTITY",// const UNPROCESSABLE_ENTITY = 422
        "423": "423-LOCKED",// const LOCKED = 423
        "424": "424-FAILED_DEPENDENCY",// const FAILED_DEPENDENCY = 424
        "425": "425-UNORDERED_COLLECTION",// const UNORDERED_COLLECTION = 425
        "426": "426-UPGRADE_REQUIRED",// const UPGRADE_REQUIRED = 426
        "449": "449-RETRY_WITH",// const RETRY_WITH = 449
        "451": "451-UNAVAILABLE_FOR_LEGAL_REASONS",// const UNAVAILABLE_FOR_LEGAL_REASONS = 451

        //5服务器错误（5、6字头）
        "500": "500-系统繁忙,请稍候再试",// const SERVER_ERROR = 500 //系统繁忙
        "501": "501-NOT_IMPLEMENTED",// const NOT_IMPLEMENTED = 501
        "502": "系统繁忙，请稍后再试（ERR-502）",// const BAD_GATEWAY = 502
        "503": "503-服务繁忙,无法响应",// const SERVICE_UNAVAILABLE = 503
        "504": "504-GATEWAY_TIMEOUT",// const GATEWAY_TIMEOUT = 504
        "505": "505-HTTP_VERSION_NOT_SUPPORTED",// const HTTP_VERSION_NOT_SUPPORTED = 505
        "506": "506-constIANT_ALSO_NEGOTIATES",// const constIANT_ALSO_NEGOTIATES = 506
        "507": "507-INSUFFICIENT_STORAGE",// const INSUFFICIENT_STORAGE = 507
        "509": "509-BANDWIDTH_LIMIT_EXCEEDED",// const BANDWIDTH_LIMIT_EXCEEDED = 509
        "510": "510-NOT_EXTENDED",// const NOT_EXTENDED = 510
        "600": "600-UNPARSEABLE_RESPONSE_HEADERS",// const UNPARSEABLE_RESPONSE_HEADERS = 600this.ErrorCode

        "998": "998-预设参数有空值！" // 前端自定义错误(http请求时检查的sessionId和apiToken)
    };

    static get(status: number, defaultMsg: string): Entity.ApiError {
        let msg = HttpErrorCode.ErrorCode[status] || (`${status || 999}-${defaultMsg || '网络请求失败'}`);
        return new Entity.ApiError(status, msg);
    }
}