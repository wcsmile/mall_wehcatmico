import { APIUtility } from "../../../utils/api";
import { AppConfig } from "../../../config";
import { DialogUtility } from "../../../utils/dialog";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        mQuestionList: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    queryQuestionList() {
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryQuestionList,
            succ: (res) => {
                this.setData({ mQuestionList: res.list })
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
        this.queryQuestionList();
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
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },
    showDetail(event) {
        var index = event.currentTarget.dataset.index;
        for (let i = 0; i < this.data.mQuestionList.length; i++) {
            if (i == index) {
                this.data.mQuestionList[i].isShowDetail = !this.data.mQuestionList[i].isShowDetail;
            } else {
                this.data.mQuestionList[i].isShowDetail = false;
            }
        }
        this.setData({ mQuestionList: this.data.mQuestionList });
    }
})