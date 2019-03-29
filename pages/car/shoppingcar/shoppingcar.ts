import { BaseAnimation } from "../../../utils/BaseAnimation";
import { GuideModalUtil } from "../../../utils/guidemodal";
import { DialogUtility } from "../../../utils/dialog";
import { APIUtility } from "../../../utils/api";
import { AppConfig } from "../../../config";
import { RedirectUtility } from "../../../utils/redirect"

Page({
    data: {
        delBtnWidth: 200,//删除按钮宽度单位（rpx） 
        windowWidth: 0,
        clickTab: 0,
        totalMoney: 0.00,
        totalNum: 0,
        isChecked: true,

        vCurrentShoppingCarList: [],   //当前正常商品
        vCurrentShoppingCarNoUseList: [],   //当前过期商品

        vDistributionCarAllList: [],  //配送所有数据
        vDistributionCarList: [], //配送有效数据
        vDistributionCarNoUseList: [], //配送中过期

        vLiftingCarAllList: [], //自提所有数据
        vLiftingCarList: [], //自提有效数据
        vLiftingCarNoUseList: [],   //自提中过期

        activityType: {
          1: "限时特价",  
          2: "满减活动",
          3: "特价批发",  
          4: "限时秒杀"
        },
        requestComplete: false
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数  
        this.initEleWidth();
    },
    onReady: function () {
        // 页面渲染完成  
    },
    onShow: function () {
        // 页面显示  
        this.queryShoppingCarList();
    },
    onHide: function () {
        // 页面隐藏  
    },
    onUnload: function () {
        // 页面关闭  
    },
    /**
    * 页面相关事件处理函数--监听用户下拉动作
    */
    onPullDownRefresh: function () {
        this.queryShoppingCarList();
        wx.stopPullDownRefresh();
    },
    touchS: function (e) {
        if (e.touches.length == 1) {
            this.setData({
                //设置触摸起始点水平方向位置  
                startX: e.touches[0].clientX
            });
        }
    },
    touchM: function (e) {
        if (e.touches.length == 1) {
            //手指移动时水平方向位置  
            let moveX = e.touches[0].clientX;
            //手指起始点位置与移动期间的差值  
            let disX = this.data.startX - moveX;
            let delBtnWidth = this.data.delBtnWidth;
            let txtStyle = "";
            let widths = 0;
            if (disX == 0 || disX < 50) {//如果移动距离小于等于0，文本层位置不变  
                widths = 0
            } else if (disX > 50) {//移动距离大于0，文本层left值等于手指移动距离  
                widths = -delBtnWidth;
            }
            //获取手指触摸的是哪一项  
            let index = e.currentTarget.dataset.index;
            let id = e.currentTarget.dataset.id;
            let type = e.currentTarget.dataset.type;
            
            if(type == "use"){
                let templist = this.data.vCurrentShoppingCarList;  //有效数据
              
                for (let i = 0; i < templist.length; i++) {
                    for(let j = 0; j < templist[i].data.length; j++){
                        templist[i].data[j].s_animation = GuideModalUtil.swipe(0);
                    }
                }
                for (let i = 0; i < templist.length; i++) {
                    for(let j = 0; j < templist[i].data.length; j++){
                        if (j == index && templist[i].data[j].product_id == id) {
                          templist[i].data[index].s_animation = GuideModalUtil.swipe(widths);
                        }
                    }
                }
                //更新列表的状态  
                this.setData({
                    vCurrentShoppingCarList: templist
                });
            }else{
                let templist = this.data.vCurrentShoppingCarNoUseList;  //无效数据

                for(let i = 0; i < templist.length; i++){
                    templist[i].s_animation = GuideModalUtil.swipe(0);
                }
                templist[index].s_animation = GuideModalUtil.swipe(widths)

                //更新列表的状态  
                this.setData({
                    vCurrentShoppingCarNoUseList: templist
                });
            }
        }
    },
    //获取元素自适应后的实际宽度  
    getEleWidth: function (w) {
        let real = 0;
        try {
            let res = wx.getSystemInfoSync().windowWidth;
            let scale = (750 / 2) / (w / 2);//以宽度750px设计稿做宽度的自适应  
            real = Math.floor(res / scale);
            return real;
        } catch (e) {
            return false;
            // Do something when catch error  
        }
    },
    initEleWidth: function () {
        let delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
        this.setData({
            delBtnWidth: delBtnWidth
        });
    },
    //点击删除按钮事件  
    delItem (event) {
        let index = event.currentTarget.dataset.index;
        let type = event.currentTarget.dataset.type;
        let id = event.currentTarget.dataset.id;
        let carId;
        if(type == "use"){
            let templist = this.data.vCurrentShoppingCarList;
            for (let i = 0; i < templist.length; i++) {
                for(let j = 0; j < templist[i].data.length; j++){
                    if (j == index && templist[i].data[j].product_id == id) {
                        carId = templist[i].data[index].id;
                    }
                }
            }
        }else{
            let templist = this.data.vCurrentShoppingCarNoUseList
            carId = templist[index].id;
        }
        
        APIUtility.get({
            url: AppConfig.apiList.removeOrderCar,
            params: { 
                cart_ids: carId,
                plat_tag: AppConfig.plat_tag 
            },
            succ: (res) => {
                this.queryShoppingCarList();
                this.setData({
                    vCurrentShoppingCarList: []
                })
            },
            fail: (errData) => {
                console.log("移除购物车失败，稍候再试", errData);
                DialogUtility.tip("移除购物车失败，稍候再试");
            },
            compelete: () => {
                DialogUtility.close(this);
            }
        })
    },
    minusNum(event) {
        let templist = this.data.vCurrentShoppingCarList;
        let index = event.currentTarget.dataset.index;
        let id = event.currentTarget.dataset.id;
        let product_count;
        let first_index;
        for (let i = 0; i < templist.length; i++) {
          for(let j = 0; j < templist[i].data.length; j++){
            if (j == index && templist[i].data[j].product_id == id) {
              first_index = i;
              product_count = parseInt(templist[i].data[index].product_count);
            }
          }
        }
        
        if(product_count == 1){
          return
        }
        if (product_count > 1) {
          this.data.vCurrentShoppingCarList[first_index].data[index].product_count = product_count - 1;
        } else {
          this.data.vCurrentShoppingCarList[first_index].data[index].product_count = 1;
        }

        APIUtility.get({
          url: AppConfig.apiList.operOrderNum,
          params: { 
            change_count: this.data.vCurrentShoppingCarList[first_index].data[index].product_count, 
            cart_id: this.data.vCurrentShoppingCarList[first_index].data[index].id, 
            product_id: id
          },
          succ: (res) => {
            this.setData({
              vCurrentShoppingCarList: this.data.vCurrentShoppingCarList,
          });
            this.calculationMoney();
          },
          fail: (errData) => {
              console.log("数量添加失败", errData);
              DialogUtility.tip("数量添加失败，稍候再试");
          },
          compelete: () => {
              DialogUtility.close(this);
          }
        })
    },
    addNum(event) {
        let templist = this.data.vCurrentShoppingCarList;
        let index = event.currentTarget.dataset.index;
        let id = event.currentTarget.dataset.id;
        let product_count;
        let first_index;
        let max_limit;
        for (let i = 0; i < templist.length; i++) {
          for(let j = 0; j < templist[i].data.length; j++){
            if (j == index && templist[i].data[j].product_id == id) {
              first_index = i;
              product_count = parseInt(templist[i].data[index].product_count);
              max_limit = parseInt(templist[i].data[index].max_limit);
            }
          }
        }

        if (product_count < max_limit) {
            this.data.vCurrentShoppingCarList[first_index].data[index].product_count = product_count + 1;
        } else if (product_count == max_limit) {
            DialogUtility.tip("已达到此商品的限购上限");
            return;
        } else {
            this.data.vCurrentShoppingCarList[first_index].data[index].product_count = max_limit;
        }

        APIUtility.get({
          url: AppConfig.apiList.operOrderNum,
          params: { 
            change_count: this.data.vCurrentShoppingCarList[first_index].data[index].product_count, 
            cart_id: this.data.vCurrentShoppingCarList[first_index].data[index].id,
            product_id: id
          },
          succ: (res) => {
            this.setData({
              vCurrentShoppingCarList: this.data.vCurrentShoppingCarList,
          });
            this.calculationMoney();
          },
          fail: (errData) => {
              console.log("加入购物车失败", errData);
              DialogUtility.tip("数量添加失败，稍候再试");
          },
          compelete: () => {
              DialogUtility.close(this);
          }
        })
    },
    switchTab(event) {
        let currentType = event.currentTarget.dataset.type;
        let vCurrentCarList = [];
        let vCurrentCarNoUseList = [];
        if(currentType == "0"){
          vCurrentCarList = this.data.vDistributionCarList;
          vCurrentCarNoUseList = this.data.vDistributionCarNoUseList;
        }else if(currentType == "1"){
          vCurrentCarList = this.data.vLiftingCarList;
          vCurrentCarNoUseList = this.data.vLiftingCarNoUseList
        }
        this.setData({
            clickTab: currentType,
            isChecked: true,
            vCurrentShoppingCarList: vCurrentCarList,
            vCurrentShoppingCarNoUseList: vCurrentCarNoUseList
        });
        this.calculationMoney();
    },
    queryShoppingCarList(){
      DialogUtility.loading("加载中");
      APIUtility.get({
          url: AppConfig.apiList.queryOrderCarList,
          params: { plat_tag: AppConfig.plat_tag },
          succ: (res) => {
            let data = res.data || [];
            let shopActivityList = res.shopActivityList;

            data.map((item) => {
              item.ischecked = true;
              if(item.activity_rule_list && item.activity_rule_list.length > 0){
                for(let i = 0; i < item.activity_rule_list.length; i++){ //计算活动价格
                    if(item.product_id == item.activity_rule_list[i].product_id){
                        item.activity_sale_price = item.activity_rule_list[i].sale_price
                        item.activity_discount_rate = item.activity_rule_list[i].discount_rate
                        break
                    }else if("*" == item.activity_rule_list[i].product_id){
                        item.activity_sale_price = item.activity_rule_list[i].sale_price
                        item.activity_discount_rate = item.activity_rule_list[i].discount_rate
                    }
                }
              }
              item.sale_prices = item.activity_rule_list ? (item.activity_sale_price /100.00).toFixed(2) :  (item.sale_price / 100.00).toFixed(2)
              item.face = (item.face / 100.00).toFixed(2);
              item.cover_img = AppConfig.imageAddr + item.cover_img;

              (item.activity_rule_list || []).map((item)=> { //活动价格
                item.sale_prices = (item.sale_price / 100.00).toFixed(2);
              })
            })

            let distributionCarList = [];
            let liftingCarList = [];
            for(let i = 0; i< res.data.length; i++){
              if((res.data[i].product_flag & 16) == 16){
                distributionCarList.push(res.data[i])
              }else if((res.data[i].product_flag & 32) == 32){
                liftingCarList.push(res.data[i])
              }
            }

            this.chooseEffective(distributionCarList, 0); //获取有效数据
            this.chooseEffective(liftingCarList, 1);

            this.goodsClassify(shopActivityList, this.data.vDistributionCarAllList, 0); //产品分类
            this.goodsClassify(shopActivityList, this.data.vLiftingCarAllList, 1);

            if(this.data.clickTab == 0){
              this.setData({
                vCurrentShoppingCarList: this.data.vDistributionCarList,
                vCurrentShoppingCarNoUseList: this.data.vDistributionCarNoUseList
              })
            }else{
              this.setData({
                vCurrentShoppingCarList: this.data.vLiftingCarList,
                vCurrentShoppingCarNoUseList: this.data.vLiftingCarNoUseList
              })
            }
            
            this.calculationMoney();
          },
          fail: (errData) => {
              console.log("购物车加载失败", errData);
              DialogUtility.tip("购物车加载失败");
          },
          compelete: () => {
              DialogUtility.close(this);
              this.setData({
                requestComplete: true
              })
          }
      })
    },
    chooseEffective(goodsData, type){ //区分商品的有效性
      let effectiveList = [];
      let noEffectiveList = [];
      for(let i = 0; i< goodsData.length; i++){
        if(goodsData[i].status == 1){ //有效
          effectiveList.push(goodsData[i]);
        }else if(goodsData[i].status == 2){  //无效
          noEffectiveList.push(goodsData[i]);
        }
      }

      if(type == 0){ //配送有效数据
        this.setData({
          vDistributionCarAllList: effectiveList,
          vDistributionCarNoUseList: noEffectiveList
        })
      }else if(type == 1){ //自提有效数据
        this.setData({
          vLiftingCarAllList: effectiveList,
          vLiftingCarNoUseList: noEffectiveList
        })
      }
    },
    goodsClassify(shopActivityList, goodsData, type){ //商品分类
      let map = {}
      let dest = []
      for(let i = 0; i< goodsData.length; i++){
        let ai = goodsData[i];
        let shop_id = ai.shop_id;
        if(!map[ai.shop_id]){  
            dest.push({  
                is_checked: true,
                shop_id: ai.shop_id,  
                shop_name: ai.shop_name,
                shop_logo: ai.logo_url ? AppConfig.imageAddr + ai.logo_url : "http://static.100bm.cn/mall/ui/default/ic_shop_logo.png",
                data: [ai],
                activity_list: shopActivityList[shop_id]
            });  
            map[ai.shop_id] = ai;  
        }else{  
            for(let j = 0; j < dest.length; j++){  
                let dj = dest[j];  
                if(dj.shop_id == ai.shop_id){  
                    dj.data.push(ai);  
                    break;  
                }  
            }  
        }  
      }
      // dest.map((item) => {  //根据活动类型得到活动名称
      //   item.activity_list.map((items) =>{
      //     items.activity_name = this.data.activityType[items.activity_type]
      //   })
      // })

      if(type == 0){ //配送有效分类数据
        this.setData({
          vDistributionCarList: dest
        })
      }else if(type == 1){ //自提有效分类数据
        this.setData({
          vLiftingCarList: dest
        })
      }
    },
    chooseShopAll(event){ //店铺选择
      let click = event.currentTarget.dataset.type;
      let id = event.currentTarget.dataset.id;
      let templist = this.data.vCurrentShoppingCarList;
      let first_index;
      for (let i = 0; i < templist.length; i++) {
        if (templist[i].shop_id == id) {
          first_index = i; //获取下标
        }
      }
      if(click == 1){  //选中
        templist[first_index].is_checked = true;
        let num = 0;
        for (let i = 0; i < templist[first_index].data.length; i++) {
          templist[first_index].data[i].ischecked = true
        }
        for(let i = 0; i < templist.length; i++){
          if(templist[i].is_checked){
            num ++
          }
        }
        if(this.data.clickTab == "0"){
          if(this.data.vDistributionCarList.length == num){
            this.setData({
              isChecked: true,
              vCurrentShoppingCarList: templist
            })
          }else{
            this.setData({
              vCurrentShoppingCarList: templist
            })
          }  
        }else{
          if(this.data.vLiftingCarList.length == num){
            this.setData({
              isChecked: true,
              vCurrentShoppingCarList: templist
            })
          }else{
            this.setData({
              vCurrentShoppingCarList: templist
            })
          }  
        }
        
      }else if(click == 2){ //取消选中
          templist[first_index].is_checked = false;
          for (let i = 0; i < templist[first_index].data.length; i++) {
            templist[first_index].data[i].ischecked = false
          }
          this.setData({
              isChecked: false,
              vCurrentShoppingCarList: templist
          })
      }
      this.calculationMoney();
    },
    chooseAll(event){ //全选
      let click = event.currentTarget.dataset.type;
      let templist = this.data.vCurrentShoppingCarList;
      
      if(click == 1){ //全选
          for(let i = 0; i< templist.length; i++){
            templist[i].is_checked = true
            for(let j= 0;j< templist[i].data.length;j++){
              templist[i].data[j].ischecked = true
            }
          }
          this.setData({
              isChecked: true,
              vCurrentShoppingCarList: templist
          })
      }else if(click == 2){ //取消全选
          for(let i = 0; i< templist.length; i++){
            templist[i].is_checked = false
            for(let j= 0;j< templist[i].data.length;j++){
              templist[i].data[j].ischecked = false
            }
          }
          this.setData({
              isChecked: false,
              vCurrentShoppingCarList: templist
          })
      }
      this.calculationMoney();
    },
    changeStatus(event){ //选中商品
      let templist = this.data.vCurrentShoppingCarList;
      let click = event.currentTarget.dataset.type;
      let index = event.currentTarget.dataset.index;
      let id = event.currentTarget.dataset.id;
      let first_index;
      for (let i = 0; i < templist.length; i++) {
        for(let j = 0; j < templist[i].data.length; j++){
          if (j == index && templist[i].data[j].product_id == id) {
            first_index = i; //获取下标
          }
        }
      }
      if(click == 1){  //选中
          templist[first_index].data[index].ischecked = true;
          let num = 0;
          for (let i = 0; i < templist.length; i++) {
            let parantNum = 0;
            for(let j = 0; j < templist[i].data.length; j++){
              if (templist[i].data[j].ischecked) {
                num ++
                parantNum ++
              }
            }
            if(templist[i].data.length == parantNum){
              templist[i].is_checked = true
            }
          }
          
          if(this.data.clickTab == "0"){
            if(this.data.vDistributionCarAllList.length == num){
              this.setData({
                isChecked: true,
                vCurrentShoppingCarList: templist
              })
            }else{
              this.setData({
                vCurrentShoppingCarList: templist
              })
            }
          }else{
            if(this.data.vLiftingCarAllList.length == num){
              this.setData({
                isChecked: true,
                vCurrentShoppingCarList: templist
              })
            }else{
              this.setData({
                vCurrentShoppingCarList: templist
              })
            }
          }
      }else if(click == 2){ //取消选中
          templist[first_index].data[index].ischecked = false;
          templist[first_index].is_checked = false
          this.setData({
              isChecked: false,
              vCurrentShoppingCarList: templist
          })
      }
      this.calculationMoney();
    },
    calculationMoney(){
      let templist = this.data.vCurrentShoppingCarList;
      let carIds = ""
      
      let sum = 0
      let num = 0
      for (let i = 0; i < templist.length; i++) {
        for(let j = 0; j < templist[i].data.length; j++){
          let price = templist[i].data[j].activity_rule_list ? parseInt(templist[i].data[j].activity_sale_price) : parseInt(templist[i].data[j].sale_price)
          if (templist[i].data[j].ischecked) {
            sum += price * parseInt(templist[i].data[j].product_count);
            num ++
            carIds += templist[i].data[j].id + "|"
          }
        }
      }
      this.setData({
        totalMoney: (sum / 100.00).toFixed(2),
        totalNum: num,
        carIds: carIds
      })
    },
    gotoSubmitOrder(){
      let carList = [];
      let templist = this.data.vCurrentShoppingCarList;
      for (let i = 0; i < templist.length; i++) {
        for(let j = 0; j < templist[i].data.length; j++){
          if(templist[i].data[j].ischecked){
            let carItem = {
              product_id: templist[i].data[j].product_id,
              product_num: parseInt(templist[i].data[j].product_count),
              activity_tag: templist[i].data[j].activity_tag || ""
            };
            carList.push(carItem)
          }
        }
      }
      if(carList.length == 0 || this.data.totalNum == 0){
        DialogUtility.tip("未选择商品");
        return
      }
      RedirectUtility.navigateTo("/pages/mall/submitorder/submitorder?carlist=" + JSON.stringify(carList) + "&type=" + this.data.clickTab + "&carids=" + this.data.carIds + "&buy=1002");
    },
    gotoOrderdetail(event){
      let tags = event.currentTarget.dataset.tags;
      let ids = event.currentTarget.dataset.ids;
      console.log("---------------", tags, ids);
      
      if(tags){
        RedirectUtility.navigateTo("/pages/activitys/limitactivitydetail/limitactivitydetail?product_id=" + ids + "&tags=" + tags);
      }else{
        RedirectUtility.navigateTo("/pages/mall/goodsdetail/goodsdetail?product_id=" + ids);
      }
    }
})