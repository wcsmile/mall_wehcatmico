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

        evaluateNum: 3.5,
        nowEvaluateNum: "",
        noEvaluateNum: "",
        nowHalfEvaluateNum: "",
        timer: "",
        showTime: "",
        isCollect: "",

        imgUrls: []
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

        this.setData({
            tags: options.tags,
            productID: options.product_id
        })

        DialogUtility.loading("加载中");
        this.queryProductDetail()
    },
    countDown(){  //计算活动的倒计时间
        let type = 0;
        let t = 0;
            let startTime = (this.data.activityInfo.expire_start).replace(/\-/g, "/")  // 活动开始时间
            let endTime = (this.data.activityInfo.expire_end).replace(/\-/g, "/")  // 活动结束时间

            let nowDate = new Date().getTime();     // 获取当前日期
            let startDate = new Date(startTime).getTime();   //开始日期
            let endDate = new Date(endTime).getTime();     // 转换成和nowTime的格式相同(！注意：获取月是从0开始，因此写月份要减1)

            if(nowDate < startDate){
                //即将开始
                type = 0;
                t = Math.floor((startDate - nowDate) / 1000);// 计算相差的时间（单位：秒）
            }else if(nowDate > endDate){
                type = 2; //已过期
            }else{
                //进行中
                type = 1;
                t = Math.floor((endDate - nowDate) / 1000);// 计算相差的时间（单位：秒）
            }
        
        this.setData({
            types: type
        })
        
        if(type == 0){
            this.setData({
                showTip: "距开始",
            })
        }else if(type == 1){
            this.setData({
                showTip: "距结束",
            })
        }else if(type == 2){
            this.setData({
                showTip: "活动",
                showTime: "已结束"
            })
        }
        // console.log(t);
        if(type == 0 || type == 1){
            let iD = Math.floor(Math.floor(t / 86400));     // 天（86400 = 24*3600）
            let iH = Math.floor((t % 86400) / 3600);   // 时
            let iM = Math.floor((t % 3600) / 60);    // 分
            let iS = t % 60;     // 秒
            if (t == 0){
                clearInterval(this.data.timer);
                if(type == 1){
                    this.setData({
                        showTime: "抢购完毕"
                    })
                }else if(type == 0){
                    this.setData({
                        showTime: "活动已开始，请刷新数据"
                    })
                }
            } else {
                setTimeout(() => {
                    this.countDown()
                }, 1000);
                if(iD == 0){
                    this.setData({
                        showTime: this.addZ(iH) + "时" + this.addZ(iM) + "分" + this.addZ(iS) + "秒"
                    })
                }else{
                    this.setData({
                        showTime: this.addZ(iD) + "天" + this.addZ(iH) + "时" + this.addZ(iM) + "分"
                    })
                }
            }
        }
    },
    addZ(iNum){
        return iNum<10 ? "0"+iNum : iNum;
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
            title: '仅售¥' + this.data.productInfo.activity_sale_price + '!' + this.data.productName,
            path: '/pages/home/home?page_type=9&id=' + this.data.productID,
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
    queryProductDetail(productID) {
        APIUtility.get({
            url: AppConfig.apiList.queryProductDetail,
            params: { 
                product_id: this.data.productID, 
                plat_tag: AppConfig.plat_tag,
                activity_tag: this.data.tags
             },
            succ: (res) => {
                let datas = res.data
                res.data.sale_price = (res.data.sale_price / 100).toFixed(2)
                res.data.face = (res.data.face / 100).toFixed(2)
                res.data.cover_img = AppConfig.imageAddr + res.data.cover_img
                let shopInfo = datas.shopinfo
                let imgUrls = []
                res.data.images.map((item) => {
                    item.image_url = AppConfig.imageAddr + item.image_url;
                    if(item.image_type == 1){
                        res.data.cover_image = item.image_url;
                        imgUrls.push(item.image_url)
                    }
                })

                for(let i = 0; i < res.data.activity_rule_list.length; i++){ //计算活动价格
                    if(res.data.product_id == res.data.activity_rule_list[i].product_id){
                        res.data.activity_sale_price = (res.data.activity_rule_list[i].sale_price / 100).toFixed(2)
                        break
                    }else if("*" == res.data.activity_rule_list[i].product_id){
                        res.data.activity_sale_price = (res.data.activity_rule_list[i].sale_price / 100).toFixed(2)
                    }
                }
                
                if(res.data.evaluateinfo){
                    let average_star_level = parseFloat(res.data.evaluateinfo.average_star_level)
                    let evaluateNum = Math.floor(average_star_level);
                    let isHalf = 0;
                    if(average_star_level != evaluateNum){
                        isHalf = 0.5;
                    }
                    
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
                    activityInfo: res.data.activity_info || ""
                })
                this.countDown();  //倒计时
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
    hideOrder() {
        OrderUtil.closeOrderModal();
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
                    activity_tag: this.data.productInfo.activity_info.activity_tag
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
})