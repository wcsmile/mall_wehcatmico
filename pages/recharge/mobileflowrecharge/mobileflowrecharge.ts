// pages/login/login.js
import { RedirectUtility } from "../../../utils/redirect";
import { NumberUtility } from "../../../utils/number";
import { AppConfig } from "../../../config";
import { APIUtility } from "../../../utils/api";
import { DialogUtility } from "../../../utils/dialog";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isSubmit: true,
        chargeCardList: [],
        chooseData: {},
        christmasInputClass: "phone-number-container",
        vPhoneNum: "",//当前输入框的值
        vInputFocus: false,
        shareTag: "0",
        scene: "0",
        isClick: false,
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
        carrierType: {
            "移动": "YD",
            "电信": "DX",
            "联通": "LT"
        },
        requestComplete: false
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
    },
    bindInput(phone) {
        this.queryProductList();
        if (phone.length <= 0) return;
        this.queryPhoneInfo(NumberUtility.trim(phone))
        // 号段信息一致时，后几位数字变化更新页面显示
        this.setData({
            vPhoneNum: phone
        });
    },
    queryProductList(){
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryShopProductList,
            params: {  product_type: 3, shop_tag: "" },  //国内流量充值
            succ: (res) => {
                let list = res.list || [];
                list.map((item) => {
                    item.goods_sale_price = (item.sale_price / 100).toFixed(2);
                    item.face =  (item.face / 100).toFixed(2);
                    item.click = "1"
                })
                this.setData({
                    chargeCardList: list.sort(this.compare)
                })
                setTimeout(() => {
                    if(this.data.vPhoneNum.length == 11){
                        this.queryOilInfo(NumberUtility.trim(this.data.vPhoneNum))
                    }
                }, 500);
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("加载失败");
            },
            compelete: () => {
                DialogUtility.close(this);
                this.setData({
                    requestComplete: true
                })
            }
        })
    },
    compare(value1,value2){ //排序
        if (value1.sort_id < value2.sort_id){
            return -1;
        }else if (value1.sort_id > value2.sort_id){
            return 1;
        }else{
            return 0;
        }
    },
    getFocus() {
        this.setData({ vInputFocus: true });
    },
    loseFocus(){
        this.setData({ vInputFocus: false });
    },
    phoneNumChange(event) {
        let currentInput = NumberUtility.trim(event.detail.value).substring(0, 11);
        let inputLength = currentInput.length;

        this.setData({
            vPhoneNum: NumberUtility.numberFormat(currentInput),
            showClearButton: inputLength > 0
        });
        if(NumberUtility.trim(this.data.vPhoneNum).length != 11){
            for(let i= 0; i< this.data.chargeCardList.length; i++){
                this.data.chargeCardList[i].click = "1"
            }
            this.setData({
                vProductTips: "",
                chooseData: {},
                isClick: false,
                chargeCardList: this.data.chargeCardList
            })
            return
        }

        // 等于11位检查号码是否合法 存入缓存
        if (currentInput.length == 11 && NumberUtility.phoneValid(currentInput)) {
            NumberUtility.setPhoneToLocal(currentInput);
        }
        this.queryPhoneInfo(NumberUtility.trim(this.data.vPhoneNum));
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
        this.bindInput(NumberUtility.getLastPhone(AppConfig.dkUserPhoneList));
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
            path: '/pages/home/home?page_type=4',
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
    gotoRecharge() {
        if (NumberUtility.trim(this.data.vPhoneNum).length != 11 || !NumberUtility.phoneValid(NumberUtility.trim(this.data.vPhoneNum))) {
            DialogUtility.tip("请输入正确的手机号码");
            return;
        }

        if(this.data.isSubmit){
            this.data.isSubmit = false;
            let data = {
                recharge_account: NumberUtility.trim(this.data.vPhoneNum),
     　　　　　　carrierNo: this.data.carrierType[this.data.carrierName]   //运营商类型
            };

            let parm = {
                product_id: this.data.chooseData.product_id, 
                product_num: 1, 
                activity_tag: this.data.chooseData.activity_info ? this.data.chooseData.activity_info.tag : "",
                ext_data: JSON.stringify(data) 
            };
            let product_data = [];
            product_data.push(parm)
            let orderParams = {
                order_type: "3003", //流量充值
                share_tag: this.data.shareTag,
                scene: this.data.scene,
                shop_id: this.data.chooseData.shop_id,
                product_data: product_data
            }

            let queryParms = [];
            queryParms.push(orderParams);

            let sendType;
            if((this.data.chooseData.product_flag & 16) == 16){
                sendType = 2; //配送
            }else if((this.data.chooseData.product_flag & 32) == 32){
                sendType = 3; //自提
            }else{ 
                sendType = 1;
            }
            let create_params = {
                send_type: sendType, //不配送
                main_order_info: queryParms
            }
            DialogUtility.loading("下单中，请稍候");
            APIUtility.get({
                url: AppConfig.apiList.orderRequest,
                params: { 
                    create_param: create_params
                },
                succ: (res) => {
                    let result = res.data
                    wx.requestPayment({
                        timeStamp: result.timeStamp + "",
                        nonceStr: result.nonceStr,
                        package: result.package,
                        signType: result.signType,
                        paySign: result.paySign,
                        success: (res) => {
                            RedirectUtility.navigateTo("/pages/recharge/rechargesuccess/rechargesuccess?tips=" + "流量充值申请提交成功！" + "&content=" + "提交充值成功，系统将在20分钟内充值到您的手机号，请注意查看。");
                        },
                        fail: (errData) => {
                            console.log("取消支付,关闭订单", errData);
                            RedirectUtility.navigateTo("/pages/users/order/order");
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
    clearInput() {
        for(let i= 0; i< this.data.chargeCardList.length; i++){
            this.data.chargeCardList[i].click = "1"
        }
        this.setData({
            vPhoneNum: "",
            vProductTips: "",
            vShowProduct: false,
            vShowProductError: false,
            vInputFocus: true,
            chooseData: {},
            isClick: false,
            chargeCardList: this.data.chargeCardList
        })
    },
    choosePrice(event) {
        if(!this.data.isClick){
            return
        }
        let index = event.currentTarget.dataset.index;
        let list = [];
        for (let i = 0; i < this.data.chargeCardList.length; i++) {
            if (i == index) {
                this.data.chargeCardList[i].click = "2";
            } else {
                this.data.chargeCardList[i].click = "1";
            }
            list.push(this.data.chargeCardList[i])
        }
        this.setData({
            chooseData: list[index],
            chargeCardList: list
        })
    },
    queryPhoneInfo(phone){
        APIUtility.get({
            url: AppConfig.apiList.queryPhoneInfo,
            params: {  recharge_account: phone},
            succ: (res) => {
                let item = {}
                for(let i= 0; i< this.data.chargeCardList.length; i++){
                    if(this.data.chargeCardList[i].face == 100){
                        this.data.chargeCardList[i].click = "2"
                        item = this.data.chargeCardList[i]
                    }
                }
                this.setData({
                    isClick: true,
                    chargeCardList: this.data.chargeCardList,
                    chooseData: item,
                    carrierName: res.data.carrier_name,
                    vProductTips: res.data.province_name + res.data.carrier_name
                })
            },
            fail: (error) => {
                console.log(error);
                this.setData({
                    vProductTips: error.msg
                })
            }
        })
    }
})