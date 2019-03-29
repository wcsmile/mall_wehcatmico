// pages/login/login.js
import { RedirectUtility } from "../../../utils/redirect";
import { AppConfig } from "../../../config";
import { APIUtility } from "../../../utils/api";
import { DialogUtility } from "../../../utils/dialog";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        mGoodsList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.queryMyCollectionList();
    },
    queryMyCollectionList(){
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryMyCollectionList,
            params: { 
                plat_tag: AppConfig.plat_tag
            },
            succ: (res) => {
                let list = res.list || [];
                list.map((item) => {
                    item.goods_sale_price = (item.sale_price / 100).toFixed(2);
                    item.face =  (item.face / 100).toFixed(2);
                    item.cover_img = AppConfig.imageAddr + item.cover_img;
                })
                this.setData({
                    mGoodsList: list
                })
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("加载我的收藏失败");
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
        this.queryMyCollectionList();
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },
    gotoDetail(event) {
        let productType = event.currentTarget.dataset.type;

        if(productType == 1 || productType == 10){ //卡券商品 | 实物商品
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
})