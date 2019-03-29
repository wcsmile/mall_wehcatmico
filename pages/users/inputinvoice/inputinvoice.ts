// pages/login/login.js
import { RedirectUtility } from "../../../utils/redirect";
import { AppConfig } from "../../../config";
import { APIUtility } from "../../../utils/api";
import { DialogUtility } from "../../../utils/dialog";
import { NumberUtility } from "../../../utils/number";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        invoiceName: "",
        invoiceCode: "",
        invoiceType: "",

        receivingName: "",
        reveivingPhone: "",
        receivingProvinceName: "",
        receivingCityName: "",
        receivingAreaName: "",
        receivingTownName: "",
        receivingAddress: "",

        receivingProvinceCode: "",
        receivingCityCode: "",
        receivingAreaCode: "",
        receivingTownCode: "",

        isHaveDefaultAddr: "",
        postages: "0",
        totalMoney: "0"
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            payAmount: parseInt(options.payAmount),
            payAmounts: (options.payAmount / 100.00).toFixed(2),
            orderIds: options.orderIds,
            productPostage: parseInt(options.postage)
        })
        console.log("-----------返回数据-------", this.data.payAmount, this.data.orderIds, this.data.productPostage);
        
        this.queryInvoiceList();
        this.queryAddressList();
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
        if (!this.data.receivingProvinceName || !this.data.receivingCityName || !this.data.receivingAreaName || !this.data.receivingAddress) {
            this.setData({
                isHaveDefaultAddr: false
            })
            return;
        }
        this.setData({
            isHaveDefaultAddr: true
        })
        this.calculationMoney(); //计算金额
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
    queryPostage(){
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryInvoicePostage,
            succ: (res) => {
                this.setData({
                    postageList: res.data || []
                })
                if(!this.data.isHaveDefaultAddr){
                    DialogUtility.tip("请先选择收货地址");
                    return
                }
                this.calculationMoney(); //计算金额
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("发票邮费模板获取失败");
            },
            compelete: () => {
                DialogUtility.close(this);
            }
        })
    },
    queryAddressList(){
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryMyAddressList,
            succ: (res) => {
                for(let i = 0; i< res.list.length; i++){
                    if(res.list[i].is_default == 0){
                        this.setData({
                            receivingName: res.list[i].recipient,
                            reveivingPhone: res.list[i].contact_no,
                            receivingProvinceName: res.list[i].province,
                            receivingCityName: res.list[i].city,
                            receivingAreaName: res.list[i].area_street,
                            receivingTownName: res.list[i].town,
                            receivingAddress: res.list[i].address,

                            receivingProvinceCode: res.list[i].province_code,
                            receivingCityCode: res.list[i].city_code,
                            receivingAreaCode: res.list[i].area_street_code,
                            receivingTownCode: res.list[i].town_code,
                        })
                    }
                }
                this.queryPostage();
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

                            invoiceName: res.data[i].invoice_title,
                            invoiceCode: res.data[i].invoice_no,
                            invoiceType: res.data[i].invoice_man_type,
                        })
                    }
                }
                if(!isDefaultTt){
                    DialogUtility.tip("请先选择发票抬头");
                    this.setData({
                        requestPstage: false
                    })
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
    chooseTt(){
        //选择发票抬头
        RedirectUtility.navigateTo("/pages/users/myinvoicelist/myinvoicelist?type=" + "000");
    },
    chooseAddress(){ //重新选择收货地址
        RedirectUtility.navigateTo("/pages/users/receivingaddress/receivingaddress?type=" + "000");
    },
    gotoSure(){
        if(!this.data.invoiceName){
            DialogUtility.tip("请先选择发票抬头");
            return;
        }

        if(!this.data.receivingName){
            DialogUtility.tip("请输入收货姓名");
            return;
        }
        if(!this.data.reveivingPhone){
            DialogUtility.tip("请输入收货人手机号码");
            return;
        }
        if(NumberUtility.trim(this.data.reveivingPhone).length != 11 || !NumberUtility.phoneValid(this.data.reveivingPhone)){
            DialogUtility.tip("请输入正确的手机号码");
            return;
        }
        if(!this.data.receivingProvinceName || !this.data.receivingCityName || !this.data.receivingAreaName || !this.data.receivingAddress){
            DialogUtility.tip("请输入收货地址");
            return;
        }
        this.createInvoice();
    },
    createInvoice(){ //开发票
        let productData = []
        let data = {
            order_detail_id: "",
            sale_price: this.data.postage,
            product_count: 1,
            product_name: this.data.invoiceType == 1 ? "个人发票" : "企业发票",
            product_flag: ""
        }
        productData.push(data)
        
        DialogUtility.loading("加载中");
        let parm = { 
            send_type: this.data.sendType,
            invoice_amount: this.data.postage + this.data.payAmount + this.data.productPostage,  //发票总金额
            pay_amount: this.data.postage, //发票支付金额
            postage: this.data.postage,  //发票邮费
            product_postage: this.data.productPostage,  //商品总邮费
            order_amount: this.data.payAmount,  //商品总金额
            invoice_type: 1,  //1.普票  2.专票
            invoice_man_type: this.data.invoiceType == 1 ? 1 : 2,  //1.个人  2.企业
            invoice_title: this.data.invoiceName,
            invoice_no: this.data.invoiceCode,
            open_invoice_orderid_arry: this.data.orderIds,
            province_no: this.data.receivingProvinceName,
            city_no: this.data.receivingCityName,
            area_street: this.data.receivingAreaName,
            town: this.data.receivingTownName,
            recipient_address: this.data.receivingAddress,
            recipient_name: this.data.receivingName,
            recipient_phone: this.data.reveivingPhone,
            remark: ""
        };
        APIUtility.get({
            url: AppConfig.apiList.createMyInvoice,
            params: { 
                invoice_param: parm
            },
            succ: (res) => {
                let result = res
                if(!result.timeStamp || !result.nonceStr || !result.package || !result.signType || !result.paySign){
                    RedirectUtility.navigateTo("/pages/mall/buysuccess/buysuccess?product_data=" + JSON.stringify(productData) + "&payAmonut=" + (this.data.postage /100.00).toFixed(2) + "&type=3002");
                    return
                }
                wx.requestPayment({
                    timeStamp: result.timeStamp + "",
                    nonceStr: result.nonceStr,
                    package: result.package,
                    signType: result.signType,
                    paySign: result.paySign,
                    success: (res) => {
                        RedirectUtility.navigateTo("/pages/mall/buysuccess/buysuccess?product_data=" + JSON.stringify(productData) + "&payAmonut=" + (this.data.postage /100.00).toFixed(2) + "&type=3002");
                    },
                    fail: (errData) => {
                        console.log("取消支付,关闭订单", errData);
                    },
                    complete: (errData) => {
                        console.log("complete", errData);
                        setTimeout(() => {
                            this.data.isSubmit = true;
                        }, 1000);
                    }
                })
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("生成发票失败");
            },
            compelete: () => {
                DialogUtility.close(this);
            }
        })
    },
    calculationMoney(){  //计算金额
        let tempList = this.data.postageList

        let sendType = ""
        let postageMoney = 0
        let index = -1;
        let haveIndex = -1;
        if(tempList){
            for(let i = 0; i < tempList.length; i++){
                sendType = tempList[i].send_type
                if ((tempList[i].area).search(this.data.receivingProvinceName) != -1) { //查找邮寄地区是否包含
                    if (tempList[i].is_piece == 0) { //按件收费
                        if (tempList[i].is_fixed_fee == 0) {  //固定邮费
                            postageMoney += parseInt(tempList[i].fixed_amount)
                        } else {
                            postageMoney += parseInt(tempList[i].express_fee)
                        }
                    } else { //不按件收费
                        if (tempList[i].is_fixed_fee == 0) {  //固定邮费
                            postageMoney += parseInt(tempList[i].fixed_amount)
                        } else {
                            postageMoney += parseInt(tempList[i].express_fee)
                        }
                    }
                    break
                }else if (tempList[i].area == "*") {
                    if (tempList[i].is_piece == 0) { //按件收费
                        if (tempList[i].is_fixed_fee == 0) {  //固定邮费
                            postageMoney += parseInt(tempList[i].fixed_amount)
                        } else {
                            postageMoney += parseInt(tempList[i].express_fee)
                        }
                    } else { //不按件收费
                        if (tempList[i].is_fixed_fee == 0) {  //固定邮费
                            postageMoney += parseInt(tempList[i].fixed_amount)
                        } else {
                            postageMoney += parseInt(tempList[i].express_fee)
                        }
                    }
                }
            }
        }
        this.setData({
            sendType: parseInt(sendType),  //配送类型
            postage: postageMoney, // 发票邮费
            postages: ((postageMoney + this.data.productPostage) / 100.00).toFixed(2),  //总邮费金额
            totalMoney: ((this.data.payAmount + postageMoney + this.data.productPostage) / 100.00).toFixed(2)  //总发票金额
        })
    }
})