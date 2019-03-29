// pages/login/login.js
import { GuideModalUtil } from "../../../utils/guidemodal";
import { RedirectUtility } from "../../../utils/redirect"
Page({

    /**
     * 页面的初始数据
     */
    data: {
        type: 0,
        mGoodsList: [],
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
        this.queryGoodsList();
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
        this.queryGoodsList();
        wx.stopPullDownRefresh();
    },
  
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
    
    },
    queryGoodsList() {
        // let list= [];
        // for(let i =0; i< 10;i++){
        //     let record = {
        //         goods_jifen: "562222",
        //         goods_image: "http://static.100bm.cn/jifen/code.png",
        //         goods_name: "加油券",
        //         goods_price: "40.00",
        //         goods_ischange: false
        //     }
        //     list.push(record);
        // }
        // this.setData({
        //     requestComplete: true,
        //     mGoodsList: list
        // });
        
    },
  
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
      return {
        title: '自定义转发标题',
        path: '/page/user?id=123',
        success: function (res) {
            // 转发成功
        },
        fail: function (res) {
            // 转发失败
        }
      }
    },
    showDialog(){
        this.setData({
            type:1
        })
        GuideModalUtil.showGuideModal();
    },
    closeGuideModal() {
        GuideModalUtil.closeGuideModal();
    },
    sureChange(){
        RedirectUtility.navigateTo("/pages/jf/coupon/coupon");
        this.closeGuideModal();
    }
})