import { RedirectUtility } from "../../../utils/redirect";
import { AppConfig } from "../../../config";
import { APIUtility } from "../../../utils/api";
import { DialogUtility } from "../../../utils/dialog";
import { NumberUtility } from "../../../utils/number";
import { GuideModalUtil } from "../../../utils/guidemodal";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        orderNo: "",
        orderDetailInfo: {},
        payDictionaryList: {},
        orderDictionaryList: {},
        productDictionaryList: {},
        productTypeList: {},
        mallIcon: "http://static.100bm.cn/mall/ui/default/ic_logo.jpg",
        requestComplate: false,
        productType: 0,
        isSubmit: true
    },
    queryDictionary(type){
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryDictionary,
            params: { enum_type: type},
            succ: (res) => {

                let resultData = {};

                (res.list||[]).forEach(item => {
                    resultData[item.value] = item.description
                });

                if(type == "PaymentDetailStatus"){
                    this.queryDictionary("PaymentType");
                    this.setData({
                        payDictionaryList: resultData
                    })
                }else if(type == "PaymentType"){
                    this.queryDictionary("ProductStatus");
                    this.setData({
                        orderDictionaryList: resultData
                    })
                }else if(type == "ProductStatus"){
                    this.queryDictionary("ProductType");
                    this.setData({
                        productDictionaryList: resultData
                    })
                }else if(type == "ProductType"){
                    this.queryDictionary("LogisticsStatus");
                    this.setData({
                        productTypeList: resultData
                    })
                }else{
                    this.queryOrderDetail(this.data.orderNo);
                    this.setData({
                        logisticsDictionaryList: resultData
                    })
                }
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("加载失败");
            },
            compelete: () => {
                DialogUtility.close(this);
            }
        })
    },
    queryOrderDetail(orderNo) {
        APIUtility.get({
            url: AppConfig.apiList.queryOrderDetailInfo,
            params: { order_id: orderNo },
            succ: (res) => {
                let item = res.data || []
                let businessName = ""
                let detail = item.product_details;
                let logistics = item.carriage_info;
                item.payType = this.data.orderDictionaryList[item.pay_type];
                item.payStatus = this.data.payDictionaryList[detail[0].status];
                item.statusDesc = this.data.orderDictionaryList[item.pay_type] + "-" + this.data.payDictionaryList[detail[0].status];
                item.total_amount = (item.total_amount / 100.00).toFixed(2);
                item.pay_amounts = (item.pay_amount / 100.00).toFixed(2);
                item.total_cost = (item.total_cost / 100.00).toFixed(2);
                item.discount_amount = (item.discount_amount / 100.00).toFixed(2);
                item.refund_amounts = (item.refund_amount / 100.00).toFixed(2);
                item.sale_price = (item.sale_price / 100.00).toFixed(2);
                item.face = (item.face / 100.00).toFixed(2);
                item.productType = this.data.productTypeList[detail[0].product_type];
                item.orderStatus = detail[0].status;
                item.orderFinishTime = detail[0].order_finish_time;
                
                detail.map((items) => {
                    if(items.product_type == 6 || items.product_type == 7){
                        items.account = items.account ? NumberUtility.accountFormat(items.account) : "-----";
                    }else{
                        items.account = items.account || "-----";
                    }
                    items.init_pwds = items.init_pwd || "-----"
                    items.cover_img = AppConfig.imageAddr + items.cover_img;
                    items.sale_prices = items.discount_amount || items.discount_amount != 0 ? ((parseInt(items.sale_price) - parseInt(items.discount_amount)) / 100.00).toFixed(2) : (items.sale_price / 100.00).toFixed(2);
                    items.faces = (items.face / 100.00).toFixed(2);
                    businessName = items.shop_name;
                    items.hand_fee = items.hand_fee != 0 ? (items.hand_fee / 100.00).toFixed(2) + "元" : "免费";
                    items.productStatus = this.data.productDictionaryList[items.product_status];
                    if(items.logo_url){
                        this.data.mallIcon = AppConfig.imageAddr + items.logo_url
                    }
                })
                logistics.map((itemes)=>{
                    itemes.logistics_status = itemes.logistics_status ? this.data.logisticsDictionaryList[itemes.logistics_status] : ""
                })
                this.setData({
                    orderDetailInfo: item,
                    businessName: businessName,
                    mallIcon: this.data.mallIcon,
                    requestComplate: true,
                    productType: detail[0].product_type
                })
                this.calculationMoney();
            },
            fail: (errData) => {
                console.log("加载失败", errData);
                DialogUtility.tip("加载失败");
                this.setData({
                    requestComplate: false
                })
            }
        })
    },
    calculationMoney(){
        let templist = this.data.orderDetailInfo.product_details
        let payMoney = 0;
        let postage = parseInt(this.data.orderDetailInfo.postage)
        let refundAmount = parseInt(this.data.orderDetailInfo.refund_amount)
        for(let i = 0; i < templist.length; i++){
            let price = templist[i].discount_amount || templist[i].discount_amount != 0 ? parseInt(templist[i].sale_price) - parseInt(templist[i].discount_amount) : parseInt(templist[i].sale_price)
            payMoney += price * parseInt(templist[i].product_count)
        } 
        this.setData({
            payMoney: (payMoney / 100.00).toFixed(2),
            postage: (postage / 100.00).toFixed(2),
            payTotalMoney: ((payMoney + postage) /100.00).toFixed(2),
            refundAmount: (refundAmount / 100.00).toFixed(2)
        })
        console.log("---------------------", templist, refundAmount, this.data.orderDetailInfo);
        
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            orderNo: options.orderNo
        })
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
        this.queryDictionary("PaymentDetailStatus");
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
        this.queryOrderDetail(this.data.orderNo);
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },
    gotoOrderDetail(event){
        let productId = event.currentTarget.dataset.index;
        let productStatus = event.currentTarget.dataset.status;
        let productType = event.currentTarget.dataset.type;
        let activitys = event.currentTarget.dataset.activitys;
        if(productStatus != 0){
            return;
        }
        
        if(productType == 1 || productType == 10){ //卡券商品 | 实物商品
            if(activitys){
                RedirectUtility.navigateTo("/pages/activitys/limitactivitydetail/limitactivitydetail?product_id=" + productId + "&tags=" + activitys);
            }else{
                RedirectUtility.navigateTo("/pages/mall/goodsdetail/goodsdetail?product_id=" + productId);
            }
        }else if(productType == 2){ //话费充值
            RedirectUtility.navigateTo("/pages/recharge/phonerecharge/phonerecharge");
        }else if(productType == 3 || productType ==5){ //国内流量充值 | 省内流量充值
            RedirectUtility.navigateTo("/pages/recharge/mobileflowrecharge/mobileflowrecharge");
        }else if(productType == 4){ //在线开卡
            RedirectUtility.navigateTo("/pages/card/cardinformation/cardinformation");
        }else if(productType == 6){ //中石化加油卡充值
            RedirectUtility.navigateTo("/pages/recharge/oilcardrecharge/oilcardrecharge");
        }else if(productType == 7){ //中石油加油卡充值
            
        }else if(productType == 8){ //视频会员充值
            RedirectUtility.navigateTo("/pages/recharge/videorecharge/videorecharge");
        }else if(productType == 9){ //兴业银行开卡
            
        }
    },
    gotoUpdate(){
        let data = this.data.orderDetailInfo;
        
        RedirectUtility.navigateTo("/pages/card/cardinformation/cardinformation?user_name=" + data.product_details[0].customer_name + 
        "&user_card=" + data.product_details[0].id_card_no + "&user_phone=" + data.product_details[0].customer_phone + "&init_pwd=" + data.product_details[0].init_pwd + 
        "&user_province=" + data.product_details[0].province_no + "&user_city=" + data.product_details[0].city_no + "&user_area=" + data.product_details[0].area_street + 
        "&user_addr=" + data.product_details[0].address + "&user_photo_negative=" + data.product_details[0].photo_negative + "&user_photo_positive=" + data.product_details[0].photo_positive +
        "&addr_name=" + data.carriage_info[0].recipient_name + "&addr_phone=" + data.carriage_info[0].recipient_phone + 
        "&addr_province=" + data.carriage_info[0].province_no + "&addr_city=" + data.carriage_info[0].city_no + "&addr_area=" + data.carriage_info[0].area_street + 
        "&addr_addr=" + data.carriage_info[0].recipient_address);
    },
    gotoLogistic(event){ //查看物流
        let status = event.currentTarget.dataset.status;
        if(status){
            RedirectUtility.navigateTo("/pages/users/logisticsinformation/logisticsinformation?orderId=" + this.data.orderDetailInfo.order_no);
        }
    },
    gotoLogistics(){ //查看物流
        RedirectUtility.navigateTo("/pages/users/logisticsinformation/logisticsinformation?orderId=" + this.data.orderDetailInfo.order_no);
    },
    gotoBackMoney(){ //申请退款
        this.setData({
            type: 8
        })
        GuideModalUtil.showGuideModal();
    },
    gotoSure(){ //确认收货
        this.setData({
            type: 7
        })
        GuideModalUtil.showGuideModal();
    }, 
    gotoCloseDialog() {
        GuideModalUtil.closeGuideModal();
    },
    showDialog(){
        this.setData({
            type: 6
        })
        GuideModalUtil.showGuideModal();
    },
    gotoApply(){ //申请退款
        this.gotoCloseDialog();
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.refundMoney,
            params: { 
                order_id: this.data.orderDetailInfo.order_no
            },
            succ: (res) => {
                DialogUtility.tip("订单退款成功");
                wx.navigateBack({
                    delta: 1
                })
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("订单退款失败");
            },
            compelete: () => {
                DialogUtility.close(this);
            }
        })
    },
    gotoReply(){ //确认收货
        this.gotoCloseDialog();
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.sureReceipt,
            params: { 
                main_order_id: this.data.orderDetailInfo.order_no
            },
            succ: (res) => {
                DialogUtility.tip("确认收货成功");
                this.queryOrderDetail(this.data.orderNo);
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("确认收货失败");
            },
            compelete: () => {
                DialogUtility.close(this);
            }
        })
    },
    gotoEvaluate(){  //去评价
        RedirectUtility.navigateTo("/pages/users/ordervaluate/ordervaluate?orderNo=" + this.data.orderDetailInfo.order_no);
    },
    gotoCoupon(){ //查看提货券
        RedirectUtility.navigateTo("/pages/users/coupons/coupons");
    },
    gotoPay(){  //继续支付
        let productData = []
        let templist = this.data.orderDetailInfo.product_details
        for(let i = 0; i < templist.length; i++){
            let data = {
                order_detail_id: templist[i].product_id,
                sale_price: templist[i].sale_price,
                product_count: templist[i].product_count,
                product_name: templist[i].product_name,
                product_flag: templist[i].product_flag || ""
            }
            productData.push(data)
        }

        if(this.data.isSubmit){
            this.data.isSubmit = false;
            DialogUtility.tip("支付中");
            APIUtility.get({
                url: AppConfig.apiList.payAgin,
                params: { 
                    order_no: this.data.orderDetailInfo.order_no
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
                            RedirectUtility.navigateTo("/pages/mall/buysuccess/buysuccess?product_data=" + JSON.stringify(productData) + "&payAmonut=" + this.data.orderDetailInfo.pay_amounts);
                        },
                        fail: (errData) => {
                            console.log("取消支付,关闭订单", errData);
                            if(errData.code == "906"){
                                DialogUtility.tip("订单已支付，请不要重复支付");
                                this.queryOrderDetail(this.data.orderNo);
                            }else{
                                DialogUtility.tip("支付失败");
                            }
                        },
                        complete: (errData) => {
                            console.log("complete", errData);
                            this.data.isSubmit = true;
                        }
                    })
                },
                fail: (errData) => {
                    console.log("订单创建失败", errData);
                },
                compelete: () => {
                    DialogUtility.close(this);
                    setTimeout(() => {
                        this.data.isSubmit = true;
                    }, 1000);
                }
            })
        }
    }
})