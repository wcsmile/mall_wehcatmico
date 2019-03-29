// pages/login/login.js
import { RedirectUtility } from "../../../utils/redirect";
import { AppConfig } from "../../../config";
import { DialogUtility } from "../../../utils/dialog";
import { APIUtility } from "../../../utils/api";
import { NumberUtility } from "../../../utils/number";
import { AddressUtil } from "../../../utils/address";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        name: "",
        phone: "",
        province: "",
        city: "",
        provinceNo: "",
        cityNo: "",
        area: "",
        areaNo: "",
        address: "",
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            name: options.name,
            phone: options.phone,
            province: options.province,
            city: options.city,
            area: options.area,
            address: options.address
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
    inputPhone(event){
        this.setData({
            phone: event.detail.value
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
        if(NumberUtility.trim(this.data.phone).length == 0){
            DialogUtility.tip("请输入手机号码");
            return;
        }
        if(NumberUtility.trim(this.data.phone).length != 11 || !NumberUtility.phoneValid(this.data.phone)){
            DialogUtility.tip("请输入正确的手机号码");
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
        curPage.setData({
            receivingName: this.data.name,
            reveivingPhone: this.data.phone,
            // receivingProvince: this.data.provinceNo,
            // receivingCity: this.data.cityNo,
            // receivingArea: this.data.areaNo,
            receivingAddress: this.data.address,
            receivingAllAddr: this.data.province + this.data.city + this.data.area + this.data.address,
            receivingProvinceName: this.data.province,
            receivingCityName: this.data.city,
            receivingAreaName: this.data.area,
        })
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