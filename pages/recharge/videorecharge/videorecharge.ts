import { AppConfig } from '../../../config';
import { APIUtility } from '../../../utils/api';
import { DialogUtility } from "../../../utils/dialog";
import { GuideModalUtil } from "../../../utils/guidemodal";
import { CommonUtility } from '../../../utils/common';
import { NumberUtility } from '../../../utils/number';
import { ViedoModalUtil } from '../../../utils/videomodal';
import { VideoUtility } from '../../../utils/video'
import { RedirectUtility } from '../../../utils/redirect'
Page({
    data: {
        vedioList: [],
        isCreatingOrder: false,
        currentProductInfo: {},
        autoFocus: false,
        chooseData: {},
        vPhoneNum: "",
        vRechargeLimit: [],
        isSubmit: true,
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
        shareTag: "0",
        scene: "0"
    },
    onLoad(options) {
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
            videoType: options.videoType || ""
        })
        console.log("**********************", this.data.videoType);
        
        DialogUtility.loading("加载中");
        this.queryDictionary("ProductCarrierNo");
    },
    onPullDownRefresh() {
        this.getVideoList();
        wx.stopPullDownRefresh();
    },
    queryDictionary(type){
        APIUtility.get({
            url: AppConfig.apiList.queryDictionary,
            params: { enum_type: type},
            succ: (res) => {
                let resultData = {};
                let videoData = {};

                (res.list||[]).forEach(item => {
                    resultData[item.value] = item.remark
                    videoData[item.value] = item.description
                });
                
                this.setData({
                    dataList: resultData,
                    videoDatas: videoData
                })
                this.getVideoList();
            },
            fail: (error) => {
                console.log(error);
            }
        })
    },
    getVideoList: function () {
        APIUtility.get({
            url: AppConfig.apiList.queryShopProductList,
            params: { product_type: 8, shop_tag: "" }, //获取视频产品
            succ: (res) => {
                let list = res.list || [];
                list.map((item) => {
                    item.goods_sale_price = (item.sale_price / 100).toFixed(2);
                    item.face =  (item.face / 100).toFixed(2);
                })
                list.sort(this.compare);

                let map = {}
                let dest = []
                
                for(let i = 0; i < list.length; i++){
                    let ai = list[i];
                    let carrier_no = ai.carrier_no;
                    let product_name = this.data.videoDatas[carrier_no] + "会员"
                    if(!map[ai.carrier_no]){  
                        dest.push({   
                            carrier_no: carrier_no,
                            // isShowDetail: true,
                            isShowDetail: (this.data.videoType).length > 0 && product_name.search(this.data.videoType) != -1 ? true : false,
                            product_name: product_name,
                            logo_url: this.data.dataList[carrier_no],
                            data: [ai]
                        });  
                        map[ai.carrier_no] = ai;  
                    }else{  
                        for(let j = 0; j < dest.length; j++){  
                            let dj = dest[j];  
                            if(dj.carrier_no == ai.carrier_no){  
                                dj.data.push(ai);  
                                break;  
                            }  
                        }  
                    }  
                }
                
                this.setData({
                    vedioList: dest
                })
            },
            compelete: () => {
                DialogUtility.close(this);
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
    // 列表显示详细信息
    showDetail(event) {
        let currentStandard = event.currentTarget.dataset.standard;

        let currentProductList = this.data.vedioList;
        for (let i = 0; i < currentProductList.length; i++) {
            if (i == currentStandard) {
                currentProductList[i].isShowDetail = !currentProductList[i].isShowDetail;
            } else {
                currentProductList[i].isShowDetail = false;
            }
        }
        this.setData({ vedioList: currentProductList });
    },
    showInputModal(event) {
        this.setData({ vPhoneNum: "" });
        this.data.chooseData = event.currentTarget.dataset.product;

        ViedoModalUtil.show(this.data.vRechargeLimit);
        setTimeout(() => {
            this.setData({ autoFocus: true });
        }, 1000);
    },
    closeVideoModal() {
        this.setData({
            vPhoneNum: "",
            autoFocus: false
        });
        ViedoModalUtil.hide();
    },
    phoneNumChange(event) {
        this.setData({ vPhoneNum: NumberUtility.trim(event.detail.value) });
    },
    selectProduct: function (event) {
        if(this.data.chooseData.carrier_no == "TX"){
            if(!VideoUtility.videoQQValid(this.data.vPhoneNum)){
                DialogUtility.tip("请输入正确的QQ号码");
                return;
            }
        }else{
            if (!VideoUtility.videoNumValid(this.data.vPhoneNum)) {
                DialogUtility.tip("请输入正确的视频账号");
                return;
            }
        }
        this.createOrder();
    },
    createOrder() {
        if(this.data.isSubmit){
            this.data.isSubmit = false;
            let data = {
               recharge_account: VideoUtility.trim(this.data.vPhoneNum),
    　　　　　　carrierNo: this.data.chooseData.carrier_no  //运营商类型
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
                order_type: "3004", //视频充值
                share_tag: this.data.shareTag,
                scene: this.data.scene,
                shop_id: this.data.chooseData.shop_id,
                product_data: product_data
            }
 
            let queryParms = [];
            queryParms.push(orderParams);

            let sendType;
            if((this.data.chooseData.product_flag & 16) == 16){
                sendType = 2;
            }else if((this.data.chooseData.product_flag & 32) == 32){
                sendType = 3;
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
                            RedirectUtility.navigateTo("/pages/recharge/rechargesuccess/rechargesuccess?tips=" + "视频会员充值申请提交成功！" + "&content=" + "提交充值成功，系统将在20分钟内充值到您的账号，请注意查看。");
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
                    this.closeVideoModal();
                    setTimeout(() => {
                        this.data.isSubmit = true;
                    }, 1000);
                }
            })
        }
    },
    onUnload() {
        DialogUtility.close(this);
        this.closeVideoModal();
    },
    onShareAppMessage: function (): any {
        return {
            title: '品质生活  优惠多多',
            path: '/pages/home/home?page_type=3',
            success: function (res) {
                console.log("转发成功！");
            },
            fail: function (res) {
                console.log("转发失败！");
            }
        }
    }
})