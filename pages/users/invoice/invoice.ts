import { RedirectUtility } from "../../../utils/redirect";
import { DialogUtility } from "../../../utils/dialog";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        shareTag: "0",
        scene: "0",
        bankUrl: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options.shareTag) {
            this.setData({
                shareTag: options.shareTag
            })
        }
        if (options.scene) {
            this.setData({
                scene: options.scene
            })
        }
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
        wx.stopPullDownRefresh();
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
            path: '/pages/home/home?page_type=10',
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
    shopInvoice(){
        RedirectUtility.navigateTo("/pages/users/myinvoice/myinvoice");
    },
    stationInvoice(){
        RedirectUtility.navigateTo("/pages/users/invoicestation/invoicestation");
    },
    invoiceHistory(){
        RedirectUtility.navigateTo("/pages/users/invoicehistory/invoicehistory");
    },
    invoiceInfo(){
        RedirectUtility.navigateTo("/pages/users/myinvoicelist/myinvoicelist");
        
    }
})