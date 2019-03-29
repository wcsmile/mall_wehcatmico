import { RedirectUtility } from "../../utils/redirect";
import { NumberUtility } from "../../utils/number";
import { APIUtility } from "../../utils/api";
import { AppConfig } from "../../config";
import { DialogUtility } from "../../utils/dialog";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isSubmit: true,
        distributionTag: "9876543210",
        userName: "",
        phone: "",
        bankList: [],
        shareTag: "9876543210",
        scene: "2002",
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if(options.shareTag){
            this.setData({
                shareTag: options.shareTag || this.data.distributionTag
            })
        }
        if(options.scene){
            this.setData({
                scene: options.scene || "2002"
            })
        }
        this.queryProductList();
    },
    queryProductList(){
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryBankProductList,
            params: { distribution_tag: this.data.distributionTag },
            succ: (res) => {
                this.setData({
                    bankList: res
                })
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
    inputUserName(event){
        this.setData({
            userName: event.detail.value
        })
    },
    inputPhone(event){
        this.setData({
            phone: event.detail.value
        })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: '品质生活  优惠多多',
            path: '/pages/home/home?page_type=2',
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
    gotoJoin(){
        if(!this.data.userName){
            DialogUtility.tip("请输入姓名");
            return;
        }
        if(!this.data.phone){
            DialogUtility.tip("请输入手机号码");
            return;
        }
        if(NumberUtility.trim(this.data.phone).length != 11 || !NumberUtility.phoneValid(this.data.phone)){
            DialogUtility.tip("请输入正确的手机号码");
            return;
        }
        if(this.data.distributionTag != this.data.bankList.curr_tag){ //不同tag

        }
        if(this.data.isSubmit){
            this.data.isSubmit = false;
            let queryParms = [];
            let data = {
               username: NumberUtility.trim(this.data.userName),
               phone: NumberUtility.trim(this.data.phone)   //运营商类型
            };

            let parm = {product_id: this.data.bankList.list[0].product_id, product_num: 1, ext_data: JSON.stringify(data) };
            queryParms.push(parm);
            DialogUtility.loading("下单中，请稍候");
            APIUtility.get({
                url: AppConfig.apiList.orderRequest,
                params: { 
                    product_data: queryParms,
                    order_type: "2002", //兴业银行办卡
                    share_tag: this.data.shareTag,
                    scene: this.data.scene
                },
                succ: (res) => {
                    RedirectUtility.navigateTo("/pages/cibbank/cibbank")
                },
                fail: (errData) => {
                    console.log("订单创建失败", errData);
                    DialogUtility.tip(this.data.codeList[errData.code] || "订单创建失败");
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