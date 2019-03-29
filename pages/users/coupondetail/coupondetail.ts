import { APIUtility } from "../../../utils/api";
import { AppConfig } from "../../../config";
import { QRCodeApi } from "../../../utils/qrcode";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        id:"",
        couponNo: "",
        validcode: "",
        phone:"95105888",
        anotherPhone: "95105988"
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let detail = JSON.parse(options.detail);
        let coupon_detail = JSON.parse(detail.coupon_detail);
        this.setData({
            name: detail.title,
            cost: detail.cost,
            face: detail.face,
            minimum_amount: detail.minimum_amount,
            startTime: detail.expire_start_time,
            endTime: detail.expire_end_time,
            status: detail.statusDesc,
            couponNo: coupon_detail.coupon_no,
            validcode: coupon_detail.valid_code,
        })
        QRCodeApi.draw(this.data.couponNo, "couponNoCanvas", 200, 200);
        QRCodeApi.draw(this.data.validcode, "validcodeCanvas", 200, 200);
    },
    queryCouponDetail(productID) {
        APIUtility.get({
            url: AppConfig.apiList.queryCouponDetailInfo,
            params: { id: this.data.id },
            succ: (res) => {
                res.data.cost = (res.data.cost / 100.00).toFixed(2);
                res.data.face = (res.data.face / 100.00).toFixed(2);
                res.data.minimum_amout = (res.data.minimum_amout / 100.00).toFixed(2);
                let status = "";
                if(res.data.status == 0){
                    status = "未使用";
                }else if(res.data.status == 1){
                    status = "已使用";
                }else if(res.data.status == 2){
                    status = "已过期";
                }
                let coupon_detail = JSON.parse(res.data.coupon_detail);
                this.setData({
                    productInfo: res.data,
                    name: res.data.title,
                    cost: res.data.cost,
                    face: res.data.face,
                    minimum_amout: res.data.minimum_amout,
                    startTime: res.data.expire_start_time,
                    endTime: res.data.expire_end_time,
                    status: status,
                    couponNo: coupon_detail.coupon_no,
                    validcode: coupon_detail.valid_code,
                })
                QRCodeApi.draw("this.data.couponNo","couponNoCanvas", 200, 200);
                QRCodeApi.draw("this.data.validcode","validcodeCanvas", 200, 200);
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
    callPhone: function(event){
        let phone = event.currentTarget.dataset.phone;
        wx.makePhoneCall({  
            phoneNumber: phone, //此号码并非真实电话号码，仅用于测试  
            success:function(){  
              console.log("拨打电话成功！")  
            },  
            fail:function(){  
              console.log("拨打电话失败！")  
            }  
          })  
    }
})