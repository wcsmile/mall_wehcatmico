import { APIUtility } from "../../utils/api";
import { AppConfig } from "../../config";
import { DialogUtility } from "../../utils/dialog";
import { RedirectUtility } from "../../utils/redirect"

Page({

    /**
     * 页面的初始数据
     */
    data: {
        menusList: [],
        menusData: {},
        curNav: 0,
        curIndex: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      this.queryMenusList();
    },
    queryMenusList() {
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryMenusList,
            succ: (res) => {
              let list = [];
              for (let key in res.list){
                  let menusData= {
                      menus_name: key,
                      menus_data: res.list[key]
                  }
                  list.push(menusData)
              } 

              this.setData({
                menusList: list,
                curNav: list[0].menus_data.data.class_id,
                menusData: list[0].menus_data.subdata
              })
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("分类列表加载失败");
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
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },
    onPullDownRefresh() {
        this.queryMenusList();
        wx.stopPullDownRefresh();
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
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: '品质生活  优惠多多',
            path: '/pages/menus/menus',
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
    //事件处理函数  
    switchRightTab (e) {
      // 获取item项的id，和数组的下标值  
      let id = e.currentTarget.dataset.id;
      let index = parseInt(e.currentTarget.dataset.index);
      // 把点击到的某一项，设为当前index  
      this.setData({
        curNav: id,
        curIndex: index,
        menusData: this.data.menusList[index].menus_data.subdata
      })
    },
    chooseGoods(event){
        let id = event.currentTarget.dataset.id;
        let name = event.currentTarget.dataset.name;

        if(name == "办卡"){
            RedirectUtility.navigateTo("/pages/card/carddescription/carddescription");
        }else if(name == "充值"){
            RedirectUtility.navigateTo("/pages/recharge/oilcardrecharge/oilcardrecharge");
        }else if(name == "话费"){
            RedirectUtility.navigateTo("/pages/recharge/phonerecharge/phonerecharge");
        }else if(name == "流量"){
            RedirectUtility.navigateTo("/pages/recharge/mobileflowrecharge/mobileflowrecharge");
        }else if(name == "爱奇艺会员"){
            let type = name.substring(0, name.length - 2)
            RedirectUtility.navigateTo("/pages/recharge/videorecharge/videorecharge?videoType=" + type);
        }else if(name == "优酷会员"){
            let type = name.substring(0, name.length - 2)
            RedirectUtility.navigateTo("/pages/recharge/videorecharge/videorecharge?videoType=" + type);
        }else if(name == "腾讯会员"){
            let type = name.substring(0, name.length - 2)
            RedirectUtility.navigateTo("/pages/recharge/videorecharge/videorecharge?videoType=" + type);
        }else{
            RedirectUtility.navigateTo("/pages/mall/goods/goods?categoryId=" + id);
        }
    }
})