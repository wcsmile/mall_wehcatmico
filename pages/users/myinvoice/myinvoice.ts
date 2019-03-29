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
        isChecked: true,
        totalMoney: 0.00,
        invoiceList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        
    },
    queryIncoiceList(){
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryMyInvoiceList,
            succ: (res) => {
                let invoiceLists = [];
                for (let key in res){
                    let year = key.substring(0, 4)
                    let month = key.substring(4, key.length)
                    res[key].map((item) => {
                        item.ischecked = true;
                        item.pay_amounts = (item.pay_amount / 100.00).toFixed(2);
                        item.product_counts = "共" + item.product_count + "件商品"
                      })
                    let invoiceData= {
                        date_name: year + "年" + month + "月",
                        data: res[key]
                    }
                    invoiceLists.push(invoiceData)
                } 
                 
                this.setData({
                    invoiceList: invoiceLists
                })
                this.calculationMoney();
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("发票列表加载失败");
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
        this.queryIncoiceList();
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
        this.queryIncoiceList();
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },
    changeStatus(event){
        let click = event.currentTarget.dataset.type;
        let templist = this.data.invoiceList;
        let index = event.currentTarget.dataset.index;
        let date = event.currentTarget.dataset.date;
        let first_index;
        for(let i = 0; i < templist.length; i++){
            if(templist[i].date_name == date){
                first_index = i;
            }
        }
        if(click == 1){ //选中
            templist[first_index].data[index].ischecked = true;
            let num = 0;
            let allNum = 0;
            for (let i = 0; i < templist.length; i++) {
                for(let j = 0; j < templist[i].data.length; j++){
                    if (templist[i].data[j].ischecked) {
                        num ++
                    }
                    allNum ++
                }
            }
            if(allNum == num){
                this.setData({
                  isChecked: true,
                  invoiceList: templist
                })
            }else{
              this.setData({
                invoiceList: templist
              })
            }  
        }else if(click == 2){ //取消选中
            templist[first_index].data[index].ischecked = false;
            this.setData({
                isChecked: false,
                invoiceList: templist
            })
        }
        this.calculationMoney();
    },
    changeAll(event){
        let click = event.currentTarget.dataset.type;
        let templist = this.data.invoiceList;
        if(click == 1){ //全选
            for(let i = 0; i< templist.length; i++){
              for(let j= 0;j< templist[i].data.length;j++){
                templist[i].data[j].ischecked = true
              }
            }
            this.setData({
                isChecked: true,
                invoiceList: templist
            })
        }else if(click == 2){ //取消全选
            for(let i = 0; i< templist.length; i++){
              for(let j= 0;j< templist[i].data.length;j++){
                templist[i].data[j].ischecked = false
              }
            }
            this.setData({
                isChecked: false,
                invoiceList: templist
            })
        }
        this.calculationMoney();
    },
    calculationMoney(){
        let templist = this.data.invoiceList;
        
        let payMoney = 0
        let sum = 0
        let postage = 0
        let orderIds = ""
        
        for (let i = 0; i < templist.length; i++) {
          for(let j = 0; j < templist[i].data.length; j++){
            if (templist[i].data[j].ischecked) {
                payMoney += parseInt(templist[i].data[j].pay_amount)
                sum += parseInt(templist[i].data[j].pay_amount) - parseInt(templist[i].data[j].postage);
                postage += parseInt(templist[i].data[j].postage);
                orderIds += templist[i].data[j].order_detail_id + "|";
            }
          }
        }
        this.setData({
          totalMoney: (payMoney / 100.00).toFixed(2),
          payAmount: sum,
          postage: postage,
          orderIds: orderIds.substring(0, orderIds.length - 1)
        })
      },
    gotoHistory(){
        RedirectUtility.navigateTo("/pages/users/invoicehistory/invoicehistory");
    },
    gotoNext(){
        // if(!this.data.orderIds){
        //     DialogUtility.tip("请选择需要开发票的订单");
        //     return
        // }
        RedirectUtility.navigateTo("/pages/users/inputinvoice/inputinvoice?payAmount=" + this.data.payAmount + "&postage=" + this.data.postage + "&orderIds=" + this.data.orderIds);
    },
    gotoOrderDetail(event) {
        let currentIndex = event.currentTarget.dataset.index;
        RedirectUtility.navigateTo("/pages/users/orderdetail/orderdetail?orderNo=" + currentIndex);
    }
})