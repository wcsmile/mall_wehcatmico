// pages/login/login.js
import { RedirectUtility } from "../../../utils/redirect";
import { NumberUtility } from "../../../utils/number";
import { AppConfig } from "../../../config";
import { APIUtility } from "../../../utils/api";
import { DialogUtility } from "../../../utils/dialog";
import { OilUtility } from "../../../utils/oils";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isSubmit: true,
        chargeCardList: [],
        chooseData: {},
        vOilNum: "",//当前输入框的值
        vInputFocus: false,
        shareTag: "0",
        scene: "0",
        isClick: false,
        queryCount: 0,
        codeList: {
            802: "商品不存在",
            803: "商品已下架",
            804: "商品库存不足，我们会及时补货，请稍后再进行购买",
            905: "商品已下架，不能购买",
            901: "下单次数已达上限，请十分钟后再试",
            923: "已达到此商品的限购上限",
            921: "抱歉，活动还未开始",
            925: "抱歉，活动已结束",
            940: "当前不在可充值时间内",
            941: "今日充值已达次数限制"
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
        this.queryDictionary("CardRechargeNoteItem");
    },
    getNowTime(){
        let beginTime = this.data.beginTime;
        let endTime = this.data.endTime;
        var strb = beginTime.split (":");
        if (strb.length != 3) {
            return;
        }
        
        var stre = endTime.split (":");
        if (stre.length != 3) {
            return;
        }
        
        var b = new Date ();
        var e = new Date ();
        var n = new Date ();
        
        b.setHours (strb[0]);
        b.setMinutes (strb[1]);
        e.setHours (stre[0]);
        e.setMinutes (stre[1]);
        
        if (n.getTime () - b.getTime () > 0 && n.getTime () - e.getTime () < 0) {
            this.setData({
                isBuy: true
            })
        } else {
            // DialogUtility.tip("当前时间是：" + n.getHours () + ":" + n.getMinutes () + "，不在该时间范围内！");
            this.setData({
                isBuy: false
            })
        }
    },
    queryDictionary(type){
        APIUtility.get({
            url: AppConfig.apiList.queryDictionary,
            params: { enum_type: type},
            succ: (res) => {
                if(type == "CardRechargeNoteItem"){
                    let resultData = [];
                    for(let i = 0; i < res.list.length; i++){
                        if(res.list[i].status == 0){
                            resultData.push(res.list[i])
                        }
                    }
    
                    resultData.sort(this.compare);
    
                    this.setData({
                        descList: resultData,
                    })
                    this.queryDictionary("PetrolCardRechargeTimeLimit");
                }else if(type == "PetrolCardRechargeTimeLimit"){
                    let data = res.list[0];
                    let date = data.value.split ("|")
                    this.setData({
                        beginTime: date[0],
                        endTime: date[1]
                    })
                    this.getNowTime();
                    this.queryDictionary("OilCardStatus");
                }else{
                    let resultData = {};

                    (res.list || []).forEach(item => {
                        resultData[item.value] = item.description
                    });
                    this.setData({
                        cardStatusList: resultData
                    })
                }
            },
            fail: (error) => {
                console.log(error);
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
    queryProductList(){
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryShopProductList,
            params: {  product_type: 6, shop_tag: "" },
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
                    if(this.data.vOilNum.length >= 11){
                        this.queryOilInfo(NumberUtility.trim(this.data.vOilNum))
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
    getFocus() {
        this.setData({ vInputFocus: true });
    },
    loseFocus(){
        this.setData({ vInputFocus: false });
    },
    bindInput(oilNumber) {
        this.queryProductList();
        if (oilNumber.length <= 0) return;
        
        // 号段信息一致时，后几位数字变化更新页面显示
        this.setData({
            vOilNum: oilNumber
        });
    },
    phoneNumChange(event) {    
        if(NumberUtility.trim(event.detail.value).length < 19){
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
        let currentInput = NumberUtility.trim(event.detail.value).substring(0, 19);
        let inputLength = currentInput.length;
        
        this.setData({
            vOilNum: NumberUtility.accountFormat(currentInput)
        });

        console.log("*****打印加油卡号", this.data.vOilNum);
        // 检查是否为中石化
        if (!OilUtility.isZSH(currentInput)) {
            this.setData({
                vProductTips: currentInput.startsWith("9") ? "抱歉，暂时不支持中石油加油卡充值" : "请输入正确的四川中石化加油卡号"
            });
            return;
        }
        // 检查是否为四川中石化
        if (!OilUtility.isSCZSH(currentInput)) {
            this.setData({
                vProductTips: "请输入正确的四川中石化加油卡号"
            });
            return;
        }
        // 等于11位检查号码是否合法 存入缓存
        if (currentInput.length == 19 && OilUtility.oilNumValid(currentInput)) {
            OilUtility.setOilToLocal(currentInput);
        }
        this.queryOilInfo(NumberUtility.trim(this.data.vOilNum))
        
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
        this.bindInput(OilUtility.getLastOilNumber());
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
            path: '/pages/home/home?page_type=1',
            success: function (res) {
                console.log("转发成功！");
            },
            fail: function (res) {
                console.log("转发失败！");
            }
        }
    },
    gotoRecharge() {
        this.getNowTime();
        if(!this.data.isBuy){
            DialogUtility.tip("当前不在可充值时间内");
            return;
        }
        if(this.data.cardDtatus != 0){
            DialogUtility.tip(this.data.cardTips);
            return;
        }
        if (NumberUtility.trim(this.data.vOilNum).length != 19) {
            DialogUtility.tip("请输入正确的加油卡卡号");
            return;
        }
        // 检查是否为四川中石化
        if (!OilUtility.isSCZSH(NumberUtility.trim(this.data.vOilNum))) {
            this.setData({
                vProductTips: "请输入正确的四川中石化加油卡号"
            });
            return;
        }
        if(this.data.isSubmit){
            this.data.isSubmit = false;
           
            let data = {
               recharge_account: NumberUtility.trim(this.data.vOilNum),
    　　　　　　carrierNo:""   //运营商类型
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
                order_type: "3001", //加油卡充值
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
                sendType = 3;  //自提
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
                    create_param: create_params,
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
                            RedirectUtility.navigateTo("/pages/recharge/rechargesuccess/rechargesuccess?tips=" + "加油卡充值申请提交成功！" + "&content=" + "提交充值成功，系统将在10分钟内充值到您的加油卡钱包内，充值成功后，请到加油站圈存后消费。");
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
            vOilNum: "",
            vProductTips: "",
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
    queryOilInfo(oilNo){
        let sum = 0;
        APIUtility.get({
            url: AppConfig.apiList.queryOilInfo,
            params: {  card_no: oilNo},
            succ: (res) => {
                if(res.data.failed_code == "104" && res.data.request_status == "REQUEST_FAILED"){
                    this.setData({
                        vProductTips: res.data.failed_reason
                    })
                }else if(res.data.failed_code == "000" && res.data.request_status == "SUCCESS"){
                    let item = {}
                    for(let i= 0; i< this.data.chargeCardList.length; i++){
                        if(this.data.chargeCardList[i].face == 100){
                            this.data.chargeCardList[i].click = "2"
                            item = this.data.chargeCardList[i]
                        }
                    }

                    this.setData({
                        isClick: this.data.isBuy ? true : false,
                        chargeCardList: this.data.chargeCardList,
                        chooseData: item,
                        cardDtatus: res.data.card_status,
                        vProductTips: (res.data.card_status == 0 ? "" : this.data.cardStatusList[res.data.card_status]),
                        cardTips: "不能对此卡充值，请核对加油卡类型或状态"
                    })
                }else{
                    if(this.data.queryCount < 4){
                        setTimeout(() => {
                            this.queryOilInfo(NumberUtility.trim(this.data.vOilNum))
                            this.setData({
                                queryCount: this.data.queryCount + 1
                            })
                        }, 1000);
                        return
                    }
                    this.setData({
                        queryCount: 0,
                        vProductTips: "网络异常，请刷新重试"
                    })
                }
            },
            fail: (error) => {
                console.log(error);
            }
        })
    }
})