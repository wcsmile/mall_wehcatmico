import { RedirectUtility } from "../../../utils/redirect";
import { DialogUtility } from "../../../utils/dialog";
import { AppConfig } from "../../../config";
import { APIUtility } from "../../../utils/api";
import { GuideModalUtil } from "../../../utils/guidemodal";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        invoiceList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            type: options.type
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },
    queryInvoiceTtList(){
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryInvoiceTtList,
            params: {},
            succ: (res) => {
                this.setData({
                    invoiceList: res.data
                })
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("发票抬头列表获取失败");
            },
            compelete: () => {
                DialogUtility.close(this);
            }
        })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.queryInvoiceTtList();
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
            path: '/pages/home/home',
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
    chooseInvoiceTt(event){
        //选择发票抬头
        if(this.data.type != "000"){
            return
        }
        let index = event.currentTarget.dataset.index;
        let invoiceList = this.data.invoiceList;
        let pages = getCurrentPages();
        let curPage = pages[pages.length - 2];
        curPage.setData({
            invoiceName: invoiceList[index].invoice_title,
            invoiceCode: invoiceList[index].invoice_no,
            invoiceType: invoiceList[index].invoice_man_type,
        })
        wx.navigateBack({
            delta: 1
        })
    },
    editTt(event){
        //编辑
        RedirectUtility.navigateTo("/pages/users/updateinvoice/updateinvoice?type=1");
    },
    gotoAddInvoiceTt(){
        //新增
        RedirectUtility.navigateTo("/pages/users/updateinvoice/updateinvoice?type=0");
    },
    gotoUpdateTt(event){
        let index = event.currentTarget.dataset.index;
        let invoiceList = this.data.invoiceList
        RedirectUtility.navigateTo("/pages/users/updateinvoice/updateinvoice?type=" + "1" + "&id=" + invoiceList[index].id + 
        "&invoice_title=" + invoiceList[index].invoice_title + "&invoice_no=" + invoiceList[index].invoice_no + 
        "&company_address=" + invoiceList[index].company_address + "&invoice_man_type=" + invoiceList[index].invoice_man_type + 
        "&is_default=" + invoiceList[index].is_default + "&open_bank=" + invoiceList[index].open_bank + "&phone_no=" + invoiceList[index].phone_no  + 
        "&bank_account=" + invoiceList[index].bank_account);
    },
    delTt(event){ //删除地址
        let index = event.currentTarget.dataset.index;
        
        this.setData({
            type: 10,
            delIndex: index
        })
        GuideModalUtil.showGuideModal();
    },
    setDefaultTt(event){ //设置默认地址
        let index = event.currentTarget.dataset.index;
        let invoiceList = this.data.invoiceList
        if(invoiceList[index].is_default == 0){
            return
        }
        DialogUtility.loading("设置中");
        APIUtility.get({
            url: AppConfig.apiList.setDefaultInvoice,
            params: { 
                id: invoiceList[index].id
            },
            succ: (res) => {
                DialogUtility.tip("默认发票抬头设置成功");
                this.queryInvoiceTtList();
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("默认发票抬头设置失败");
            },
            compelete: () => {
                DialogUtility.close(this);
            }
        })
    },
    gotoDel(){ //确认删除
        this.gotoCloseDialog();
        let invoiceList = this.data.invoiceList
        DialogUtility.loading("删除中");
        APIUtility.get({
            url: AppConfig.apiList.delInvoiceTt,
            params: { 
                id: invoiceList[this.data.delIndex].id
            },
            succ: (res) => {
                this.queryInvoiceTtList();
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("发票抬头删除失败");
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