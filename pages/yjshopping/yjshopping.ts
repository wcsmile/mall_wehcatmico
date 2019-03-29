import { DialogUtility } from "../../utils/dialog";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        shareTag: "0",
        scene: "0"
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
        if (options.shoppingUrl) {
            let urls = decodeURIComponent(options.shoppingUrl);
            this.setData({ 
                shoppingUrl: urls
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
            path: '/pages/home/home?page_type=11&urls=' + this.data.shoppingUrl,
            success: function (res) {
                // 转发成功
                console.log("转发成功！");
            },
            fail: function (res) {
                // 转发失败
                console.log("转发失败！");
            }
        }
    }
})