import { APIUtility } from "../../../utils/api";
import { AppConfig } from "../../../config";
import { DialogUtility } from "../../../utils/dialog";
import { NumberUtility } from "../../../utils/number";
import { AddressUtil } from "../../../utils/address";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isChecked: false,
        name: "",
        phone: "",
        province: "",
        city: "",
        area: "",
        town: "",
        address: "",
        type: "",
        expressId: "",

        provinceCode: "",
        cityCode: "",
        areaCode: "",
        townCode: "",

        initChooseAddrData: {
            "canton_code":"0",
            "canton_name":"请选择",
            "jd_code":"",
            "parent_code":"0",
            "simple_spell":"请选择",
            "sort_id":"0",
            "spell":"请选择",
            "is_click": true
        },
        chooseAddressList: [],
        addressList: []
    },
    setTitle(title){  //设置标题
        wx.setNavigationBarTitle({  
            title: title
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            type: options.type,
            expressId: options.id || "",
            name: options.name || "",
            phone: options.phone || "",
            province: options.province || "",
            city: options.city || "",
            area: options.area || "",
            town: options.town || "",
            address: options.address || "",
            isChecked: options.default == 0 ? true : false,

            provinceCode: options.provinceCode || "",
            cityCode: options.cityCode || "",
            areaCode: options.areaCode || "",
            townCode: options.townCode || "",
        })
        if(this.data.type == 0){
            this.setTitle("新增收货地址")
        }else{
            this.setTitle("编辑收货地址")
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
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh();
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
    inputNmae(event){
        this.setData({
            name: event.detail.value
        })
    },
    inputPhone(event){
        this.setData({
            phone: event.detail.value
        })
    },
    inputAddress(event){
        this.setData({
            address: event.detail.value
        })
    },
    bindRegionChange(event){
        let province = ""
        let city = ""
        let area = ""
        let data = event.detail.value;
        if(data[0] == data[1]){
            province = data[0]
            city = data[0]
            area = data[2]
        }else{
            if(data[1] == "县"){
                province = data[0]
                city = data[0]
                area = data[2]
            }else{
                province = data[0]
                city = data[1]
                area = data[2]
            }
        }
        this.setData({
            province: province,
            city: city,
            area: area
        })
    },
    addAddress(){ //添加收货地址
        if(!this.data.name){
            DialogUtility.tip("请输入姓名");
            return;
        }
        if(!this.data.phone){
            DialogUtility.tip("请输入手机号码");
            return;
        }
        if(NumberUtility.trim(this.data.phone).length != 11 || !NumberUtility.phoneValid(this.data.phone)){
            DialogUtility.tip("请输入正确的手机号码");
            return;
        }
        if(!this.data.province || !this.data.city || !this.data.area || !this.data.address){
            DialogUtility.tip("请输入收货地址");
            return;
        }
        DialogUtility.loading("提交中");
        APIUtility.get({
            url: AppConfig.apiList.addMyAddress,
            params: { 
                recipient: this.data.name,  //姓名
                contact_no: this.data.phone, //手机号
                province_code: this.data.provinceCode,  //省
                city_code: this.data.cityCode,   //市
                area_street_code: this.data.areaCode,  //区
                town_code: this.data.townCode, //镇
                address: this.data.address,  //详细地址
                is_default: this.data.isChecked ? 0 : 1
            },
            succ: (res) => {
                DialogUtility.tip("添加收货地址成功");
                setTimeout(() => {
                    wx.navigateBack({
                        delta: 1
                    })
                }, 500);
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("添加收货地址失败");
            },
            compelete: () => {
                DialogUtility.close(this);
            }
        })
    },
    updateAddress(){ // 修改收货地址
        if(!this.data.name){
            DialogUtility.tip("请输入姓名");
            return;
        }
        if(!this.data.phone){
            DialogUtility.tip("请输入手机号码");
            return;
        }
        if(NumberUtility.trim(this.data.phone).length != 11 || !NumberUtility.phoneValid(this.data.phone)){
            DialogUtility.tip("请输入正确的手机号码");
            return;
        }
        if(!this.data.province || !this.data.city || !this.data.area || !this.data.address){
            DialogUtility.tip("请输入收货地址");
            return;
        }
        DialogUtility.loading("提交中");
        APIUtility.get({
            url: AppConfig.apiList.updateMyAddress,
            params: { 
                express_id: this.data.expressId,
                recipient: this.data.name,  //姓名
                contact_no: this.data.phone, //手机号
                province_code: this.data.provinceCode,  //省
                city_code: this.data.cityCode,   //市
                area_street_code: this.data.areaCode,  //区
                town_code: this.data.townCode, //镇
                address: this.data.address,  //详细地址
                is_default: this.data.isChecked ? 0 : 1
            },
            succ: (res) => {
                DialogUtility.tip("修改收货地址成功");
                setTimeout(() => {
                    wx.navigateBack({
                        delta: 1
                    })
                }, 500);
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("修改收货地址失败");
            },
            compelete: () => {
                DialogUtility.close(this);
            }
        })
    },
    gotoSureAddress(){ //确定
        if(this.data.type == 0){
            this.addAddress();
        }else{
            this.updateAddress();
        }
    },
    gotoChooseAddress(){ //打开地址选择
        this.data.chooseAddressList = []
        let list = [];
        list.push(this.data.initChooseAddrData)
        this.setData({
            chooseAddressList: list
        })
        AddressUtil.showAddressModal();
        this.queryAddressList(0);
    },
    cancelAddress(){
        AddressUtil.closeAddressModal();
    },
    queryAddressList(code){ // 获取地址列表信息
        DialogUtility.loading("加载中");
        APIUtility.get({
            url: AppConfig.apiList.queryAddressList,
            params: { 
                parent_code: code,
            },
            succ: (res) => {
                let list = res.canton_list || []

                if(list.length == 0){
                    let chooseData = this.data.chooseAddressList
                    // chooseData.pop();
                    
                    this.setData({
                        province: chooseData[0].canton_name,
                        city: chooseData[1].canton_name,
                        area: chooseData[2].canton_name,
                        town: chooseData[3].canton_code == 0 ? "" : chooseData[3].canton_name,

                        provinceCode: chooseData[0].canton_code,
                        cityCode: chooseData[1].canton_code,
                        areaCode: chooseData[2].canton_code,
                        townCode: chooseData[3].canton_code == 0 ? "" : chooseData[3].canton_code,
                    })
                    this.cancelAddress();
                }
                let clickList = this.data.chooseAddressList;
                list.map((item)=>{
                    item.is_choose = false
                    for(let i =0; i < clickList.length; i++){
                        if(item.canton_code == clickList[i].canton_code){
                            item.is_choose = true
                        }
                    }
                })

                this.setData({
                    addressList: list
                })
            },
            fail: (error) => {
                console.log(error);
                DialogUtility.tip("获取地址信息失败");
            },
            compelete: () => {
                DialogUtility.close(this);
            }
        })
    },
    gotoChooseAddr(event){
        let itemData = event.currentTarget.dataset.item;
        let index = -1
        let clickList = this.data.chooseAddressList;
        for(let i = 0; i < clickList.length; i++){
            if(clickList[i].canton_code == this.data.initChooseAddrData.canton_code){
                clickList.splice(i, 1)
            }
        }
        
        for(let i = 0; i < clickList.length; i++){
            if(clickList[i].is_click){
                index = i;
                break
            }
        }

        if(index != -1){
            clickList.splice(index, (clickList.length - index))
        }

        clickList.push(itemData)
        clickList.push(this.data.initChooseAddrData)
        this.setData({
            chooseAddressList: clickList
        })

        this.queryAddressList(itemData.canton_code)
    },
    gotoClickAddr(event){
        let itemData = event.currentTarget.dataset.item;
        let index = event.currentTarget.dataset.index;

        let clickList = this.data.chooseAddressList;

        clickList.map((item)=>{
            if(item.canton_code == itemData.canton_code){
                item.is_click = true
            }else{
                item.is_click = false
            }
        })
        this.setData({
            chooseAddressList: clickList
        })
        let code = index == (clickList.length - 1) ? clickList[clickList.length - 2].canton_code : itemData.parent_code
        this.queryAddressList(code)
    }
})