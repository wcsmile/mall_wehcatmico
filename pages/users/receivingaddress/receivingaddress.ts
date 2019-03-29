import { APIUtility } from "../../../utils/api";
import { AppConfig } from "../../../config";
import { DialogUtility } from "../../../utils/dialog";
import { RedirectUtility } from "../../../utils/redirect";
import { GuideModalUtil } from "../../../utils/guidemodal";

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
        this.setData({
            type: options.type || ""
        })
    },
    queryAddressList(){
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryMyAddressList,
            succ: (res) => {
                this.setData({
                    addressList: res.list
                })
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("收货地址加载失败");
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
        this.queryAddressList();
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
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.queryAddressList();
        wx.stopPullDownRefresh();
    },
    gotoUpdateAddr(event){
        let index = event.currentTarget.dataset.index;
        let addrList = this.data.addressList
        RedirectUtility.navigateTo("/pages/users/updateaddress/updateaddress?type=" + "1" + "&id=" + addrList[index].express_id + "&name=" + addrList[index].recipient + 
        "&phone=" + addrList[index].contact_no + "&province=" + addrList[index].province + "&city=" + addrList[index].city + "&area=" + addrList[index].area_street + 
        "&town=" + addrList[index].town + "&provinceCode=" + addrList[index].province_code + "&cityCode=" + addrList[index].city_code + "&areaCode=" + addrList[index].area_street_code + 
        "&townCode=" + addrList[index].town_code + "&address=" + addrList[index].address + "&default=" + addrList[index].is_default);
    },
    gotoAddAddr(){
        RedirectUtility.navigateTo("/pages/users/updateaddress/updateaddress?type=" + "0");
    },
    delAddress(event){ //删除地址
        let index = event.currentTarget.dataset.index;
        this.setData({
            type: 9,
            delIndex: index
        })
        GuideModalUtil.showGuideModal();
    },
    setDefaultAddress(event){ //设置默认地址
        let index = event.currentTarget.dataset.index;
        let addrList = this.data.addressList
        if(addrList[index].is_default == 0){
            return
        }
        DialogUtility.loading("设置中");
        APIUtility.get({
            url: AppConfig.apiList.defaultMyAddress,
            params: { 
                express_id: addrList[index].express_id
            },
            succ: (res) => {
                DialogUtility.tip("默认地址设置成功");
                this.queryAddressList();
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("默认收货地址设置失败");
            },
            compelete: () => {
                DialogUtility.close(this);
            }
        })
    },
    chooseAddress(event){ //选择收货地址并返回到下单页
        if(this.data.type != "000"){
            return
        }
        let index = event.currentTarget.dataset.index;
        let addrList = this.data.addressList;
        let pages = getCurrentPages();
        let curPage = pages[pages.length - 2];
        curPage.setData({
            receivingName: addrList[index].recipient,
            reveivingPhone: addrList[index].contact_no,
            receivingProvinceName: addrList[index].province,
            receivingCityName: addrList[index].city,
            receivingAreaName: addrList[index].area_street,
            receivingTownName: addrList[index].town,
            receivingAddress: addrList[index].address,

            receivingProvinceCode: addrList[index].province_code,
            receivingCityCode: addrList[index].city_code,
            receivingAreaCode: addrList[index].area_street_code,
            receivingTownCode: addrList[index].town_code,
        })
        wx.navigateBack({
            delta: 1
        })
    },
    gotoDel(){ //确认删除
        this.gotoCloseDialog();
        let addrList = this.data.addressList
        DialogUtility.loading("删除中");
        APIUtility.get({
            url: AppConfig.apiList.delMyAddress,
            params: { 
                express_id: addrList[this.data.delIndex].express_id
            },
            succ: (res) => {
                this.queryAddressList();
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("收货地址删除失败");
            },
            compelete: () => {
                DialogUtility.close(this);
            }
        })
    }, 
    gotoCloseDialog() {
        GuideModalUtil.closeGuideModal();
    }
})