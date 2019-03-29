import { RedirectUtility } from "../../../utils/redirect";
import { APIUtility } from "../../../utils/api";
import { AppConfig } from "../../../config";
import { DialogUtility } from "../../../utils/dialog";
import { GuideModalUtil } from "../../../utils/guidemodal";

Page({
    /**
     * 页面的初始数据
     */
    data: {
        vCacheData:{},
        vCurrentOrderList: [],
        requestComplete: false,
        clickTab: 0,
        ps: 6,
        hasMoreData: true,
        payDictionaryList: {},
        orderDictionaryList: {},
        isSubmit: true
    },
    queryDictionary(type){
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
                }else {
                    this.queryOrderList(this.data.clickTab, this.data.hasMoreData);
                    this.setData({
                        orderDictionaryList: resultData
                    })
                }
            },
            fail: (error) => {
                console.log(error);
            }
        })
    },
    queryOrderList(type,hasMoreData) {
        DialogUtility.loading("加载中");
        let current = this.data.vCacheData[type]
        if (!current || hasMoreData){ 

            current = (current||{pi:1,dataList:[],hasMoreData:false})
            APIUtility.get({
                url: AppConfig.apiList.queryOrderInfo,
                params: {
                    pi:current.pi,
                    ps: this.data.ps,
                    order_type: type
                },
                succ: (res) => {
                    let list = res.list || [];
                    // for (let key in res.list){
                    //     let item = res.list[key]
                    //     list.push(item)
                    // } 

                    list.map((item)=>{
                        item.payType = this.data.orderDictionaryList[item.pay_type];
                        item.payStatus = this.data.payDictionaryList[item.detail_status];
                        item.statusDesc = this.data.orderDictionaryList[item.pay_type] + "-" + this.data.payDictionaryList[item.detail_status];
                        item.total_amount = (item.total_amount / 100.00).toFixed(2);
                        item.pay_amounts = (item.pay_amount / 100.00).toFixed(2);
                        item.total_cost = (item.total_cost / 100.00).toFixed(2);
                        item.discount_amount = (item.discount_amount / 100.00).toFixed(2);
                        item.refund_amount = (item.refund_amount / 100.00).toFixed(2);
                        let detail = item.product_details;
                        detail.map((items) => {
                            items.sale_prices = items.discount_amount || items.discount_amount != 0 ? ((parseInt(items.sale_price) - parseInt(items.discount_amount)) / 100.00).toFixed(2) : (items.sale_price / 100.00).toFixed(2);
                            items.face = (items.face / 100.00).toFixed(2);
                            items.cover_img = AppConfig.imageAddr + items.cover_img;
                        })
                        
                    })

                    let cacheList =current.dataList
                    
                    if(list.length < this.data.ps){
                        this.data.vCacheData[type]= { dataList: cacheList.concat(list),pi:current.pi,hasMoreData:false}
                        this.setData({
                            vCurrentOrderList: cacheList.concat(list),
                            hasMoreData: false
                        })
                    }else{
                        this.data.vCacheData[type]= { dataList: cacheList.concat(list),pi:current.pi+1,hasMoreData:true}
                        this.setData({
                            vCurrentOrderList: cacheList.concat(list),
                            hasMoreData: true,
                            pi: current.pi + 1
                        })
                    }
                },
                fail: (error) => {
                    console.log(error);
                    DialogUtility.tip("加载失败");
                },
                compelete: () => {
                    this.setData({ requestComplete: true });
                    DialogUtility.close(this);
                }
            })
        }else{
            DialogUtility.close(this);
            this.setData({
                vCurrentOrderList: current.dataList,
                hasMoreData: current.hasMoreData,
                pi: current.pi
            })
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        
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
        this.setData({
            vCurrentOrderList: {}
        })
        this.data.vCacheData = {};
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
    switchTab(event) {
        let currentType = event.currentTarget.dataset.type;
        this.setData({
            clickTab: currentType,
            // vCurrentOrderList: []
        });
        let current = this.data.vCacheData[currentType]
        if(current){
            this.queryOrderList(currentType, current.hasMoreData);
        }else{
            this.queryOrderList(currentType, this.data.hasMoreData);
        }
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.data.vCacheData[this.data.clickTab] = undefined;
        this.data.vCurrentOrderList = []; 
        this.queryOrderList(this.data.clickTab,this.data.hasMoreData);
        wx.stopPullDownRefresh();
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.hasMoreData) {
            this.queryOrderList(this.data.clickTab,this.data.hasMoreData);
        } else {
            DialogUtility.tip("没有更多数据");
        }
    },
    gotoOrderDetail(event) {
        let currentIndex = event.currentTarget.dataset.index;
        let productType = event.currentTarget.dataset.type;
        RedirectUtility.navigateTo("/pages/users/orderdetail/orderdetail?orderNo=" + currentIndex);
    },
    gotoPay(event){
        let order = event.currentTarget.dataset.order;
        if(!order){
            return;
        }
        let productData = []
        for(let i = 0; i < order.product_details.length; i++){
            let data = {
                order_detail_id: order.product_details[i].product_id,
                sale_price: order.product_details[i].sale_price,
                product_count: order.product_details[i].product_num,
                product_name: order.product_details[i].product_name,
                product_flag: order.product_details[i].product_flag || ""
            }
            productData.push(data)
        }

        console.log("--------------------", productData);
        
        if(this.data.isSubmit){
            this.data.isSubmit = false;
            DialogUtility.tip("支付中");
            APIUtility.get({
                url: AppConfig.apiList.payAgin,
                params: { order_no: order.order_no},
                succ: (res) => {
                    let result = res.data
                    wx.requestPayment({
                        timeStamp: result.timeStamp + "",
                        nonceStr: result.nonceStr,
                        package: result.package,
                        signType: result.signType,
                        paySign: result.paySign,
                        success: (res) => {
                            RedirectUtility.navigateTo("/pages/mall/buysuccess/buysuccess?product_data=" + JSON.stringify(productData) + "&payAmonut=" + order.pay_amounts);
                        },
                        fail: (errData) => {
                            console.log("取消支付,关闭订单", errData);
                            if(errData.code == "906"){
                                DialogUtility.tip("订单已支付，请不要重复支付");
                                this.queryOrderList(this.data.clickTab, this.data.hasMoreData);
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
    },
    gotoLogistics(event){ //查看物流
        let order = event.currentTarget.dataset.order;
        if(!order){
            return;
        }
        RedirectUtility.navigateTo("/pages/users/logisticsinformation/logisticsinformation?orderId=" + order.order_no);
    },
    gotoEvaluate(event){  //去评价
        let order = event.currentTarget.dataset.order;
        if(!order){
            return;
        }
        RedirectUtility.navigateTo("/pages/users/ordervaluate/ordervaluate?orderNo=" + order.order_no);
    },
    gotoSure(event){ //确认收货
        let order = event.currentTarget.dataset.order;
        if(!order){
            return;
        }
        this.setData({
            type: 7,
            order_no: order.order_no
        })
        GuideModalUtil.showGuideModal();
    }, 
    gotoCloseDialog() {
        GuideModalUtil.closeGuideModal();
    },
    gotoReply(){ //确认收货
        this.gotoCloseDialog();
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.sureReceipt,
            params: { 
                main_order_id: this.data.order_no
            },
            succ: (res) => {
                DialogUtility.tip("确认收货成功");
                this.data.vCacheData[this.data.clickTab] = undefined;
                this.data.vCurrentOrderList = []; 
                this.queryOrderList(this.data.clickTab,this.data.hasMoreData);
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("确认收货失败");
            },
            compelete: () => {
                DialogUtility.close(this);
            }
        })
    }
})