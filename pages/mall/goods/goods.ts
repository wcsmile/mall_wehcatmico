import { GuideModalUtil } from "../../../utils/guidemodal";
import { AppConfig } from "../../../config";
import { RedirectUtility } from "../../../utils/redirect"
import { APIUtility } from "../../../utils/api";
import { DialogUtility } from "../../../utils/dialog";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        sortType: 0,  // 0: 默认排序  1: 按照交易数量排序  2: 按照评价排序  3: 按照价格升序   4: 按照价格降序
        clickTab: 0,

        mGoodsList: [],
        requestComplete: false,
        pi: 1,
        ps: 8,
        category: "",
        hasMoreData: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        
        this.setData({
            category: options.categoryId || ""
        })

        if(options.type){
            this.setData({
                clickTab: options.type || "",
                sortType: 3
            })
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
        this.setData({
            requestComplete: false,
            pi: 1,
            mGoodsList: []
        })
        // if(this.data.clickTab == 0){
        //     this.queryNewProductList();
        // }else{
        //     this.queryGoodsList();
        // }
        this.queryGoodsList();
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
        this.data.mGoodsList = []; 
        // if(this.data.clickTab == 0){
        //     this.queryNewProductList();
        // }else{
        //     this.data.pi = 1;
        //     this.queryGoodsList();
        // }
        this.data.pi = 1;
        this.queryGoodsList();
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        // if(this.data.clickTab != 0){
        //     if (this.data.hasMoreData) {
        //         this.queryGoodsList();
        //     } else {
        //         DialogUtility.tip("没有更多数据");
        //     }
        // }
        if (this.data.hasMoreData) {
            this.queryGoodsList();
        } else {
            DialogUtility.tip("没有更多数据");
        }
    },
    queryNewProductList(){
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryNewProductList,
            succ: (res) => {
                let list = res.list || [];
                list.map((item) => {
                    item.goods_price = "¥" + (item.sale_price / 100).toFixed(2);
                    item.goods_face =  "¥" + (item.face / 100).toFixed(2);
                    item.goods_image = AppConfig.imageAddr + item.cover_img;
                    item.goods_name = item.product_name
                    item.product_id = item.product_id
                    item.goods_ischange = true
                })
                this.setData({
                    mGoodsList: list
                })
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
    queryGoodsList() {
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryProductList,
            params: { 
                pi: this.data.pi, 
                ps: this.data.ps, 
                category: this.data.category, 
                plat_tag: AppConfig.plat_tag,
                sort_type:  this.data.sortType
            },
            succ: (res) => {
                let list = [];
                res.list.forEach(item => {
                    let record = {
                        product_id: item.product_id,
                        goods_image: AppConfig.imageAddr + item.cover_img, //AppConfig.imageAddr + 
                        goods_name: item.product_name,
                        goods_price: "¥" + (item.sale_price / 100).toFixed(2),
                        goods_face: "¥" + (item.face / 100).toFixed(2),
                        goods_ischange: true,
                        product_type: item.product_type
                    }
                    list.push(record);
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
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: '品质生活  优惠多多',
            path: '/pages/home/home?page_type=0',
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
    switchTab(event) {
        let currentType = event.currentTarget.dataset.type;
        this.data.mGoodsList = [];
        this.data.requestComplete = false;
        this.data.pi = 1;
        if(currentType == "0"){ //最新上架
        //   this.queryNewProductList()
            this.setData({
                sortType: 0
            })
        }else if(currentType == "1"){ //价格降序
            this.setData({
                sortType: 4
            })
        }else if(currentType == "2"){ //价格升序
            this.setData({
                sortType: 3
            })
        }else if(currentType == "3"){ //销量
            this.setData({
                sortType: 1
            })
        }
        this.queryGoodsList()
        
        this.setData({
            clickTab: currentType
        });
    },
    gotoDetail(event) {
        let productType = event.currentTarget.dataset.type;
        console.log("******************", productType, event.currentTarget.dataset.id);

        if(productType == 1 || productType == 10 || productType == 11){ //卡券商品 | 实物商品
            RedirectUtility.navigateTo("/pages/mall/goodsdetail/goodsdetail?product_id=" + event.currentTarget.dataset.id);
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