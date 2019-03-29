/**
 * 测试图片站点：http://static.100bm.cn
 * 
 * 正式图片站点：https://img.sinopecscsy.com
 * 
 * 测试API：http://192.168.106.226:8000
 * 
 * 正式API：https://wm.sinopecscsy.com
 * 
 * 测试APPID：wxb72b487347df02ce (测试AppId)
 * 
 * 正式APPID：wxc7b6c0450fed7452 
 * 
 * @export
 * @class AppConfig
 */
export class AppConfig {
    // 版本控制
    static appVersion = "v0.0.20";
    // API地址     http://testmallsvc.cdqykj.cn    http://192.168.106.139:8001
  static apiHost = "http://192.168.5.83:8000";  //http://192.168.5.78:8000   http://192.168.5.107:8000 http://192.168.5.83:8000
    // 图片地址的域名
    static imageAddr = "http://static.100bm.cn/mall/";
    // 默认用户头像
    static defaultUserHeadImg = "http://static.100bm.cn/mall/ui/default/ic_default_head.png";

    // 用户状态信息
    static dkUserStatus = "user_status_info";
    // 初次进入小程序
    static dkFirstLaunch = "first_launch";
    // 首次使用检测功能
    static dkFirtEnterCheckPage = "first_enter_check";
    // 用户输入历史
    static dkUserPhoneList = "user_phone_list";
    // 用户固话输入历史
    static dkFixedLineList = "fixed_line_list";
    // 用户加油卡支付历史
    static dkPayedOilList = "payed_oil_list";
    // 加油卡列表
    static dkOilList = "oil_list";
    // 平台常量
    static plat_tag = "AAA1";
    // 用户视频购买历史
    static dkPayedVideoList = "payed_video_list";
    // 视频列表
    static dkVideoList = "video_list";

    static apiList = {
        getUserInfo: AppConfig.apiHost + "/customer/adoc/auth/wechat", //静默制授权获取code
        queryUserInfo: AppConfig.apiHost + "/customer/baseinfo/query", // （手动授权）用户信息查询
        saveFansInfo: AppConfig.apiHost + "/customer/login/wechat",//保存用户信息
        queryCouponInfo: AppConfig.apiHost + "/customer/coupon/list",//获取提货券包
        queryCouponDetailInfo: AppConfig.apiHost + "/customer/coupon/detail",//获取提货券包详情
        queryOrderInfo: AppConfig.apiHost + "/customer/order/list",//获取订单记录
        queryOrderDetailInfo: AppConfig.apiHost + "/customer/order/detail",//获取订单记录详情
        queryProductList: AppConfig.apiHost + "/sale/product/list", //获取产品列表
        queryProductDetail: AppConfig.apiHost + "/sale/product/detail",  //获取产品详细信息
        orderRequest: AppConfig.apiHost + "/sale/order/create",    //下单接口
        queryQuestionList: AppConfig.apiHost + "/sys/question/list",    //获取问答列表
        queryDictionary: AppConfig.apiHost + "/sys/dictionary/list",  //获取字典
        payAgin: AppConfig.apiHost + "/sale/order/payagain", //继续支付
        queryCantonList: AppConfig.apiHost + "/sys/canton/list", //获取城市列表
        queryShopProductList: AppConfig.apiHost + "/sale/shop/product/list", //获取充值产品列表
        uploadImage: AppConfig.apiHost + "/file/upload", //上传身份证图片
        queryOilInfo: AppConfig.apiHost + "/petrol/cardinfo/query", //加油卡查询
        queryNewProductList: AppConfig.apiHost + "/sale/newest/product/list",  //获取最近上架产品
        queryPhoneInfo: AppConfig.apiHost + "/mobile/belongplace/query",  //获取手机归属地
        queryBankProductList: AppConfig.apiHost + "/sale/shop/fsaleproduct/list", //获取兴业银行产品列表

        queryOrderCarList: AppConfig.apiHost + "/shoppingcart/product/list", //获取购物车列表
        addOrderCar: AppConfig.apiHost + "/shoppingcart/product/add",  //加入购物车
        removeOrderCar: AppConfig.apiHost + "/shoppingcart/product/remove", //移除购物车
        clearOrderCard: AppConfig.apiHost + "/shoppingcart/product/clear",    //清空购物车
        operOrderNum: AppConfig.apiHost + "/shoppingcart/product/checkout",   //操作购物车数量

        querySubmitOrder: AppConfig.apiHost + "/sale/createorder/product/list",  //获取确认页面数据

        queryMyAddressList: AppConfig.apiHost + "/customer/address/list", //获取我的收货地址列表
        addMyAddress: AppConfig.apiHost + "/customer/address/add", //添加我的收货地址
        delMyAddress: AppConfig.apiHost + "/customer/address/remove", //删除我的收货地址
        updateMyAddress: AppConfig.apiHost + "/customer/address/edit", //修改我的收货地址
        defaultMyAddress: AppConfig.apiHost + "/customer/address/default", //设置默认的收货地址

        queryMyCollectionList: AppConfig.apiHost + "/customer/collection/query",  //获取收藏列表
        deleteMyCollection: AppConfig.apiHost + "/customer/collection/delete",  //取消收藏
        addMyCollection: AppConfig.apiHost + "/customer/collection/add",  //添加收藏

        queryMyInvoiceList: AppConfig.apiHost + "/invoice/apply/order/list",  //获取开发票列表
        createMyInvoice: AppConfig.apiHost + "/invoice/apply/order/create",  //开发票
        queryInvoiceHistoryList: AppConfig.apiHost + "/invoice/order/history/list",  //获取发票历史
        queryInvoicePostage: AppConfig.apiHost + "/invoice/express/templt/query",   //获取发票模板
        payAginInvoice: AppConfig.apiHost + "/invoice/order/payagain",  //发票订单再支付

        queryMenusList: AppConfig.apiHost + "/sale/product/class/list",  //获取分类列表

        queryGoodsEvaluateList: AppConfig.apiHost + "/product/evaluation/list", //获取商品评价列表
        addOrderEvaluate: AppConfig.apiHost + "/customer/evaluation/add",  //订单评价
        refundMoney: AppConfig.apiHost + "/order/refund/apply", //申请退款
        queryLogisticsInfo: AppConfig.apiHost + "/carriage/info/query", //查看物流信息
        sureReceipt: AppConfig.apiHost + "/customer/order/confirm/receipt",  //确认收货

        queryUserOrderInfo: AppConfig.apiHost + "/customer/pointandorder/query", //获取用户积分

        queryLimitActivityList: AppConfig.apiHost + "/sale/product/timelimit/list",   //获取限时活动列表
        queryLimitActivityDetail: AppConfig.apiHost + "/sale/product/detail/info",  //获取活动详情

        queryEntranceList: AppConfig.apiHost + "/sys/entranceitem/list", //获取首页入口

        queryAddressList: AppConfig.apiHost + "/sys/canton/list", //获取地址信息

        queryProductPostage: AppConfig.apiHost + "/get/product/postage", //获取邮费

        queryHomeDataList: AppConfig.apiHost + "/sale/product/homepage/list", //获取首页数据

        queryInvoiceTtList: AppConfig.apiHost + "/get/invoice",  //获取抬头列表
        setDefaultInvoice: AppConfig.apiHost + "/default/invoice",   //设置默认抬头
        editInvoiceTt: AppConfig.apiHost + "/edit/invoice",  //编辑发票抬头
        addInvoiceTt: AppConfig.apiHost + "/create/invoice", //添加发票抬头
        delInvoiceTt: AppConfig.apiHost + "/del/invoice",  //删除发票抬头

    }
    constructor() { }
}