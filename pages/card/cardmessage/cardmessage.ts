// pages/login/login.js
import { RedirectUtility } from "../../../utils/redirect";
import { AppConfig } from "../../../config";
import { NumberUtility } from "../../../utils/number";
import { DialogUtility } from "../../../utils/dialog";
import { CommonUtility } from "../../../utils/common";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        name: "",
        IDCards: "",
        address: "",
        province: "",
        city: "",
        provinceNo: "",
        cityNo: "",
        areaNo: "",
        area: "",
        empty: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            name: options.name,
            IDCards: options.idCard,
            province: options.province,
            city: options.city,
            area: options.area,
            address: options.address,
            empty: options.empty
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
    inputNmae(event){
        this.setData({
            name: event.detail.value
        })
    },
    inputIDCard(event){ 
        this.setData({
            IDCards: event.detail.value
        })
    },
    inputAddress(event){
        this.setData({
            address: event.detail.value
        })
    },
    gotoInformation(){    
        if(NumberUtility.trim(this.data.name).length == 0){
            DialogUtility.tip("请输入姓名");
            return;
        }
        if(NumberUtility.trim(this.data.IDCards).length == 0){
            DialogUtility.tip("请输入身份证号码");
            return;
        }
        if(NumberUtility.trim(this.data.IDCards).length != 18){
            DialogUtility.tip("请输入正确的身份证号码");
            return;
        }
        if(!CommonUtility.IdCardValidate(NumberUtility.trim(this.data.IDCards))){
            DialogUtility.tip("请输入正确的身份证号码");
            return;
        }
        if(NumberUtility.trim(this.data.province).length == 0 || NumberUtility.trim(this.data.city).length == 0 || NumberUtility.trim(this.data.area).length == 0){
            DialogUtility.tip("请选择省市区");
            return;
        }
        if(NumberUtility.trim(this.data.address).length == 0){
            DialogUtility.tip("请输入详细地址");
            return;
        }
        let pages = getCurrentPages();
        let curPage = pages[pages.length - 2];
        if(this.data.empty == 2){
            curPage.setData({
                userName: this.data.name,
                IDcards: this.data.IDCards,
                IDaddress: this.data.address,
                IDallAddr: this.data.province + this.data.city + this.data.area + this.data.address,
                IDprovinceName: this.data.province,
                IDcityName: this.data.city,
                IDareaName: this.data.area,
                
                // receivingName: this.data.name,
                
            })
        }else{
            curPage.setData({
                userName: this.data.name,
                IDcards: this.data.IDCards,
                // IDprovince: this.data.provinceNo,
                // IDcity: this.data.cityNo,
                // IDarea: this.data.area,
                IDaddress: this.data.address,
                IDallAddr: this.data.province + this.data.city + this.data.area + this.data.address,
                IDprovinceName: this.data.province,
                IDcityName: this.data.city,
                IDareaName: this.data.area,
            })
        }
        
        wx.navigateBack({
            delta: 1
        })
    },
    bindRegionChange(event){
        let province = ""
        let city = ""
        let area = ""
        let data = event.detail.value;
        if(data[0] == data[1]){
            province = data[0]
            city = data[0]
            area = data[2]
        }else{
            if(data[1] == "县"){
                province = data[0]
                city = data[0]
                area = data[2]
            }else{
                province = data[0]
                city = data[1]
                area = data[2]
            }
        }
        this.setData({
            province: province,
            city: city,
            area: area
        })
    }
})