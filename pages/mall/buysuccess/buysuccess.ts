// pages/login/login.js
import { GuideModalUtil } from "../../../utils/guidemodal";
import { RedirectUtility } from "../../../utils/redirect"
Page({

    /**
     * 页面的初始数据
     */
    data: {
        
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let productData = JSON.parse(options.product_data);
        if(!productData){
            return
        }
        let isShow = false;
        for(let i = 0; i < productData.length; i++){
            if((productData[i].product_flag & 32) == 32){
                isShow = true
            }
        }
        this.setData({ 
            productData: productData,
            totalMoney: options.payAmonut,
            isShow: isShow,
            type: options.type || "3000"
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
            title: '品质生活  优惠多多',
            path: '/pages/home/home?page_type=0',
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
        this.setData({
            type: 5
        })
        GuideModalUtil.showGuideModal();
    },
    closeGuideModal() {
        GuideModalUtil.closeGuideModal();
    },
    gotoGoodsCoupon() {
        RedirectUtility.navigateTo("/pages/users/coupons/coupons");
    },
    gotoHome(){
        RedirectUtility.switchTab("/pages/home/home")
    },
    gotoGoodsOrder(){
        RedirectUtility.navigateTo("/pages/users/order/order");
    },
    gotoInvoice(){
        RedirectUtility.navigateTo("/pages/users/invoicehistory/invoicehistory");
    }
})