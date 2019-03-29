import { RedirectUtility } from "../../../utils/redirect"
Page({

    /**
     * 页面的初始数据
     */
    data: {
        mRecordList: [],
        requestComplete: false
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
        this.queryRecordList();
    },

    queryRecordList() {
        let list= [];
        for(let i =0; i< 10;i++){
            let record = {
                record_name: "大宝燃油宝55ml",
                record_num: "-100积分",
                record_date: "2018-1-12 14:52",
                record_phone: "13655654586"
            }
            list.push(record);
        }
        this.setData({
            requestComplete: true,
            mRecordList: list
        });
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
        this.queryRecordList();
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },
    gotoDetail(){
        RedirectUtility.navigateTo("/pages/users/coupondetail/coupondetail");
    }
})