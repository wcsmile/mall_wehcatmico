import { RedirectUtility } from "../../../utils/redirect";
import { DialogUtility } from "../../../utils/dialog";
import { AppConfig } from "../../../config";
import { APIUtility } from "../../../utils/api";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        personalChecked: true,
        companyChecked: false,
        invoiceDefault: false,

        personalName: "",
        personalPhone: "",
        companyName: "",
        companyCode: "",
        companyAddr: "",
        companyPhone: "",
        companyBankName: "",
        companyBankCode: "",

        type: "",
    },
    setTitle(title){  //设置标题
        wx.setNavigationBarTitle({  
            title: title
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log("-------------", options);
        
        this.setData({
            type: options.type, //1 个人 2 企业
            invoiceId: options.id || "",
            personalChecked: options.invoice_man_type == 2 ? false : true,
            companyChecked: options.invoice_man_type == 2 ? true : false,

            personalName: options.invoice_man_type == 2 ? "" : (options.invoice_title || ""),
            personalPhone: options.invoice_man_type == 2 ? "" : (options.invoice_no || ""),
            companyName: options.invoice_man_type == 2 ? (options.invoice_title || "") : "",
            companyCode: options.invoice_man_type == 2 ? (options.invoice_no || "") : "",
            companyAddr: options.company_address || "",
            companyPhone: options.phone_no || "",
            companyBankName: options.open_bank || "",
            companyBankCode: options.bank_account || "",
            invoiceDefault: options.is_default == 0 ? true : false, 
        })
        if(this.data.type == 0){
            this.setTitle("新增发票抬头")
        }else{
            this.setTitle("编辑发票抬头")
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
    changePersonalStatus(event){
        if(!this.data.personalChecked && this.data.companyChecked){
            this.setData({
                personalChecked: true,
                companyChecked: false,
                companyName: "",
                companyCode: "",
                companyAddr: "",
                companyPhone: "",
                companyBankName: "",
                companyBankCode: "",
            })
        }
    },
    changeCompanyStatus(event){
        if(this.data.personalChecked && !this.data.companyChecked){
            this.setData({
                personalChecked: false,
                companyChecked: true,
                personalName: "",
                personalPhone: ""
            })
        }
    },
    inputPersonalName(event){
        this.setData({
            personalName: event.detail.value,
        })
    },
    inputPersonalPhone(event){
        this.setData({
            personalPhone: event.detail.value,
        })
    },
    inputCompanyName(event){
        this.setData({
            companyName: event.detail.value,
        })
    },
    inputCompanyCode(event){
        this.setData({
            companyCode: event.detail.value,
        })
    },
    inputCompanyAddr(event){
        this.setData({
            companyAddr: event.detail.value,
        })
    },
    inputCompanyPhone(event){
        this.setData({
            companyPhone: event.detail.value,
        })
    },
    inputCompanyBankName(event){
        this.setData({
            companyBankName: event.detail.value,
        })
    },
    inputCompanyBankCode(event){
        this.setData({
            companyBankCode: event.detail.value,
        })
    },
    gotoSetDefault(){
        this.setData({
            invoiceDefault: !this.data.invoiceDefault
        })
    },
    gotoSure(){
        //添加抬头
        if(!this.data.personalChecked && this.data.companyChecked){
            if(!this.data.companyName){
                DialogUtility.tip("请输入企业名称");
                return;
            }
            if(!this.data.companyCode){
                DialogUtility.tip("请输入企业纳税识别号");
                return;
            }
        }else if(this.data.personalChecked && !this.data.companyChecked){
            if(!this.data.personalName){
                DialogUtility.tip("请输入姓名或车牌号");
                return;
            }
        }
        
        if(this.data.type == 0){
            this.addTt();
        }else{
            this.updateTt();
        }
        
    },
    addTt(){ //添加抬头
        let params = { //1:个人 2企业
            invoice_man_type: this.data.personalChecked && !this.data.companyChecked ? 1 : 2,  //1.个人  2.企业
            invoice_title: this.data.personalChecked && !this.data.companyChecked ? (this.data.personalName) : this.data.companyName,
            invoice_no: this.data.personalChecked && !this.data.companyChecked ? (this.data.personalPhone) : this.data.companyCode,
            open_bank: this.data.companyBankName,
            bank_account: this.data.companyBankCode,
            company_address: this.data.companyAddr,
            phone_no: this.data.companyPhone,
            is_default: this.data.invoiceDefault ? 0 : 1,
        }
        DialogUtility.loading("添加中");
        APIUtility.get({
            url: AppConfig.apiList.addInvoiceTt,
            params: params,
            succ: (res) => {
                DialogUtility.tip("添加发票抬头成功");
                setTimeout(() => {
                    wx.navigateBack({
                        delta: 1
                    })
                }, 500);
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("发票抬头添加失败");
            },
            compelete: () => {
                DialogUtility.close(this);
            }
        })
    },
    updateTt(){ //修改抬头
        let params = {
            id: this.data.invoiceId,
            invoice_man_type: this.data.personalChecked && !this.data.companyChecked ? 1 : 2,  //1.个人  2.企业
            invoice_title: this.data.personalChecked && !this.data.companyChecked ? (this.data.personalName) : this.data.companyName,
            invoice_no: this.data.personalChecked && !this.data.companyChecked ? (this.data.personalPhone) : this.data.companyCode,
            open_bank: this.data.companyBankName,
            bank_account: this.data.companyBankCode,
            company_address: this.data.companyAddr,
            phone_no: this.data.companyPhone,
            is_default: this.data.invoiceDefault ? 0 : 1,
        }
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.editInvoiceTt,
            params: params,
            succ: (res) => {
                DialogUtility.tip("修改发票抬头成功");
                setTimeout(() => {
                    wx.navigateBack({
                        delta: 1
                    })
                }, 500);
            },
            fail: (error) => {
                console.log(error);
            },
            compelete: () => {
                DialogUtility.close(this);
            }
        })
    }
})