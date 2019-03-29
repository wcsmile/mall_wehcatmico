// pages/login/login.js
import { RedirectUtility } from "../../../utils/redirect";
import { AppConfig } from "../../../config";
import { APIUtility } from "../../../utils/api";
import { DialogUtility } from "../../../utils/dialog";
import { NumberUtility } from "../../../utils/number";
import { DateUtility } from "../../../utils/date";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isSubmit: true,

        faceImage: "",
        backImage: "",
        IDfaceImage: "",
        IDbackImage: "",
        userName: "",
        IDcards: "",
        IDprovinceName: "",
        IDcityName: "",
        IDareaName: "",
        IDaddress: "",
        IDallAddr: "",

        phone: "",

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

        remark: "",
        pwd: "",

        productID: "",
        orderNum: "",
        serviceCharge: "",
        handFee: 0,
        itemHandFee: "",
        shareTag: "0",
        scene: "0",
        rechargeList: [],
        codeList: {
            802: "商品不存在",
            803: "商品已下架",
            804: "商品库存不足，我们会及时补货，请稍后再进行购买",
            905: "商品已下架，不能购买",
            901: "下单次数已达上限，请十分钟后再试",
            923: "已达到此商品的限购上限",
            921: "抱歉，活动还未开始",
            925: "抱歉，活动已结束"
        },
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if(options.shareTag){
            this.setData({
                shareTag: options.shareTag
            })
        }
        if(options.scene){
            this.setData({
                scene: options.scene
            })
        }
        this.setData({
            faceImage: options.user_photo_negative ? (AppConfig.imageAddr + options.user_photo_negative) : "http://static.100bm.cn/mall/ui/default/ic_face.png",
            backImage: options.user_photo_positive ? (AppConfig.imageAddr + options.user_photo_positive) : "http://static.100bm.cn/mall/ui/default/ic_back.png",

            userName: options.user_name || "",
　　　　　　 phone: options.user_phone || "",
　　　　　　 IDprovinceName: options.user_province || "",
　　　　　　 IDcityName: options.user_city || "",
            IDareaName: options.user_area || "",
　　　　　　 IDaddress: options.user_addr || "",
　　　　　　 IDcards: options.user_card || "",
　　　　　　 IDfaceImage: options.user_photo_negative || "",
　　　　　　 IDbackImage: options.user_photo_positive || "",
            pwd: options.init_pwd || "",
            
            receivingProvinceName: options.addr_province || "",
            receivingCityName: options.addr_city || "",
            receivingAreaName: options.addr_area || "",
            receivingAddress: options.addr_addr || "",
            receivingName: options.addr_name || "",
            reveivingPhone: options.addr_phone || "",
        })
        this.setData({
            IDallAddr: this.data.IDprovinceName + this.data.IDcityName + this.data.IDareaName + this.data.IDaddress
        })
        this.queryProductList();
        this.queryAddressList();
    },
    queryProductList(){
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryShopProductList,
            params: {  product_type: 4, shop_tag: "" },
            succ: (res) => {
                let list = res.list || [];
                list.map((item) => {
                    item.goods_sale_price = (item.sale_price / 100).toFixed(2);
                    item.face =  (item.face / 100).toFixed(2)
                })
                this.setData({
                    rechargeList: list,
                    handFee: list[0].hand_fee,
                    productID: list[0].product_id,
                    shopID: list[0].shop_id,
                    productFlag: list[0].product_flag,
                    activityTag: list[0].activity_info ? list[0].activity_info.tag : "",
                    serviceCharge: list[0].hand_fee != 0 ? ((list[0].hand_fee) / 100).toFixed(2) + "元" : "免费"
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
    gotoChooseImage(event){
        let index = event.currentTarget.dataset.index;
        let type = ""
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: (res)=> {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                let tempFilePaths = res.tempFilePaths
                console.log("选择图片的地址", tempFilePaths)
                wx.uploadFile({
                    url: AppConfig.apiList.uploadImage + "/idcard",  //上传图片
                    filePath: tempFilePaths[0],
                    name: 'idcard',
                    success: (res)=>{
                      console.log("身份证上传", res.data);
                      var data = res.data
                      if(res.statusCode != 200){
                        DialogUtility.tip("身份证上传失败");
                        if(index == 1){
                            this.setData({
                                IDfaceImage: ""
                            })
                        }else {
                            this.setData({
                                IDbackImage: ""
                            })
                        }
                        return
                      }
                      console.log("身份证上传地址", tempFilePaths[0]);
                      if(index == 1){
                            this.setData({
                                faceImage: tempFilePaths[0],
                                IDfaceImage: res.data
                            })
                      }else {
                            this.setData({
                                backImage: tempFilePaths[0],
                                IDbackImage: res.data
                            })
                      }
                    },
                    fail: (error)=>{
                        DialogUtility.tip("身份证上传失败");
                    }
                  })
            }
        })
    },
    inputPhone(event){
        this.setData({
            phone: event.detail.value
        })
    },
    inputPwd(event){
        this.setData({
            pwd: event.detail.value
        })
    },
    gotoMessage(){
        if(!this.data.IDfaceImage){
            DialogUtility.tip("请上传身份证正面照");
            return;
        }
        if(!this.data.IDbackImage){
            DialogUtility.tip("请上传身份证反面照");
            return;
        }
        let isEmpty = "1";
        if(!this.data.receivingName){
            isEmpty = "2";
        }
        RedirectUtility.navigateTo("/pages/card/cardmessage/cardmessage?name=" + this.data.userName + "&idCard=" + this.data.IDcards + "&province=" + this.data.IDprovinceName + "&city=" + this.data.IDcityName + "&area=" + this.data.IDareaName + "&address=" + this.data.IDaddress + "&empty=" + isEmpty);
    },
    gotoAddress(){
        if(!this.data.IDfaceImage){
            DialogUtility.tip("请上传身份证正面照");
            return;
        }
        if(!this.data.IDbackImage){
            DialogUtility.tip("请上传身份证反面照");
            return;
        }
        RedirectUtility.navigateTo("/pages/users/receivingaddress/receivingaddress?type=" + "000");
    },
    gotoSuccess(){
        if(!this.data.IDfaceImage){
            DialogUtility.tip("请上传身份证正面照");
            return;
        }
        if(!this.data.IDbackImage){
            DialogUtility.tip("请上传身份证反面照");
            return;
        }
        if(!this.data.userName || !this.data.IDcards){
            DialogUtility.tip("请输入身份证信息");
            return;
        }
        if(NumberUtility.trim(this.data.IDcards).length != 18){
            DialogUtility.tip("请输入正确的身份证号码");
            return;
        }
        if(!this.data.IDprovinceName || !this.data.IDcityName || !this.data.IDareaName || !this.data.IDaddress){
            DialogUtility.tip("请输入正确的地址");
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
        if(!this.data.productID){
            DialogUtility.tip("请选择充值金额");
            return;
        }
        if(!this.data.receivingName || !this.data.reveivingPhone){
            DialogUtility.tip("请输入收货信息");
            return;
        }
        if(!this.data.receivingProvinceName || !this.data.receivingCityName || !this.data.receivingAreaName || !this.data.receivingAddress){
            DialogUtility.tip("请输入收货地址");
            return;
        }
        if(this.data.isSubmit){
            this.data.isSubmit = false;

            console.log("---------------", this.data.receivingProvinceCode);
            
            let address = {
                province_no: this.data.receivingProvinceCode,
                city_no: this.data.receivingCityCode,
                area_street: this.data.receivingAreaCode,
                town_no: this.data.receivingTownCode,
                recipient_address: this.data.receivingAddress,
                recipient_name: this.data.receivingName,
                recipient_phone: this.data.reveivingPhone
            }

            let data = {
               customer_name: this.data.userName,
    　　　　　　customer_phone: this.data.phone,
    　　　　　　province_no: this.data.IDprovinceName,
    　　　　　　city_no: this.data.IDcityName,
               area_street: this.data.IDareaName,
    　　　　　　address: this.data.IDaddress,
    　　　　　　id_card_no: this.data.IDcards,
    　　　　　　photo_positive: this.data.IDfaceImage,
    　　　　　　photo_negative: this.data.IDbackImage,
    　　　　　　remark: this.data.remark,
               init_pwd: this.data.pwd,
               hand_fee: this.data.handFee,

               recipient_province_no: this.data.receivingProvinceName,
               recipient_city_no: this.data.receivingCityName,
               recipient_area_street: this.data.receivingAreaName,
               recipient_address: this.data.receivingAddress,
               recipient_name: this.data.receivingName,
               recipient_phone: this.data.reveivingPhone
            };

            let parm = {
                product_id: this.data.productID, 
                product_num: 1, 
                activity_tag: this.data.activityTag || "",
                ext_data: JSON.stringify(data) 
            };
            let product_data = [];
            product_data.push(parm)
            let orderParams = {
                order_type: "2001", //"2001"是开加油卡
                share_tag: this.data.shareTag,
                scene: this.data.scene,
                shop_id: this.data.shopID,
                product_data: product_data
            }

            let queryParms = [];
            queryParms.push(orderParams);

            let sendType;
            if((this.data.productFlag & 16) == 16){
                sendType = 2;
            }else if((this.data.productFlag & 32) == 32){
                sendType = 3;
            }else{
                sendType = 1;
            }
            let create_params = {
                send_type: sendType, //配送方式
                express_address_info: address,
                main_order_info: queryParms
            }
            DialogUtility.loading("下单中，请稍候");
            APIUtility.get({
                url: AppConfig.apiList.orderRequest,
                params: { 
                    create_param: create_params,
                },
                succ: (res) => {
                    let result = res.data
                    if(!result.timeStamp || !result.nonceStr || !result.package || !result.signType || !result.paySign){
                        RedirectUtility.navigateTo("/pages/card/cardsuccess/cardsuccess");
                        return
                    }
                    wx.requestPayment({
                        timeStamp: result.timeStamp + "",
                        nonceStr: result.nonceStr,
                        package: result.package,
                        signType: result.signType,
                        paySign: result.paySign,
                        success: (res) => {
                            RedirectUtility.navigateTo("/pages/card/cardsuccess/cardsuccess");
                        },
                        fail: (errData) => {
                            console.log("取消支付,关闭订单", errData);
                        },
                        complete: (errData) => {
                            console.log("complete", errData);
                            this.data.isSubmit = true;
                        }
                    })
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
    },
    actionSheetTap(){
        let itemList = [];
        for(let i = 0; i< this.data.rechargeList.length; i++){
            itemList.push(this.data.rechargeList[i].product_name);
        }
        wx.showActionSheet({
            itemList: itemList,
            success: (res) => {
              this.setData({
                itemHandFee: itemList[res.tapIndex],
                handFee: this.data.rechargeList[res.tapIndex].hand_fee,
                productID: this.data.rechargeList[res.tapIndex].product_id,
                shopID: this.data.rechargeList[res.tapIndex].shop_id,
                productFlag: this.data.rechargeList[res.tapIndex].product_flag,
                activityTag: this.data.rechargeList[res.tapIndex].activity_info ? this.data.rechargeList[res.tapIndex].activity_info.tag : "",
                serviceCharge: this.data.rechargeList[res.tapIndex].hand_fee != 0 ? ((this.data.rechargeList[res.tapIndex].hand_fee) / 100).toFixed(2) + "元" : "免费"
              })
            },
            fail: (res) => {
              console.log(res.errMsg)
            }
        })
    }
})