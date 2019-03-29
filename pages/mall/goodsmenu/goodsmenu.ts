import { RedirectUtility } from "../../../utils/redirect";
import { DialogUtility } from "../../../utils/dialog";
import { APIUtility } from "../../../utils/api";
import { AppConfig } from "../../../config";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        shareTag: "0",
        scene: "0",
        bankUrl: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.queryMenusList();
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },
    queryMenusList() {
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryMenusList,
            succ: (res) => {
              let list = [];
              for (let key in res.list){
                  let datas = res.list[key].subdata
                  let goodsMenu =[]
                  datas.map((item)=>{
                      let subDatas = item.subdata
                      for(let i = 0; i< subDatas.length;i++){
                        goodsMenu.push(subDatas[i])
                      }
                  })
                  let menusData= {
                      menus_name: key,
                      menus_data: res.list[key],
                      menus_datas: goodsMenu
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