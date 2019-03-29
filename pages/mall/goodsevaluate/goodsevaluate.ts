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
        mGoodsEvaluateList: [],
        requestComplete: false,
        pi: 1,
        ps: 8,
        hasMoreData: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            productId: options.productId
        })
        this.queryProductDetail();
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
        this.data.pi = 1;
        this.data.mGoodsEvaluateList = []; 
        this.queryGoodsEvaluateList();
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.hasMoreData) {
            this.queryGoodsEvaluateList();
        } else {
            DialogUtility.tip("没有更多数据");
        }
    },
    queryProductDetail() {
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryProductDetail,
            params: { 
                product_id: this.data.productId, 
                plat_tag: AppConfig.plat_tag 
            },
            succ: (res) => {
                let datas = res.data
                res.data.sale_price = (res.data.sale_price / 100).toFixed(2)
                res.data.face = (res.data.face / 100).toFixed(2)
                res.data.cover_img = AppConfig.imageAddr + res.data.cover_img
                let shopInfo = datas.shopinfo
                res.data.images.map((item) => {
                    item.image_url = AppConfig.imageAddr + item.image_url;
                    if(item.image_type == 1){
                        res.data.cover_image = item.image_url;
                    }
                })

                if(res.data.evaluateinfo){
                    let average_star_level = parseFloat(res.data.evaluateinfo.average_star_level)
                    let evaluateNum = Math.floor(average_star_level);
                    let isHalf = 0;
                    if(average_star_level != evaluateNum){
                        isHalf = 0.5;
                    }
                    
                    this.setData({
                        nowEvaluateNum: evaluateNum,  
                        noEvaluateNum: isHalf == 0 ? 5 - evaluateNum : 5 - evaluateNum - 1,
                        nowHalfEvaluateNum: isHalf,
                        average_star_level: average_star_level.toFixed(1)
                    })
                }
                
                this.setData({
                    requestComplate: true,
                    productInfo: res.data,
                    orderPrice: res.data.sale_price,
                    maxNumLimt: res.data.max_limit,
                    mallIcon: shopInfo.logo_url ? (AppConfig.imageAddr + shopInfo.logo_url) : this.data.mallIcon,
                    status: res.data.status,
                    isCollect: res.data.favorite_id
                })
                this.queryGoodsEvaluateList();
            },
            fail: (errData) => {
                console.log("加载失败", errData);
                DialogUtility.tip("商品已下架，不能购买");
                this.setData({
                    requestComplate: false
                })
            },
            compelete: () => {
                DialogUtility.close(this);
            }
        })
    },
    queryGoodsEvaluateList() {
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryGoodsEvaluateList,
            params: { 
                pi: this.data.pi, 
                ps: this.data.ps, 
                product_id: this.data.productId
            },
            succ: (res) => {
                let list = res.evaluation_list || [];
                list.forEach(item => {
                    item.star_level = parseInt(item.star_level),
                    item.star_level_no = 5 - parseInt(item.star_level),
                    item.evaluate_content = item.evaluate_content || "暂无"
                })

                let lists = this.data.mGoodsEvaluateList;
                if(this.data.pi == 1){
                    let lists = []
                }
                let mGoodsEvaluateList = list;
                if(mGoodsEvaluateList.length < this.data.ps){
                    this.setData({
                        mGoodsEvaluateList: lists.concat(mGoodsEvaluateList),
                        hasMoreData: false
                    })
                }else{
                    this.setData({
                        mGoodsEvaluateList: lists.concat(mGoodsEvaluateList),
                        hasMoreData: true,
                        pi: this.data.pi + 1
                    })
                }

                console.log("*********************************", this.data.mGoodsEvaluateList);
                
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
    }
})