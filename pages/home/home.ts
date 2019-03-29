// pages/login/login.js
import { RedirectUtility } from "../../utils/redirect";
import { AppConfig } from "../../config";
import { APIUtility } from "../../utils/api";
import { DialogUtility } from "../../utils/dialog";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        dataList: [],
        mGoodsList: [],
        imgUrls: ["http://static.100bm.cn/mall/ui/default/ic_banner.png"]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      console.log("初始化加载页面")
        let type = options.page_type
        if(type == 0){ //商品列表
            RedirectUtility.navigateTo("/pages/mall/goods/goods");
        }else if(type == 1){ //加油卡充值
            RedirectUtility.navigateTo("/pages/recharge/oilcardrecharge/oilcardrecharge");
        }else if(type == 2){ //在线开卡
            RedirectUtility.navigateTo("/pages/card/carddescription/carddescription");
        }else if(type == 3){ //话费充值
            RedirectUtility.navigateTo("/pages/recharge/phonerecharge/phonerecharge");
        }else if(type == 4){ //流量充值
            RedirectUtility.navigateTo("/pages/recharge/mobileflowrecharge/mobileflowrecharge");
        }else if(type == 5){ //限时活动
            RedirectUtility.navigateTo("/pages/activitys/limitactivity/limitactivity");
        }else if(type == 6){ //商品详情
            RedirectUtility.navigateTo("/pages/mall/goodsdetail/goodsdetail?product_id=" + options.id);
        }else if(type == 7){ //订单列表
            RedirectUtility.navigateTo("/pages/users/order/order");
        }else if(type == 8){ //卡券列表
            RedirectUtility.navigateTo("/pages/users/coupons/coupons");
        }else if(type == 9){ //活动详情
            RedirectUtility.navigateTo("/pages/activitys/limitactivitydetail/limitactivitydetail?product_id=" + options.id);
        }else if(type == 10){ //最新油价
            RedirectUtility.navigateTo("/pages/oilprice/oilprice");
        }else if(type == 11){ //易捷海购
            RedirectUtility.navigateTo("/pages/yjshopping/yjshopping?shoppingUrl=" + options.urls);
        }
    },
    queryEntranceList(){
        APIUtility.get({
            url: AppConfig.apiList.queryEntranceList,
            params: {},
            succ: (res) => {
                let resultData = [];
                for(let i = 0; i < res.list.length; i++){
                    if(res.list[i].status == 0){
                        resultData.push(res.list[i])
                    }
                }

                resultData.map((item)=>{
                    item.description = JSON.parse(item.description)
                })
                resultData.sort(this.compare);

                this.setData({
                    dataList: resultData,
                })
                console.log("*********", resultData);
                
                // this.queryNewProductList();
                this.queryHomeProductList();
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
    queryNewProductList(){
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryNewProductList,
            succ: (res) => {
                let goodsList = [];
                let list = res.list || [];
                list.map((item) => {
                    item.goods_sale_price = (item.sale_price / 100).toFixed(2);
                    item.face =  (item.face / 100).toFixed(2);
                    item.cover_img = AppConfig.imageAddr + item.cover_img;
                })
                for(let i = 0; i < list.length; i++){
                    if(i < 4){ // 最多显示4条数据
                        goodsList.push(list[i])
                    }
                }
                this.setData({
                    mGoodsList: goodsList
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
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.queryEntranceList();
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
        this.queryEntranceList();
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
    gotoModel(event){
        let index = event.currentTarget.dataset.index;

        if(index == 10001){ //限时特价
            RedirectUtility.navigateTo("/pages/activitys/limitactivity/limitactivity");
        }else if(index == 10002){ //申办油卡 
            RedirectUtility.navigateTo("/pages/card/carddescription/carddescription");
        }else if(index == 10003){ //油卡充值 
            RedirectUtility.navigateTo("/pages/recharge/oilcardrecharge/oilcardrecharge");
        }else if(index == 10004){ //话费充值
            RedirectUtility.navigateTo("/pages/recharge/phonerecharge/phonerecharge");
        }else if(index == 10005){ //流量充值
            RedirectUtility.navigateTo("/pages/recharge/mobileflowrecharge/mobileflowrecharge");
        }else if(index == 10006){ //视频充值
            RedirectUtility.navigateTo("/pages/recharge/videorecharge/videorecharge");
        }else if(index == 10007){ //最新油价
            RedirectUtility.navigateTo("/pages/oilprice/oilprice");
        }else if(index == 10008){ //优惠券包
            RedirectUtility.navigateTo("/pages/users/coupons/coupons");
        }else if(index == 10009){ //更多

        }else if(index.indexOf("https") != -1){ //易捷海购

            let urls = encodeURIComponent(index);
            RedirectUtility.navigateTo("/pages/yjshopping/yjshopping?shoppingUrl=" + urls);
        }
    },
    gotoDetail(event) {
        let productType = event.currentTarget.dataset.type;

        if(productType == 1 || productType == 10 || productType == 11){ //卡券商品 | 实物商品
            RedirectUtility.navigateTo("/pages/mall/goodsdetail/goodsdetail?product_id=" + event.currentTarget.dataset.productId);
        }else if(productType == 2){ //话费充值
            RedirectUtility.navigateTo("/pages/recharge/phonerecharge/phonerecharge");
        }else if(productType == 3 || productType ==5){ //国内流量充值 | 省内流量充值
            RedirectUtility.navigateTo("/pages/recharge/mobileflowrecharge/mobileflowrecharge");
        }else if(productType == 4){ //在线开卡
            RedirectUtility.navigateTo("/pages/card/carddescription/carddescription");
        }else if(productType == 6){ //中石化加油卡充值
            RedirectUtility.navigateTo("/pages/recharge/oilcardrecharge/oilcardrecharge");
        }else if(productType == 7){ //中石油加油卡充值
            
        }else if(productType == 8){ //视频会员充值
            RedirectUtility.navigateTo("/pages/recharge/videorecharge/videorecharge");
        }else if(productType == 9){ //兴业银行开卡
            
        }
    },
    gotoMore(event){
        let type = event.currentTarget.dataset.type;
        // RedirectUtility.navigateTo("/pages/mall/goods/goods?categoryId=" + type);
        RedirectUtility.navigateTo("/pages/mall/goodsmenu/goodsmenu");
    },
    queryHomeProductList(){
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryHomeDataList,
            params: {
                plat_tag: AppConfig.plat_tag
            },
            succ: (res) => {
                let list = res.list || [];
                for(let i = 0; i < list.length; i++){
                    list[i].module_url = AppConfig.imageAddr + list[i].module_url;
                    (list[i].productList).map((item)=>{
                        item.goods_sale_price = (item.sale_price / 100).toFixed(2);
                        item.face =  (item.face / 100).toFixed(2);
                        item.cover_img = item.cover_img ? AppConfig.imageAddr + item.cover_img : "";
                    })
                }
                
                this.setData({
                    mHomeGoodsList: list
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
})