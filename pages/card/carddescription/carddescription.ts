// pages/login/login.js
import { GuideModalUtil } from "../../../utils/guidemodal";
import { RedirectUtility } from "../../../utils/redirect";
import { APIUtility } from "../../../utils/api";
import { AppConfig } from "../../../config";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        descList: [],
        isChecked: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.queryDictionary("CardNoteItem");
    },
    queryDictionary(type){
        APIUtility.get({
            url: AppConfig.apiList.queryDictionary,
            params: { enum_type: type},
            succ: (res) => {
                if(type == "CardNoteItem"){
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
                    this.queryDictionary("IsCardAccountOpen");
                }else if(type == "IsCardAccountOpen"){
                    let data = res.list || [];
                 
                    let isRechargeOil = true
                    let rechargeMsg = ''
                    if(!!data.length && data[0].status == '0'){
                        isRechargeOil = false
                        rechargeMsg= data[0].remark
                    }

                    this.setData({
                        isRechargeOil: isRechargeOil,
                        rechargeMsg: rechargeMsg
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
        this.queryDictionary("CardNoteItem");
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
            path: '/pages/home/home?page_type=2',
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
    changeStatus(event){
        let click = event.currentTarget.dataset.type;
        if(click == 1){
            this.setData({
                isChecked: true
            })
        }else if(click == 2){
            this.setData({
                isChecked: false
            })
        }
    },
    gotoAgreenment(){
        RedirectUtility.navigateTo("/pages/card/cardagreement/cardagreement");
    },
    gotoNext(){
        RedirectUtility.navigateTo("/pages/card/cardinformation/cardinformation");
    }
})