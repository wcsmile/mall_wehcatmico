import { GuideModalUtil } from "../../../utils/guidemodal";
import { RedirectUtility } from "../../../utils/redirect"
import { DialogUtility } from "../../../utils/dialog";
import { OrderUtil } from "../../../utils/order"
import { APIUtility } from "../../../utils/api";
import { AppConfig } from "../../../config";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        type: 0,
        orderNum: 1,
        productID: "",
        productInfo: {},
        orderPrice: "0.00",
        maxNumLimt: 0,
        isSubmit: true,
        codeList: {
            802: "商品不存在",
            803: "商品已下架",
            804: "商品库存不足，我们会及时补货，请稍后再进行购买",
            905: "商品已下架，不能购买",
            901: "下单次数已达上限，请十分钟后再试",
            923: "已达到此商品的限购上限",
            921: "抱歉，活动还未开始",
            925: "抱歉，活动已结束"
        },
        shareTag: "0",
        scene: "0",
        mallIcon: "http://static.100bm.cn/mall/ui/default/ic_logo.jpg",
        requestComplate: false,
        status: "",

        nowEvaluateNum: "",
        noEvaluateNum: "",
        nowHalfEvaluateNum: "",
        isCollect: ""
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if(options.shareTag){
            this.setData({
                shareTag: options.shareTag
            })
        }
        if(options.scene){
            this.setData({
                scene: options.scene
            })
        }
        this.data.productID = options.product_id
        DialogUtility.loading("加载中");
        this.queryProductDetail()
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        DialogUtility.close(this);
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        DialogUtility.loading("加载中");
        this.queryProductDetail()
        wx.stopPullDownRefresh;
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: '仅售¥' + this.data.orderPrice + '!' + this.data.productName,
            path: '/pages/home/home?page_type=6&id=' + this.data.productID,
            success: function (res) {
                // 转发成功
                console.log("转发成功！");
            },
            fail: function (res) {
                // 转发失败
                console.log("转发失败！");
            }
        }
    },
    showDialog() {
        DialogUtility.loading("下单中，请稍候", 3);
        if (this.data.isSubmit) {
            this.data.isSubmit = false;
            let queryParms = [];
            let parm = { product_id: this.data.productID, product_num: this.data.orderNum };
            queryParms.push(parm);
            APIUtility.get({
                url: AppConfig.apiList.orderRequest,
                params: {
                    product_data: queryParms,
                    order_type: "1001",//商品下单
                    share_tag: this.data.shareTag,
                    scene: this.data.scene
                },
                succ: (res) => {
                    let result = res.data
                    wx.requestPayment({
                        timeStamp: result.timeStamp + "",
                        nonceStr: result.nonceStr,
                        package: result.package,
                        signType: result.signType,
                        paySign: result.paySign,
                        success: (res) => {
                            RedirectUtility.navigateTo("/pages/mall/buysuccess/buysuccess?product_name=" + this.data.productInfo.product_name + "&product_num=" + this.data.orderNum);
                            GuideModalUtil.closeGuideModal();
                        },
                        fail: (errData) => {
                            console.log("取消支付,关闭订单", errData);
                        },
                        complete: (errData) => {
                            console.log("complete", errData);
                            setTimeout(() => {
                                this.data.isSubmit = true;
                            }, 1000);
                        }
                    })
                },
                fail: (errData) => {
                    DialogUtility.tip(this.data.codeList[errData.code] || "订单创建失败");
                },
                compelete: () => {
                    DialogUtility.close(this);
                    setTimeout(() => {
                        this.data.isSubmit = true;
                    }, 1000);
                }
            })
        }
    },
    queryProductDetail(productID) {
        APIUtility.get({
            url: AppConfig.apiList.queryProductDetail,
            params: { product_id: this.data.productID, plat_tag: AppConfig.plat_tag, versoin: "versoin" },
            succ: (res) => {
                let datas = res.data
                res.data.sale_price = (res.data.sale_price / 100).toFixed(2)
                res.data.face = (res.data.face / 100).toFixed(2)
                res.data.cover_img = AppConfig.imageAddr + res.data.cover_img
                let shopInfo = datas.shopinfo
                let imgUrls = []
                let JDImageUrl = ""
                res.data.images.map((item) => {
                    item.image_url = AppConfig.imageAddr + item.image_url;
                    if(item.image_type == 1){
                        res.data.cover_image = item.image_url;
                        imgUrls.push(item.image_url)
                    }
                    if(item.image_type == 2){
                        JDImageUrl = item.image_url
                    }
                })

                if(res.data.evaluateinfo){
                    let average_star_level = parseFloat(res.data.evaluateinfo.average_star_level)
                    let evaluateNum = Math.floor(average_star_level);
                    let isHalf = 0;
                    if(average_star_level != evaluateNum){
                        isHalf = 0.5;
                    }
                    console.log("-----------------", average_star_level, evaluateNum, isHalf);
                    
                    this.setData({
                        nowEvaluateNum: evaluateNum,  
                        noEvaluateNum: isHalf == 0 ? 5 - evaluateNum : 5 - evaluateNum - 1,
                        nowHalfEvaluateNum: isHalf,
                        average_star_level: average_star_level.toFixed(1)
                    })
                }
                
                this.setData({
                    requestComplate: true,
                    productInfo: res.data,
                    orderPrice: res.data.sale_price,
                    productName: res.data.product_name,
                    maxNumLimt: res.data.max_limit,
                    mallIcon: shopInfo.logo_url ? (AppConfig.imageAddr + shopInfo.logo_url) : this.data.mallIcon,
                    status: res.data.status,
                    isCollect: res.data.favorite_id,
                    imgUrls: imgUrls,
                    JDImageUrl: JDImageUrl
                })
            },
            fail: (errData) => {
                console.log("加载失败", errData);
                DialogUtility.tip("商品已下架，不能购买");
                setTimeout(() => {
                    this.data.isSubmit = true;
                    wx.navigateBack({
                        delta: 1
                    })
                }, 1000);
                this.setData({
                    requestComplate: false
                })
            },
            compelete: () => {
                DialogUtility.close(this);
            }
        })
    },
    closeGuideModal() {
        GuideModalUtil.closeGuideModal();
    },
    showOrderDialog() {
        if (this.data.isSubmit) {
            this.data.isSubmit = false;
            OrderUtil.showOrderModal();
        }
        setTimeout(() => {
            this.data.isSubmit = true
        }, 500);
    },
    closeOrderDialog() {
        OrderUtil.closeOrderModal();
    },
    closeDialog() {
        OrderUtil.closeOrderModal();
    },
    minusNum() {
        let currtNum;
        if (this.data.orderNum > 1) {
            currtNum = this.data.orderNum - 1;
        } else {
            currtNum = 1;
        }
        this.setData({
            requestComplete: true,
            orderNum: currtNum,
            orderPrice: (this.data.productInfo.sale_price * currtNum).toFixed(2)
        });
    },
    addNum() {
        let currtNum;
        if (this.data.orderNum < this.data.maxNumLimt) {
            currtNum = this.data.orderNum + 1;
        } else if (this.data.orderNum == this.data.maxNumLimt) {
            DialogUtility.tip("已达到此商品的限购上限");
            return;
        } else {
            currtNum = this.data.maxNumLimt;
        }
        this.setData({
            requestComplete: true,
            orderNum: currtNum,
            orderPrice: (this.data.productInfo.sale_price * currtNum).toFixed(2)
        });
    },
    hideOrder() {
        OrderUtil.closeOrderModal();
    },
    gotoCar(){ //购物车
        RedirectUtility.switchTab("/pages/car/shoppingcar/shoppingcar")
    },
    injoinCar(){ //加入购物车
        if (this.data.isSubmit) {
            this.data.isSubmit = false;
            APIUtility.get({
                url: AppConfig.apiList.addOrderCar,
                params: { 
                    product_id: this.data.productID, 
                    product_count: this.data.orderNum, 
                    plat_tag: AppConfig.plat_tag, 
                    activity_tag: this.data.productInfo.activity_info ? this.data.productInfo.activity_info.activity_tag : ""
                },
                succ: (res) => {
                    DialogUtility.tip("加入购物车成功");
                },
                fail: (errData) => {
                    console.log("加入购物车失败", errData);
                    DialogUtility.tip(this.data.codeList[errData.code] || "加入购物车失败，稍候再试");
                },
                compelete: () => {
                    DialogUtility.close(this);
                    setTimeout(() => {
                        this.data.isSubmit = true;
                    }, 1000);
                }
            })
        }
    },
    gotoSubmitOrder(){
        let carList = [];
        let carItem = {
            product_id: this.data.productInfo.product_id,
            product_num: 1,
            activity_tag: this.data.productInfo.activity_info ? this.data.productInfo.activity_info.tag : ""
        };
        carList.push(carItem)

        let type;
        if((this.data.productInfo.product_flag & 16)  == 16){
            type = 0
        }else if((this.data.productInfo.product_flag & 32) == 32){
            type = 1
        }else{
            type = 2;
        }
        RedirectUtility.navigateTo("/pages/mall/submitorder/submitorder?carlist=" + JSON.stringify(carList) + "&type=" + type + "&buy=1001");
    },
    gotoEvaluate(){ //评论        
        RedirectUtility.navigateTo("/pages/mall/goodsevaluate/goodsevaluate?productId=" + this.data.productInfo.product_id);
    },
    gotoCollect(){ //关注
        if(this.data.isCollect){
            this.setData({
                isCollect: ""
            })
            this.delMyCollection();
        }else{
            this.addMyCollection();
        }
    },
    addMyCollection(){
        DialogUtility.loading("关注中");
        APIUtility.get({
            url: AppConfig.apiList.addMyCollection,
            params: { 
                product_id: this.data.productInfo.product_id, 
                shop_id: this.data.productInfo.shop_id,
                plat_tag: AppConfig.plat_tag,   
                remark: ""
            },
            succ: (res) => {
                DialogUtility.tip("添加关注成功");
                this.queryProductDetail()
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("添加关注失败");
            },
            compelete: () => {
                DialogUtility.close(this);
            }
        })
    },
    delMyCollection(){
        DialogUtility.loading("取消关注中");
        APIUtility.get({
            url: AppConfig.apiList.deleteMyCollection,
            params: { 
                favorite_id: this.data.productInfo.favorite_id
            },
            succ: (res) => {
                DialogUtility.tip("取消关注成功");
                this.queryProductDetail()
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("取消关注失败");
            },
            compelete: () => {
                DialogUtility.close(this);
            }
        })
    },
    showgoodsDialog(){
        //查看详情
        RedirectUtility.navigateTo("/pages/mall/goodsdetailimage/goodsdetailimage?goodsWebUrl=" + this.data.JDImageUrl);
    }
})