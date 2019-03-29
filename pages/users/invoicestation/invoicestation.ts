import { RedirectUtility } from "../../../utils/redirect";
import { DialogUtility } from "../../../utils/dialog";
import { QRCodeApi } from "../../../utils/qrcode";
import { AppConfig } from "../../../config";
import { APIUtility } from "../../../utils/api";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        bankUrl: "",
        invoiceName: "",
        invoiceCode: "",
        invoiceType: "",

        showQR: false,
        isHaveDefaultTt: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.queryInvoiceList()
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
        this.showQRs();
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
    chooseTt(){
        //选择发票抬头
        RedirectUtility.navigateTo("/pages/users/myinvoicelist/myinvoicelist?type=" + "000");
    },
    queryInvoiceList(){
        APIUtility.get({
            url: AppConfig.apiList.queryInvoiceTtList,
            params: {},
            succ: (res) => {
                let isDefaultTt = false;
                for (let i = 0; i < res.data.length; i++) {
                    if (res.data[i].is_default == 0) {
                        isDefaultTt = true;
                        this.setData({
                            isHaveDefaultTt: true, //是否有默认地址

                            invoiceName: res.data[i].invoice_title,
                            invoiceCode: res.data[i].invoice_no,
                            invoiceType: res.data[i].invoice_man_type,
                        })
                    }
                }
                
                if(!isDefaultTt){
                    RedirectUtility.navigateTo("/pages/users/myinvoicelist/myinvoicelist?type=" + "000");
                    DialogUtility.tip("请先选择发票抬头");
                }
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
    showQRs(){
        if(!this.data.showQR){
            QRCodeApi.draw(this.data.invoiceCode, "couponNoCanvas", 200, 200);
        }
    }
})