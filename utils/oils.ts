import { AppConfig } from "../config";
import { StorageUtility } from "./storage";
import { CommonUtility } from "./common";

/**
 * 号码处理工具类
 * 
 * @export
 * @class OilUtility
 */
export class OilUtility {

    /**
     * 去除空格
     * 
     * @static
     * @param {any} str 
     * @returns {string} 
     * @memberof Oil
     */
    static trim(str: string): string {
        if (!str) return "";
        return str.toString().replace(/\s+/g, "");
    }

    /**
     * 比较加油卡是否相同
     * 
     * 原号码长度应为包括空格长度为13位的数字
     * 新号码长度不定
     * @static
     * @param {string} oilNum1 原号码
     * @param {string} oilNum2 新号码
     * @returns {boolean} 
     * @memberof Oil
     */
    static isSame(oilNum1: string, oilNum2: string): boolean {
        oilNum1 = this.trim(oilNum1 || "");
        oilNum2 = this.trim(oilNum2 || "");

        if (oilNum1 == oilNum2) {
            return true;
        }

        if ((oilNum1.length != 0 && oilNum2.length == 0) || (oilNum1.length == 0 && oilNum2.length != 0)) {
            return false;
        }

        let tempResult = false;
        // 中石化
        if (oilNum1.startsWith("1") && oilNum2.startsWith("1")) {
            tempResult = oilNum1.substring(6, 8) == oilNum2.substring(6, 8);
        }
        // 中石油
        if (oilNum1.startsWith("9") && oilNum2.startsWith("9")) {
            tempResult = true;
        }

        return tempResult;
    }

    /**
     * 格式化输出加油卡号
     * 
     * 如：每位格式化一次
     * 
     * @static
     * @param {string} oilNum 
     * @returns {string} 
     * @memberof Oil
     */
    static numberFormat(oilNum: string): string {
        let currentStr = this.trim(oilNum);
        let tempLength = currentStr.length;
        if (tempLength <= 8) {
            currentStr = currentStr.replace(/([0-9]{4})([0-9]{1,4})/g, "$1 $2");
        }
        if (tempLength > 8 && tempLength <= 12) {
            currentStr = currentStr.replace(/([0-9]{4})([0-9]{4})([0-9]{1,4})/g, "$1 $2 $3");
        }
        if (tempLength > 12 && tempLength <= 16) {
            currentStr = currentStr.replace(/([0-9]{4})([0-9]{4})([0-9]{4})([0-9]{1,4})/g, "$1 $2 $3 $4");
        }
        if (tempLength > 16) {
            currentStr = currentStr.replace(/([0-9]{4})([0-9]{4})([0-9]{4})([0-9]{4})([0-9]{1,3})/g, "$1 $2 $3 $4 $5");
        }

        return currentStr;
    }

    /**
     * 输入号码是否合法（中石化）
     * 
     * @static
     * @param {string} oilNum 
     * @returns {boolean} 
     * @memberof Oil
     */
    static oilNumValid(oilNum: string): boolean {
        return (/^1\d{18}$/.test(oilNum));
    }

    /**
     * 保存号码到本地
     * 
     * @static
     * @param {string} oilNum 
     * @returns {void} 
     * @memberof OilUtility
     */
    static setOilToLocal(oilNum: string): void {
        oilNum = this.trim(oilNum);
        if (oilNum == null || oilNum.length < 11) {
            return;
        }
        // 获取本地
        let oilList: Array<any> = this.getOilListByKey(AppConfig.dkOilList);

        let temOilList: Array<any> = [];
        let tempLength = oilList.length > 10 ? 10 : oilList.length;
        // 去除相同的号码
        for (let i = 0; i < tempLength; i++) {
            let item = oilList[i];
            if (oilNum != item.num) {
                temOilList.push(item);
            }
        }
        temOilList.unshift(new OilCard(oilNum));
        // 保存
        let tempStr = JSON.stringify(temOilList);
        StorageUtility.set(AppConfig.dkOilList, tempStr);
        this.checkAndRetry(AppConfig.dkOilList, tempStr);
    }

    /**
     * 获取最新的格式化之后的oilNumber
     * 
     * @static
     * @returns {string} 
     * @memberof OilUtility
     */
    static getLastOilNumber(): string {
        var result: string = "";
        // 获取本地
        var oilList: Array<any> = this.getOilListByKey(AppConfig.dkOilList);
        if (oilList == null || oilList.length == 0) {
            return result;
        }

        return this.numberFormat(oilList[0].num);
    }

    /**
     * 是否为中石化加油卡
     * 
     * 中石化1开头19为数字 中石油9开头16位数字
     */
    static isZSH(oilNum: string): boolean {
        return oilNum.startsWith("1");
    }

    /**
     * 
     * @param oilNum 是否是四川中石化
     */
    static isSCZSH(oilNum: string): boolean {
        let number = oilNum.substring(6, 8);
        if(number == "86"){
            number = oilNum.substring(8, 10);
        }
        
        return number == "51"
    }

    /**
     * 根据卡号获取运营商信息
     * @param oilNum 
     */
    static getOilInfo(oilNum: string): string {
        let result = "";
        if (oilNum.startsWith("1")) {
            result = "中石化"
        } else if (oilNum.startsWith("9")) {
            result = "中石油"
        }
        return result;
    }

    /**
     * 保存支付已支付号码到本地
     * 
     * @static
     * @param {string} OilNum 
     * @returns {void} 
     * @memberof OilUtility
     */
    static setPayedOilList(OilNum: string, OilInfo: string): void {
        if (!OilNum || OilNum.length < 19 || !OilInfo || OilInfo.length > 3) {
            return;
        }
        // 获取本地
        let tempOilList: Array<any> = this.getPayedOilList();
        let oilList: Array<any> = [];
        // 剔除相同的数据
        for (let i = 0; i < tempOilList.length; i++) {
            if (tempOilList[i].number == OilNum) {
                continue;
            }
            oilList = oilList.concat(tempOilList[i]);
        }
        let tempOilInfo = { number: OilNum, info: OilInfo }
        let tempLength = oilList.unshift(tempOilInfo);
        oilList = tempLength > 3 ? oilList.slice(0, 3) : oilList;

        // 保存
        let tempStr = JSON.stringify(oilList);
        StorageUtility.set(AppConfig.dkPayedOilList, tempStr)
        this.checkAndRetry(AppConfig.dkPayedOilList, tempStr)
    }

    /**
     * 获取本地已支付Oil列表
     * 
     * @static
     * @returns {Array<Oil>} 
     * @memberof OilUtility
     */
    static getPayedOilList(): any {
        return this.getOilListByKey(AppConfig.dkPayedOilList);
    }

    /**
     * 清除已支付Oil列表
     */
    static clearPayedOilList() {
        StorageUtility.remove(AppConfig.dkPayedOilList);
    }

    static getOilListByKey(key: string) {
        var localData = StorageUtility.get(key);
        if (!CommonUtility.isJSON(localData)) {
            return [];
        }
        return JSON.parse(localData) || [];
    }

    /**
     * 检查重试
     * @param key 数据key
     * @param data 数据源
     */
    private static checkAndRetry(key: string, data: any) {
        let temp = StorageUtility.get(key);
        if (temp == null || temp != data) {
            console.log("----storage retry----");
            StorageUtility.setAsyn(key, data);
        }
    }
}

/**
 * 加油卡
 */
class OilCard {
    num: string;

    constructor(num: string) {
        this.num = num;
    }
}