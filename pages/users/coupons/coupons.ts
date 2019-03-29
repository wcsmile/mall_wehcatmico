import { RedirectUtility } from "../../../utils/redirect";
import { APIUtility } from "../../../utils/api";
import { AppConfig } from "../../../config";
import { DialogUtility } from "../../../utils/dialog";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        vCurrentCouponList: [],
        vCouponListAll: [],
        vCouponListNoUse: [],
        vCouponListUsed: [],
        vCouponListExpired: [],
        requestComplete: false,
        clickTab:0,
        couponDictionaryList: {}
    },
    queryDictionary(){
        APIUtility.get({
            url: AppConfig.apiList.queryDictionary,
            params: { enum_type: "CouponStatus"},
            succ: (res) => {

                let resultData = {};

                (res.list||[]).forEach(item => {
                    resultData[item.value] = item.description
                });
                this.setData({
                    couponDictionaryList: resultData
                })
            },
            fail: (error) => {
                console.log(error);
            }
        })
    },
    queryCouponsList() {
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryCouponInfo,
            succ: (res) => {
                let unusedList = res.result["0"] || [];
                let usedList = res.result["1"] || [];
                let expiredList = res.result["2"] || [];

                let allList = []
                allList.push(...unusedList)
                allList.push(...usedList)
                allList.push(...expiredList)
                allList.map((item) => {
                    item.statusDesc = this.data.couponDictionaryList[item.status];
                    item.cost = (item.cost / 100.00).toFixed(2);
                    item.face = (item.face / 100.00).toFixed(2);
                    item.minimum_amount = (item.minimum_amount / 100.00).toFixed(2);
                })

                let currentList = [];
                if(this.data.clickTab == "0"){
                    currentList = allList;
                }else if(this.data.clickTab == "1"){
                    currentList = unusedList;
                }else if(this.data.clickTab == "2"){
                    currentList = usedList;
                }else if(this.data.clickTab == "3"){
                    currentList = expiredList;
                }
                this.setData({   
                    vCouponListAll: allList,
                    vCouponListNoUse: unusedList,
                    vCouponListUsed: usedList,
                    vCouponListExpired: expiredList,
                    vCurrentCouponList: currentList
                });
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
        this.queryDictionary();
        this.queryCouponsList();
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
        let vCurrentOrderList = [];
        if(currentType == "0"){
            vCurrentOrderList = this.data.vCouponListAll;
        }else if(currentType == "1"){
            vCurrentOrderList = this.data.vCouponListNoUse;
        }else if(currentType == "2"){
            vCurrentOrderList = this.data.vCouponListUsed;
        }else if(currentType == "3"){
            vCurrentOrderList = this.data.vCouponListExpired;
        }
        this.setData({
            vCurrentCouponList: vCurrentOrderList,
            clickTab: currentType
        });
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.queryCouponsList();
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },
    gotoUse(event){
        let currentIndex = event.currentTarget.dataset.index;
        RedirectUtility.navigateTo("/pages/users/coupondetail/coupondetail?detail= " + JSON.stringify(this.data.vCurrentCouponList[currentIndex]));
    }
})