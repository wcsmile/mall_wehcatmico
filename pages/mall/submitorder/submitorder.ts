import { RedirectUtility } from "../../../utils/redirect";
import { DialogUtility } from "../../../utils/dialog";
import { APIUtility } from "../../../utils/api";
import { AppConfig } from "../../../config";
import { NumberUtility } from "../../../utils/number";
import { GuideModalUtil } from "../../../utils/guidemodal";

Page({

    /**
     * 页面的初始数据
     */
    data: {
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

        submitList: [],
        isSubmit: true,

        orderMoney: 0.00, //订单金额
        postageMoney: 0.00, //邮费
        totalOrderMoney: 0.00, //订单总额
        totalPrice: 0.00, //合计
        totalNum: 0, //商品件数
        codeList: {
            802: "商品不存在",
            803: "商品已下架",
            804: "商品库存不足，我们会及时补货，请稍后再进行购买",
            905: "商品已下架，不能购买",
            901: "下单次数已达上限，请十分钟后再试",
            923: "已达到此商品的限购上限",
            921: "抱歉，活动还未开始",
            925: "抱歉，活动已结束",
            952: "收货地址已变更，请重新编辑收货地址"
        },
        shareTag: "0",
        scene: "1001",
        requestComplete: false,
        requestPstage: false,
        isHaveDefaultAddr: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options.shareTag) {
            this.setData({
                shareTag: options.shareTag
            })
        }
        if (options.scene) {
            this.setData({
                scene: options.scene
            })
        }
        let carList = options.carlist
        let types = options.type
        let buy = options.buy
        let carIds = options.carids
        this.setData({
            carList: carList,
            types: types,  //配送类型（配送|不配送|自提）
            buy: buy || ""
        })
        if (carIds) {
            this.setData({
                carIds: carIds.substring(0, carIds.length - 1)
            })
        }
        console.log("-------配送类型", types);

        this.queryAddressList(); // 获取收货地址
    },
    querySubmitOrder() {
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.querySubmitOrder,
            params: {
                plat_tag: AppConfig.plat_tag,
                param_info: this.data.carList
            },
            succ: (res) => {
                let shopActivityList = res.shopActivityList

                res.data.map((item) => {  
                    if(item.activity_rule_list && item.activity_rule_list.length > 0){
                        for(let i = 0; i < item.activity_rule_list.length; i++){ //计算活动价格
                            if(item.product_id == item.activity_rule_list[i].product_id){
                                item.activity_sale_price = item.activity_rule_list[i].sale_price
                                item.activity_discount_rate = item.activity_rule_list[i].discount_rate
                                break
                            }else if("*" == item.activity_rule_list[i].product_id){
                                item.activity_sale_price = item.activity_rule_list[i].sale_price
                                item.activity_discount_rate = item.activity_rule_list[i].discount_rate
                            }
                        }
                    }
                    item.sale_prices = item.activity_rule_list && item.activity_rule_list.length > 0 ? (item.activity_sale_price / 100.00).toFixed(2) : (item.sale_price / 100.00).toFixed(2) 
                    item.face = (item.face / 100.00).toFixed(2);
                    item.cover_img = AppConfig.imageAddr + item.cover_img;
                    (item.activity_rule_list || []).map((item)=> { //活动价格
                        item.sale_prices = (item.sale_price / 100.00).toFixed(2);
                      })
                })
                
                let map = {}
                let dest = []
                for (let i = 0; i < res.data.length; i++) {
                    let ai = res.data[i];
                    let shop_id = ai.shop_id;
                    let activityList = shopActivityList ? shopActivityList[shop_id] : {}
                    let result = [];
                    for (let key in activityList){
                        result.push(JSON.parse(activityList[key]))
                    } 

                    if (!map[ai.shop_id]) {
                        dest.push({
                            product_message: "",
                            shop_id: ai.shop_id,
                            product_flag: parseInt(ai.product_flag),
                            shop_name: ai.shop_name,
                            shop_logo: ai.logo_url ? AppConfig.imageAddr + ai.logo_url : "http://static.100bm.cn/mall/ui/default/ic_shop_logo.png",
                            data: [ai],
                            activity_list: result
                        });
                        map[ai.shop_id] = ai;
                    } else {
                        for (var j = 0; j < dest.length; j++) {
                            var dj = dest[j];
                            if (dj.shop_id == ai.shop_id) {
                                dj.data.push(ai);
                                break;
                            }
                        }
                    }
                }
                
                this.setData({
                    submitList: dest
                })

                if(!this.data.isHaveDefaultAddr){
                    return
                }
                this.calculationMoney();
            },
            fail: (errData) => {
                console.log("获取确认数据失败", errData);
                DialogUtility.tip("获取确认数据失败");
            },
            compelete: () => {
                DialogUtility.close(this);
                this.setData({
                    requestComplete: true
                })
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
        if (!this.data.receivingProvinceName || !this.data.receivingCityName || !this.data.receivingAreaName || !this.data.receivingAddress) {
            this.setData({
                isHaveDefaultAddr: false
            })
            return;
        }
        this.setData({
            isHaveDefaultAddr: true
        })
        this.calculationMoney();
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
    calculationMoney() {  //金额计算
        let payMoney = 0
        let postageMoney = 0
        let sum = 0
        let productData = []

        let templist = this.data.submitList;

        for (let i = 0; i < templist.length; i++) {
            for (let j = 0; j < templist[i].data.length; j++) {
                sum++;
                if (!templist[i].data[j].activity_rule_list || templist[i].data[j].activity_rule_list.length == 0) {
                    payMoney += parseInt(templist[i].data[j].sale_price) * parseInt(templist[i].data[j].product_count)
                } else {
                    if (templist[i].data[j].activity_rule_list[0].rule_type == 1) {
                        payMoney += parseInt(templist[i].data[j].activity_sale_price) * parseInt(templist[i].data[j].product_count)
                    } else {
                        payMoney += parseInt(templist[i].data[j].sale_price) * (parseInt(templist[i].data[j].activity_discount_rate) / 100.00) * parseInt(templist[i].data[j].product_count)
                    }
                }

                let index = -1;
                let haveIndex = -1;
                
                let postage_template = templist[i].data[j].postage_template

                if (postage_template) {  //有运费模板 实物商品
                    console.log("------------", postage_template);

                    let postage_template_list = templist[i].data[j].postage_template.rulelist

                    if(postage_template_list && postage_template_list.length > 0){  //存在邮费模板
                        for (let a = 0; a < postage_template_list.length; a++) {
                            if ((postage_template_list[a].area).search(this.data.receivingProvinceName) != -1) { //查找邮寄地区是否包含
                                haveIndex = a;
                                break
                            }
                            if (postage_template_list[a].area == "*") {
                                index = a;
                            }
                        }
                    }
                     if(postage_template.fixed_amount){  //存在数据
                        if (postage_template.is_piece == 0) { //按件收费
                            if (postage_template.is_fixed_fee == 0) {  //固定邮费
                                postageMoney += parseInt(postage_template.fixed_amount) * parseInt(templist[i].data[j].product_count)
                            } else {
                                if (haveIndex != -1) {
                                    postageMoney += parseInt(postage_template_list[haveIndex].express_fee) * parseInt(templist[i].data[j].product_count)
                                } else {
                                    postageMoney += parseInt(postage_template_list[index].express_fee) * parseInt(templist[i].data[j].product_count)
                                }
                            }
                        } else { //不按件收费
                            if (postage_template.is_fixed_fee == 0) {  //固定邮费
                                postageMoney += parseInt(postage_template.fixed_amount)
                            } else {
                                if (haveIndex != -1) {
                                    postageMoney += parseInt(postage_template_list[haveIndex].express_fee)
                                } else {
                                    postageMoney += parseInt(postage_template_list[index].express_fee)
                                }
                            }
                        }
                     }
                }

                let data = {
                    order_detail_id: templist[i].data[j].product_id,
                    sale_price: templist[i].data[j].sale_price,
                    product_count: templist[i].data[j].product_count,
                    product_name: templist[i].data[j].product_name,
                    product_flag: templist[i].data[j].product_flag
                }
                productData.push(data)
            }
        }

        // this.setData({
        //     orderMoney: (payMoney / 100.00).toFixed(2), //订单金额
        //     // postageMoney: (postageMoney / 100.00).toFixed(2), //邮费
        //     totalOrderMoney: ((payMoney + postageMoney) / 100.00).toFixed(2), //订单总额
        //     totalPrice: ((payMoney + postageMoney) / 100.00).toFixed(2), //合计
        //     totalNum: sum, //商品件数
        //     productData: productData //成功显示数据
        // })
        this.setData({
            orderMoneys: payMoney, //订单金额
            // postageMoney: (postageMoney / 100.00).toFixed(2), //邮费
            // totalOrderMoney: ((payMoney + postageMoney) / 100.00).toFixed(2), //订单总额
            // totalPrice: ((payMoney + postageMoney) / 100.00).toFixed(2), //合计
            totalNum: sum, //商品件数
            productData: productData //成功显示数据
        })
        if(!this.data.isHaveDefaultAddr){
            return
        }
        this.queryProductPostages(); //获取邮费
    },
    gotoOrderList() {
        RedirectUtility.navigateTo("/pages/users/order/order");
    },
    gotoHome() {
        RedirectUtility.switchTab("/pages/home/home")
    },
    inputMessage(event) {
        let shopId = event.currentTarget.dataset.id;
        let templist = this.data.submitList;
        for (let i = 0; i < templist.length; i++) {
            if (templist[i].shop_id == shopId) {
                templist[i].product_message = event.detail.value
            }
        }

        this.setData({
            submitList: templist
        })
    },
    gotoSubmitOrder() {
        if (this.data.types == 0) {
            if (!this.data.receivingName) {
                DialogUtility.tip("请输入收货姓名");
                return;
            }
            if (!this.data.reveivingPhone) {
                DialogUtility.tip("请输入收货人手机号码");
                return;
            }
            if (NumberUtility.trim(this.data.reveivingPhone).length != 11 || !NumberUtility.phoneValid(this.data.reveivingPhone)) {
                DialogUtility.tip("请输入正确的手机号码");
                return;
            }
            if (!this.data.receivingProvinceName || !this.data.receivingCityName || !this.data.receivingAreaName || !this.data.receivingAddress) {
                DialogUtility.tip("请输入收货地址");
                return;
            }
        }
        if (this.data.isSubmit) {
            
            this.data.isSubmit = false;
            let queryParms = [];
            let address = {
                province_no: this.data.receivingProvinceCode,
                city_no: this.data.receivingCityCode,
                area_street: this.data.receivingAreaCode,
                town_no: this.data.receivingTownCode,
                recipient_address: this.data.receivingAddress,
                recipient_name: this.data.receivingName,
                recipient_phone: this.data.reveivingPhone
            }

            let templist = this.data.submitList;
            for (let i = 0; i < templist.length; i++) {
                let data = [];
                for (let j = 0; j < templist[i].data.length; j++) {
                    let dataParam = {
                        product_id: templist[i].data[j].product_id,
                        product_num: parseInt(templist[i].data[j].product_count),
                        activity_tag: templist[i].data[j].activity_info ? templist[i].data[j].activity_info.tag : ""
                    }
                    data.push(dataParam)
                }
                let orderParams = {
                    order_type: "1001",//商品下单
                    share_tag: this.data.shareTag,
                    scene: this.data.scene,
                    shop_id: templist[i].shop_id,
                    product_data: data,
                    buyer_messsage: templist[i].product_message
                }
                queryParms.push(orderParams)
            }

            let sendType;
            if (this.data.types == 0) {
                sendType = 2 //邮寄
            } else if (this.data.types == 1) {
                sendType = 3 //自提
            } else {
                sendType = 1; //不邮寄不自提
            }

            let create_params = {
                send_type: sendType,
                express_address_info: address,
                main_order_info: queryParms
            }
            DialogUtility.loading("下单中，请稍候", 3);
            APIUtility.get({
                url: AppConfig.apiList.orderRequest,
                params: {
                    create_param: create_params,
                },
                succ: (res) => {
                    if (this.data.buy == 1002) { //移除购物车
                        this.removeShoppingCar()
                    }
                    let result = res.data
                    if(!result.timeStamp || !result.nonceStr || !result.package || !result.signType || !result.paySign){
                        RedirectUtility.navigateTo("/pages/mall/buysuccess/buysuccess?product_data=" + JSON.stringify(this.data.productData) + "&payAmonut=" + this.data.totalPrice);
                        return
                    }
                    wx.requestPayment({
                        timeStamp: result.timeStamp + "",
                        nonceStr: result.nonceStr,
                        package: result.package,
                        signType: result.signType,
                        paySign: result.paySign,
                        success: (res) => {
                            RedirectUtility.navigateTo("/pages/mall/buysuccess/buysuccess?product_data=" + JSON.stringify(this.data.productData) + "&payAmonut=" + this.data.totalPrice);
                        },
                        fail: (errData) => {
                            console.log("取消支付,关闭订单", errData);
                            RedirectUtility.navigateTo("/pages/users/order/order");
                        },
                        complete: (errData) => {
                            console.log("complete", errData);
                            setTimeout(() => {
                                this.data.isSubmit = true;
                            }, 2000);
                        }
                    })
                },
                fail: (errData) => {
                    DialogUtility.tip(this.data.codeList[errData.code] || "订单创建失败");
                },
                compelete: () => {
                    DialogUtility.close(this);
                    setTimeout(() => {
                        this.data.isSubmit = true;
                    }, 2000);
                }
            })
        }
    },
    queryAddressList() {
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryMyAddressList,
            succ: (res) => {
                let isDefaultAddr = false;
                for (let i = 0; i < res.list.length; i++) {
                    if (res.list[i].is_default == 0) {
                        isDefaultAddr = true;
                        this.setData({
                            isHaveDefaultAddr: true, //是否有默认地址
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
                this.querySubmitOrder(); //获取数据
                if(!isDefaultAddr){
                    DialogUtility.tip("请先选择收货地址");
                    this.setData({
                        requestPstage: false
                    })
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
    chooseAddress() { //重新选择收货地址
        RedirectUtility.navigateTo("/pages/users/receivingaddress/receivingaddress?type=" + "000");
    },
    addNum(event) {
        let templist = this.data.submitList;
        let index = event.currentTarget.dataset.index;
        let id = event.currentTarget.dataset.id;
        for (let i = 0; i < templist.length; i++) {
            for (let j = 0; j < templist[i].data.length; j++) {
                if (j == index && templist[i].data[j].product_id == id) {
                    let product_count = parseInt(templist[i].data[index].product_count)
                    let max_limit = parseInt(templist[i].data[index].max_limit)

                    if (product_count < max_limit) {
                        templist[i].data[index].product_count = product_count + 1;
                    } else if (product_count == max_limit) {
                        DialogUtility.tip("已达到此商品的限购上限");
                        return;
                    } else {
                        templist[i].data[index].product_count = max_limit;
                    }
                }
            }
        }
        this.setData({
            submitList: templist
        })
        // this.queryProductPostages(); //获取邮费
        this.calculationMoney();
    },
    minusNum(event) {
        let templist = this.data.submitList;
        let index = event.currentTarget.dataset.index;
        let id = event.currentTarget.dataset.id;
        for (let i = 0; i < templist.length; i++) {
            for (let j = 0; j < templist[i].data.length; j++) {
                if (j == index && templist[i].data[j].product_id == id) {
                    let product_count = parseInt(templist[i].data[index].product_count)

                    if (product_count > 1) {
                        templist[i].data[index].product_count = product_count - 1;
                    } else {
                        templist[i].data[index].product_count = 1;
                    }
                }
            }
        }
        this.setData({
            submitList: templist
        })
        // this.queryProductPostages(); //获取邮费
        this.calculationMoney();
    },
    showDialog() {
        this.setData({
            type: 6
        })
        GuideModalUtil.showGuideModal();
    },
    gotoCloseDialog() {
        GuideModalUtil.closeGuideModal();
    },
    removeShoppingCar() {
        APIUtility.get({
            url: AppConfig.apiList.removeOrderCar,
            params: {
                cart_ids: this.data.carIds,
                plat_tag: AppConfig.plat_tag
            },
            succ: (res) => {

            },
            fail: (errData) => {
                console.log("移除购物车失败，稍候再试", errData);
            }
        })
    },
    queryProductPostages() { //获取邮费

        let queryParms = []
        let templist = this.data.submitList;
        for (let i = 0; i < templist.length; i++) {
            let data = [];
            for (let j = 0; j < templist[i].data.length; j++) {
                let dataParam = {
                    product_id: templist[i].data[j].product_id,
                    product_num: parseInt(templist[i].data[j].product_count),
                    activity_tag: templist[i].data[j].activity_info ? templist[i].data[j].activity_info.tag : ""
                }
                data.push(dataParam)
            }
            let orderParams = {
                shop_id: templist[i].shop_id,
                product_infos: data
            }
            queryParms.push(orderParams)
        }

        let paramsData = {
            province_no: this.data.receivingProvinceCode,
            city_no: this.data.receivingCityCode,
            area_street: this.data.receivingAreaCode,
            town: this.data.receivingTownCode,
            order_postage: queryParms
        }

        APIUtility.get({
            url: AppConfig.apiList.queryProductPostage,
            params: {
                params: JSON.stringify(paramsData)
            },
            succ: (res) => {
                let totalPostage = 0;
                (res.data).map((item)=>{
                    totalPostage += parseInt(item.postage)
                })

                this.setData({
                    orderMoney: (this.data.orderMoneys / 100.00).toFixed(2), //订单金额
                    postageMoney: (totalPostage / 100.00).toFixed(2), //邮费
                    totalOrderMoney: ((this.data.orderMoneys + totalPostage) / 100.00).toFixed(2), //订单总额
                    totalPrice: ((this.data.orderMoneys + totalPostage) / 100.00).toFixed(2), //合计
                    requestPstage: true
                })
            },
            fail: (errData) => {
                console.log("邮费获取失败，稍候再试", errData);
                DialogUtility.tip(this.data.codeList[errData.code] || "邮费获取失败，稍候再试");
            }
        })
    }
})