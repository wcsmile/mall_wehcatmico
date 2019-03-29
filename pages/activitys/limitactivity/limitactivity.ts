import { RedirectUtility } from "../../../utils/redirect";
import { APIUtility } from "../../../utils/api";
import { AppConfig } from "../../../config";
import { DialogUtility } from "../../../utils/dialog";

Page({
    /**
     * 页面的初始数据
     */
    data: {
        vCacheData:{},
        mGoodsList: [],
        requestComplete: false,
        clickTab: 0,
        ps: 8,
        hasMoreData: true,
        isSubmit: true,

        startGoodsNum: 0
    },
    queryLimitActivityList(type,hasMoreData) {
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryLimitActivityList,
            params: {
                pi:this.data.pi,
                ps: this.data.ps,
                plat_tag: AppConfig.plat_tag, 
                activitystatus: type
            },
            succ: (res) => {
                let list = res.list || [];
                list.map((item) => {
                    item.sale_prices = (item.sale_price / 100.00).toFixed(2);
                    item.discount_prices = (item.discount_price / 100.00).toFixed(2);
                    item.cover_img = AppConfig.imageAddr + item.cover_img;
                    item.status = this.data.clickTab
                })
                this.setData({
                    startGoodsNum: res.proCount > 99 ? "..." : res.proCount
                })
                
                let lists = this.data.mGoodsList;
                if(this.data.pi == 1){
                    let lists = []
                }
                let mGoodsList = list;
                if(mGoodsList.length < this.data.ps){
                    this.setData({
                        mGoodsList: lists.concat(mGoodsList),
                        hasMoreData: false
                    })
                }else{
                    this.setData({
                        mGoodsList: lists.concat(mGoodsList),
                        hasMoreData: true,
                        pi: this.data.pi + 1
                    })
                }
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("加载失败");
            },
            compelete: () => {
                this.setData({ requestComplete: true });
                DialogUtility.close(this);
            }
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        
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
        this.setData({
            pi: 1,
            mGoodsList: []
        })
        this.queryLimitActivityList(this.data.clickTab, this.data.hasMoreData);
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
    switchTab(event) {
        let currentType = event.currentTarget.dataset.type;
        this.setData({
            clickTab: currentType,
        });
        this.data.pi = 1;
        this.data.mGoodsList = [];
        this.queryLimitActivityList(currentType, true);
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.data.pi = 1;
        this.data.mGoodsList = []; 
        this.queryLimitActivityList(this.data.clickTab, true);
        wx.stopPullDownRefresh();
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.hasMoreData) {
            this.queryLimitActivityList(this.data.clickTab,this.data.hasMoreData);
        } else {
            DialogUtility.tip("没有更多数据");
        }
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: '品质生活  优惠多多',
            path: '/pages/home/home?page_type=5',
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
    gotoOrderDetail(event) {
        let currentIndex = event.currentTarget.dataset.index;
        let productType = event.currentTarget.dataset.type;
        let activityTag = event.currentTarget.dataset.tag;
        
        if(productType == 1 || productType == 10){ //卡券商品 | 实物商品
            RedirectUtility.navigateTo("/pages/activitys/limitactivitydetail/limitactivitydetail?product_id=" + currentIndex + "&tags=" + activityTag);
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
    }
})