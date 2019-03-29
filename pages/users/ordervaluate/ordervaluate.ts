import { RedirectUtility } from "../../../utils/redirect";
import { AppConfig } from "../../../config";
import { APIUtility } from "../../../utils/api";
import { DialogUtility } from "../../../utils/dialog";

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
        this.queryOrderDetail(options.orderNo);
    },
    queryOrderDetail(orderNo) {
        APIUtility.get({
            url: AppConfig.apiList.queryOrderDetailInfo,
            params: { order_id: orderNo },
            succ: (res) => {
                let item = res.data || []
                let detail = item.product_details;
                
                detail.map((items) => {
                    items.init_pwds = items.init_pwd || "-----"
                    items.cover_img = AppConfig.imageAddr + items.cover_img;
                    items.sale_price = (items.sale_price / 100.00).toFixed(2);
                    items.face = (items.face / 100.00).toFixed(2);
                    items.goods_level = 0
                    items.goods_level_no = 5
                    items.goods_evaluate = ""
                    items.average_star_level = "0.0"
                    items.hand_fee = items.hand_fee != 0 ? (items.hand_fee / 100.00).toFixed(2) + "元" : "免费";
                    if(items.logo_url){
                        this.data.mallIcon = AppConfig.imageAddr + items.logo_url
                    }
                })
                
                this.setData({
                    orderDetailInfo: item,
                    requestComplate: true,
                    productType: detail[0].product_type
                })
            },
            fail: (errData) => {
                console.log("加载失败", errData);
                DialogUtility.tip("加载失败");
                this.setData({
                    requestComplate: false
                })
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
    inputContent(event){
        let index = event.currentTarget.dataset.index;
        let tempList = this.data.orderDetailInfo
        tempList.product_details[index].goods_evaluate = event.detail.value
        this.setData({
            orderDetailInfo: tempList
        })
    },
    addStar(e){
        let ids = e.currentTarget.dataset.ids;
        let in_xin = e.currentTarget.dataset.in;  
        let tempList = this.data.orderDetailInfo
         
        for(let i = 0; i < (tempList.product_details).length; i++){
            if(tempList.product_details[i].order_detail_id == ids){
                let one_2;  
                if (in_xin === 'add'){  
                one_2 = Number(e.currentTarget.id);  
                } else {  
                one_2 = Number(e.currentTarget.id) + tempList.product_details[i].goods_level;  
                } 
                tempList.product_details[i].goods_level = one_2
                tempList.product_details[i].goods_level_no = 5 - one_2
                tempList.product_details[i].average_star_level = (one_2).toFixed(1)
            }
        }
        
        this.setData({
            orderDetailInfo: tempList
        }) 
    },
    gotoOrderList() {
        RedirectUtility.navigateTo("/pages/users/order/order");
    },
    gotoSubmitValuate(){ //提交评价
        DialogUtility.loading("加载中");
        let tempList = this.data.orderDetailInfo
        for(let i = 0; i < (tempList.product_details).length; i++){
            APIUtility.get({
                url: AppConfig.apiList.addOrderEvaluate,
                params: { 
                    order_detail_id: tempList.product_details[i].order_detail_id, 
                    evaluate_content: tempList.product_details[i].goods_evaluate, 
                    star_level: tempList.product_details[i].goods_level
                },
                succ: (res) => {
                    DialogUtility.tip("订单评价成功");
                    wx.navigateBack({
                        delta: 1
                    })
                },
                fail: (error) => {
                    console.log(error);
                    DialogUtility.tip("订单评价失败");
                },
                compelete: () => {
                    DialogUtility.close(this);
                }
            })
        }
    }
})