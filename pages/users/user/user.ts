// pages/login/login.js
import { RedirectUtility } from "../../../utils/redirect";
import { UserUtility } from "../../../utils/user";
import { APIUtility } from "../../../utils/api";
import { AppConfig } from "../../../config";
import { DialogUtility } from "../../../utils/dialog";

Page({
    /**
     * 页面的初始数据
     */
    data: {
        nickName: "",
        avatarUrl: AppConfig.defaultUserHeadImg,
        currentCode: "",
        getUserInfoComplete: false,
        isShowRecord: false
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        let list = []
        list.push({image: "http://static.100bm.cn/mall/ui/default/ic_coupon.png?v=3", name:"优惠券包"})
        list.push({image: "http://static.100bm.cn/mall/ui/default/ic_collection.png", name:"已关注商品"})
        list.push({image: "http://static.100bm.cn/mall/ui/default/ic_invoice.png", name:"发票信息"})
        this.setData({
            menusList: list,
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        this.getCurrentCode();
        this.queryUserInfo();
        this.queryUserOrderInfo();
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
        this.queryUserInfo();
        this.queryUserOrderInfo();
        wx.stopPullDownRefresh();
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom () {

    },
    getCurrentCode() {
        wx.login({
            success: (res) => {
                if (res.code) {
                    this.setData({ currentCode: res.code });
                } else {
                    console.log('获取用户登录态失败！' + res.errMsg)
                }
            }
        });
    },
    checkApi() {
        if (!wx.canIUse('button.open-type.getUserInfo')) {
            wx.showModal({
                title: "微信版本太旧",
                content: "使用旧版本微信，将无法登录、使用一些功能。请更新微信至最新版本。",
                showCancel: false,
                confirmText: "知道了",
                success: (res) => {
                    UserUtility.getUserInfo(this.data.currentCode, (userInfo) => {
                        this.updateUserInfo(userInfo.nickName, userInfo.headImg, 0, 0, 0);
                    });
                },
            });
        }
    },
    getUserInfoHandler(res) {
        this.setData({ getUserInfoComplete: true });
        let userInfo = res.detail.userInfo;
        if (!userInfo) {
            return;
        }
        
        this.updateUserInfo(userInfo.nickName, userInfo.avatarUrl);

        UserUtility.saveUserInfo(this.data.currentCode, res.detail);
    },
    queryUserInfo() {
        APIUtility.get({
            url: AppConfig.apiList.queryUserInfo,
            succ: (res) => {
                let userInfo = res.userInfo;
                if (!userInfo) {
                    return;
                }
                this.updateUserInfo(userInfo.fans_name, userInfo.head_img_url);
            }
        })
    },
    queryUserOrderInfo() { //获取用户积分
        APIUtility.get({
            url: AppConfig.apiList.queryUserOrderInfo,
            succ: (res) => {
                this.setData({
                    userOrderInfo: res
                })
            }
        })
    },
    // 绑定数据
    updateUserInfo(nickNamess, headImg) {
        this.setData({
            nickName: nickNamess,
            avatarUrl: headImg.indexOf("http") == -1 ? AppConfig.defaultUserHeadImg : headImg
        })
    },
    gotoMenus(event){
        let index = event.currentTarget.dataset.index;
        if(index == 0){ //优惠券包
            RedirectUtility.navigateTo("/pages/users/coupons/coupons");
        }else if(index == 1){ //已关注商品
            RedirectUtility.navigateTo("/pages/users/mycollection/mycollection");
        }else if(index == 2){ //发票信息
            // RedirectUtility.navigateTo("/pages/users/myinvoice/myinvoice");
            RedirectUtility.navigateTo("/pages/users/invoice/invoice");
        }
    },
    myRecord() {
        RedirectUtility.navigateTo("/pages/users/record/record");    
    },
    myQuestion() {        
        RedirectUtility.navigateTo("/pages/users/question/question");
    },
    myOrder(){
        RedirectUtility.navigateTo("/pages/users/order/order");
    },
    myDistribution(){
        
    },
    myAddress(){
        RedirectUtility.navigateTo("/pages/users/receivingaddress/receivingaddress");
    }
})