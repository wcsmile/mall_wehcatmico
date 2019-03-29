// pages/login/login.js
import { RedirectUtility } from "../../../utils/redirect";
import { AppConfig } from "../../../config";
import { APIUtility } from "../../../utils/api";
import { DialogUtility } from "../../../utils/dialog";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        invoiceHistoryList: [],
        invoiceType: {
            "0": "开票完成",
            "10": "等待支付", 
            "20": "正在开票",  
            "80": "退款成功",  
            "81": "等待退款",  
            "82": "正在退款",  
            "85": "退款失败，人工",  
            "90": "开票失败", 
            "99": "关闭交易"
        },
        isSubmit: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.queryIncoiceHistoryList();
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },
    queryIncoiceHistoryList(){
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryInvoiceHistoryList,
            succ: (res) => {
                res.data.map((item) => {
                    item.invoice_amounts = (item.invoice_amount / 100).toFixed(2);
                    item.pay_amounts = (item.pay_amount / 100).toFixed(2);
                    item.invoice_status = this.data.invoiceType[item.status]
                })
                this.setData({
                    invoiceHistoryList: res.data
                })
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("发票列表加载失败");
            },
            compelete: () => {
                DialogUtility.close(this);
            }
        })
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
        this.queryIncoiceHistoryList();
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },
    gotoPay(event){
        let record = event.currentTarget.dataset.record;
        if(!record){
            return;
        }
        let productData = []
        let data = {
            order_detail_id: "",
            sale_price: record.invoice_amount,
            product_count: 1,
            product_name: record.invoice_title + "发票",
            product_flag: ""
        }
        productData.push(data)

        console.log("--------------------", productData);
        
        if(this.data.isSubmit){
            this.data.isSubmit = false;
            DialogUtility.tip("支付中");
            APIUtility.get({
                url: AppConfig.apiList.payAginInvoice,
                params: { invoice_record_id: record.record_id},
                succ: (res) => {
                    let result = res.data
                    wx.requestPayment({
                        timeStamp: result.timeStamp + "",
                        nonceStr: result.nonceStr,
                        package: result.package,
                        signType: result.signType,
                        paySign: result.paySign,
                        success: (res) => {
                            RedirectUtility.navigateTo("/pages/mall/buysuccess/buysuccess?product_data=" + JSON.stringify(productData) + "&payAmonut=" + record.pay_amounts  + "&type=3002");
                        },
                        fail: (errData) => {
                            console.log("取消支付,关闭订单", errData);
                            if(errData.code == "906"){
                                DialogUtility.tip("订单已支付，请不要重复支付");
                                this.queryIncoiceHistoryList();
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