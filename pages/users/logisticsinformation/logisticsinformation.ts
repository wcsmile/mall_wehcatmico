import { RedirectUtility } from "../../../utils/redirect";
import { APIUtility } from "../../../utils/api";
import { AppConfig } from "../../../config";
import { DialogUtility } from "../../../utils/dialog";
import { NumberUtility } from "../../../utils/number";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            orderId: options.orderId
        })
        this.queryDictionary("ExpressCompany")
    },
    queryDictionary(type){
        APIUtility.get({
            url: AppConfig.apiList.queryDictionary,
            params: { enum_type: type},
            succ: (res) => {

                let resultData = {};

                (res.list||[]).forEach(item => {
                    resultData[item.value] = item.description
                });

                if(type == "ExpressCompany"){
                    this.queryDictionary("LogisticsStatus");
                    this.setData({
                        logisticsNameDictionaryList: resultData
                    })
                }else {
                    this.queryLogisticsList();
                    this.setData({
                        logisticsDictionaryList: resultData
                    })
                }
                
            },
            fail: (error) => {
                console.log(error);
            }
        })
    },
    queryLogisticsList() {
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryLogisticsInfo,
            params: { 
                main_order_id: this.data.orderId
            },
            succ: (res) => {
                let list = res.carriage_info || []
                for(let i = 0; i < list.length; i++){
                    list[i].express_name = this.data.logisticsNameDictionaryList[list[i].express_type]
                    list[i].logistics_info = list[i].logistics_info ? JSON.parse(list[i].logistics_info) : []
                    list[i].logistics_status = this.data.logisticsDictionaryList[list[i].logistics_status]
                    list[i].logistics_info.map((item)=>{
                        let tel = NumberUtility.getPhone(item.context)
                        item.phone = tel ? tel[0] : ""     
                    })
                }
                // res.carriage_info.express_name = this.data.logisticsNameDictionaryList[res.carriage_info.express_type]
                // res.carriage_info.logistics_info = res.carriage_info.logistics_info ? JSON.parse(res.carriage_info.logistics_info) : []
                // res.carriage_info.logistics_status = this.data.logisticsDictionaryList[res.carriage_info.logistics_status]
                // res.carriage_info.logistics_info.map((item)=>{
                //     let tel = NumberUtility.getPhone(item.context)
                //     item.phone = tel ? tel[0] : ""     
                // })
                
                this.setData({
                    logisticsList: list
                })
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("物流信息加载失败");
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
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },
    gotoCall(event){
        let phone = event.currentTarget.dataset.phone;
        console.log("************", phone);
        
        wx.makePhoneCall({  
            phoneNumber: phone, //此号码并非真实电话号码，仅用于测试  
            success:function(){  
              console.log("拨打电话成功！")  
            },  
            fail:function(){  
              console.log("拨打电话失败！")  
            }  
        })
    },
    showDetail(event) {
        var index = event.currentTarget.dataset.index;
        let list = this.data.logisticsList;
        
        for (let i = 0; i < list.length; i++) {
            if (i == index) {
                list[i].isShowDetail = !list[i].isShowDetail;
            } else {
                list[i].isShowDetail = false;
            }
        }

        this.setData({ logisticsList: list });
    }
})