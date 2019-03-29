import { AppConfig } from "../config";
import { StorageUtility } from "./storage";
import { TimeUtility } from "./time";
import { CommonUtility } from "./common";

/**
 * 号码处理工具类
 * 
 * @export
 * @class PhoneUtility
 */
export class NumberUtility {

    /**
     * 去除空格
     * 
     * @static
     * @param {any} str 
     * @returns {string} 
     * @memberof Phone
     */
    static trim(str: string): string {     
        if (!str) return "";
        return str.toString().replace(/[ |-]/g, "");
    }

    /****
     * 获取字符串中的电话号码
     */
    static getPhone(str: string): any{
        let regx = /(1[3|4|5|6|7|8|9][\d]{9}|0[\d]{2,3}-[\d]{7,8}|400[-]?[\d]{3}[-]?[\d]{4})/g;
        return str.match(regx);
    }

    /**
     * 比较号码前7位是否相同
     * 
     * 原号码长度应为包括空格长度为13位的数字
     * 新号码长度不定
     * @static
     * @param {string} phoneNum1 原号码
     * @param {string} phoneNum2 新号码
     * @returns {boolean} 
     * @memberof Phone
     */
    static isSame(phoneNum1: string, phoneNum2: string, isFixedLine: boolean): boolean {
        phoneNum1 = this.trim(phoneNum1 || "");
        phoneNum2 = this.trim(phoneNum2 || "");

        if ((phoneNum1.length != 0 && phoneNum2.length == 0) || (phoneNum1.length == 0 && phoneNum2.length != 0)) {
            return false;
        }

        // 大于7位则比较前7位 否则比较phoneNum2的长度
        let judgeLength = isFixedLine ? 4 : 7;
        var tempLength = phoneNum2.length >= judgeLength ? judgeLength : phoneNum2.length;
        var num1 = phoneNum1.substring(0, tempLength);
        var num2 = phoneNum2.substring(0, tempLength);

        return num1 == num2;
    }

    /**
     * 比较运营商是否匹配
     * 
     * @static
     * @param {string} phoneNum 号码
     * @param {string} productCarrier 产品对应的运营商
     * @returns {boolean} 
     * @memberof PhoneUtility
     */
    static isCarrierMatch(phoneNum: string, productCarrier: any, isFixedLine: boolean): boolean {
        let phoneInfo1 = this.getPhoneInfo(phoneNum, isFixedLine);

        let carrierStr1 = "";
        if (phoneInfo1) {
            let carrier_no = isFixedLine ? phoneInfo1.city_no : phoneInfo1.carrier_no
            carrierStr1 = carrier_no + phoneInfo1.province_no
        }
        let carrierStr2 = "";
        if (productCarrier) {
            let carrier_no = isFixedLine ? productCarrier.city_no : productCarrier.carrier_no
            carrierStr2 = carrier_no + productCarrier.province_no
        }

        console.log("号段比较", carrierStr1, carrierStr2);

        if (carrierStr1.length == 0 || carrierStr2.length == 0) {
            return false;
        }
        return carrierStr1 == carrierStr2;
    }

    /**
     * 格式化输出号码
     * 
     * 如：12345678911 格式化为 123 4567 8911
     * 
     * @static
     * @param {string} phoneNum 
     * @returns {string} 
     * @memberof Phone
     */
    static numberFormat(phoneNum: string): string {
        var currentStr = this.trim(phoneNum);
        var result;
        var str = " ";
        var c_length = currentStr.length;
        var f_symbol = 3;
        var l_symbol = 8;
        if (c_length < f_symbol + 1) {
            result = currentStr;
        } else if (c_length > f_symbol && c_length < l_symbol) {
            result = currentStr.substring(0, f_symbol) + str + currentStr.substring(f_symbol, c_length);
        } else if (c_length >= l_symbol) {
            result = currentStr.substring(0, f_symbol) + str + currentStr.substring(f_symbol, l_symbol - 1) + str + currentStr.substring(l_symbol - 1, c_length);
        }
        return result;
    }

    /**
     * 格式化输出号码
     * 
     * 如：12345678911 格式化为 123 4567 8911
     * 
     * @static
     * @param {string} phoneNum 
     * @returns {string} 
     * @memberof Phone
     */
    static numberFormats(phoneNum: string): string {
        var currentStr = this.trim(phoneNum);
        var result;
        var str = " ";
        var c_length = currentStr.length;
        var f_symbol = 4;
        var l_symbol = 15;
        if (c_length < f_symbol + 1) {
            result = currentStr;
        } else if (c_length > f_symbol && c_length < l_symbol) {
            result = currentStr.substring(0, f_symbol) + str + currentStr.substring(f_symbol, c_length);
        } else if (c_length >= l_symbol) {
            result = currentStr.substring(0, f_symbol) + str + currentStr.substring(f_symbol, l_symbol - 1) + str + currentStr.substring(l_symbol - 1, c_length);
        }
        return result;
    }

    /**
     * 账号格式化 每四位用空格分隔
     * @param Num 
     */
    static accountFormat(Num: string): string {
        let currentStr = this.trim(Num);
        let tempList = [];

        let tempLength = currentStr.length;
        let first = true;
        while (tempLength > 4) {
            let step = first ? 4 : 4;

            let item = currentStr.substring(0, step);
            tempList.push(item);

            currentStr = currentStr.substring(step, tempLength);
            tempLength = currentStr.length;

            first = false;
        }
        tempList.push(currentStr);

        return tempList.join(" ");
    }

    static fixedLineFormat(Num: string, showInput: boolean): string {
        let currentStr = this.trim(Num);
        let threeType = ["01", "02", "852", "853"];

        let isThreeType = false;
        threeType.forEach(item => {
            if (currentStr.indexOf(item) == 0) {
                isThreeType = true;
            }
        });

        let dividerTag = showInput ? " - " : "-";

        if (isThreeType && currentStr.length > 3) {
            let rightStr = currentStr.substring(3, currentStr.length);
            rightStr = rightStr.length > 8 ? rightStr.substring(0, 8) : rightStr;
            currentStr = currentStr.substring(0, 3) + dividerTag + rightStr;
        }

        if (!isThreeType && currentStr.length > 4) {
            let rightStr = currentStr.substring(4, currentStr.length);
            rightStr = rightStr.length > 7 ? rightStr.substring(0, 7) : rightStr;
            currentStr = currentStr.substring(0, 4) + dividerTag + rightStr;
        }

        return currentStr;
    }

    /**
     * 输入号码是否合法
     * 
     * @static
     * @param {string} phoneNum 
     * @returns {boolean} 
     * @memberof Phone
     */
    static phoneValid(phoneNum: string): boolean {
        return (/^1\d{10}$/.test(phoneNum));
    }

    /**
     * 保存号码到本地
     * 
     * @static
     * @param {string} phoneNum 
     * @returns {void} 
     * @memberof PhoneUtility
     */
    static setPhoneToLocal(phoneNum: string): void {
        phoneNum = this.trim(phoneNum);
        if (phoneNum == null || phoneNum.length < 11) {
            return;
        }
        // 获取本地
        let phoneList: Array<Phone> = this.getPhoneListByKey(AppConfig.dkUserPhoneList);

        let tempLength = phoneList.length > 10 ? 10 : phoneList.length;
        // 删除最后一条号段信息
        if (phoneList.length == 10) {
            let key = phoneList[9].num.substring(0, 7);
            StorageUtility.remove(key);
        }
        // 去除相同的号码
        let temPhoneList: Array<Phone> = [];
        for (let i = 0; i < tempLength; i++) {
            let item = phoneList[i];
            if (phoneNum != item.num) {
                temPhoneList.push(item);
            }
        }
        temPhoneList.unshift(new Phone(phoneNum, parseInt(TimeUtility.getTimeNow())));
        // 保存
        let tempStr = JSON.stringify(temPhoneList);
        console.log("----storage to local----", tempStr);

        StorageUtility.set(AppConfig.dkUserPhoneList, tempStr);
        this.checkAndRetry(AppConfig.dkUserPhoneList, tempStr, phoneNum);
    }

    /**
     * 保存号码（无需号段信息）
     * 
     * @param phoneNum 
     * @param key 
     */
    static setSinglePhoneToLocal(phoneNum: string, key: string): void {
        phoneNum = this.trim(phoneNum);
        if (phoneNum == null || phoneNum.length < 11) {
            return;
        }
        // 获取本地
        let phoneList: Array<Phone> = this.getPhoneListByKey(key);

        let tempLength = phoneList.length > 10 ? 10 : phoneList.length;
        // 去除相同的号码
        let temPhoneList: Array<Phone> = [];
        for (let i = 0; i < tempLength; i++) {
            let item = phoneList[i];
            if (phoneNum != item.num) {
                temPhoneList.push(item);
            }
        }
        temPhoneList.unshift(new Phone(phoneNum, parseInt(TimeUtility.getTimeNow())));
        // 保存
        let tempStr = JSON.stringify(temPhoneList);
        console.log("----storage to local----", tempStr);

        StorageUtility.set(key, tempStr);
        this.checkAndRetry(key, tempStr, phoneNum);
    }

    static setFixedLineToLocal(phoneNum: string): void {
        phoneNum = this.trim(phoneNum);
        if (phoneNum == null || phoneNum.length < 10) {
            return;
        }
        // 获取本地
        let phoneList: Array<Phone> = this.getPhoneListByKey(AppConfig.dkFixedLineList);

        let tempLength = phoneList.length > 10 ? 10 : phoneList.length;
        // 删除最后一条号段信息
        if (phoneList.length == 10) {
            let key = phoneList[9].num.substring(0, 4);
            StorageUtility.remove(key);
        }
        // 去除相同的号码
        let temPhoneList: Array<Phone> = [];
        for (let i = 0; i < tempLength; i++) {
            let item = phoneList[i];
            if (phoneNum != item.num) {
                temPhoneList.push(item);
            }
        }
        temPhoneList.unshift(new Phone(phoneNum, parseInt(TimeUtility.getTimeNow())));
        // 保存
        let tempStr = JSON.stringify(temPhoneList);
        console.log("----storage to local----", tempStr);

        StorageUtility.set(AppConfig.dkFixedLineList, tempStr);
        this.checkAndRetry(AppConfig.dkFixedLineList, tempStr, phoneNum);
    }

    /**
     * 获取最新的格式化之后的phonenumber
     * 
     * AppConfig.dkUserPhoneList(主页及流量页)
     * 
     * AppConfig.dkCheckPhoneList(话费体检)
     * 
     * @static
     * @returns {string} 
     * @memberof PhoneUtility
     */
    static getLastPhone(key: string): string {
        var result: string = "";
        // 获取本地
        var phoneList: Array<Phone> = this.getPhoneListByKey(key);
        if (phoneList == null || phoneList.length == 0) {
            return result;
        }

        result = phoneList[0].num;

        return this.numberFormat(result);
    }

    /**
     * 根据号码前七位获取本地号段信息
     * 
     * @static
     * @param {string} phoneNum 
     * @returns {PhoneInfo} 
     * @memberof PhoneUtility
     */
    static getPhoneInfo(phoneNum: string, isFixedLine: boolean): any {
        phoneNum = this.trim(phoneNum);
        let tempLength = isFixedLine ? 4 : 7;
        if (phoneNum.length < tempLength) {
            return null;
        }
        var tempKey = phoneNum.substring(0, tempLength);
        var localData: any = StorageUtility.get(tempKey);
        return localData;
    }

    /**
     * 根据号码前七位获取本地号段信息
     * 
     * @static
     * @param {string} phoneNum 
     * @returns {PhoneInfo} 
     * @memberof PhoneUtility
     */
    static getPhoneInfoStr(phoneNum: string): string {
        var localData: any = this.getPhoneInfo(phoneNum, false);
        return localData ? localData.province_name + localData.carrier_name : "";
    }

    static getFixedLineInfoStr(phoneNum: string): string {
        var localData: any = this.getPhoneInfo(phoneNum, true);
        return localData ? localData.province_name + localData.city_no : "";
    }

    /**
     * 根据号码前七位存储号段信息
     * 
     * @static
     * @param {string} phoneNum 
     * @param {PhoneInfo} info 
     * @returns 
     * @memberof PhoneUtility
     */
    static setPhoneInfo(phoneNum: string, info: PhoneInfo, isFixedLine: boolean) {
        phoneNum = this.trim(phoneNum);
        let tempLength = isFixedLine ? 4 : 7;
        if (phoneNum.length < tempLength || info == null) {
            return;
        }
        var tempKey = phoneNum.substring(0, tempLength);
        StorageUtility.set(tempKey, info);
        this.checkAndRetry(tempKey, info, JSON.stringify(info));
    }

    /**
     * 保存支付已支付号码到本地
     * 
     * @static
     * @param {string} phoneNum 
     * @returns {void} 
     * @memberof PhoneUtility
     */
    static setPayedPhone(phoneNum: string, phoneInfo: string, key: string): void {
        if (!phoneNum || phoneNum.length < 13 || !phoneInfo || phoneInfo.length > 4) {
            return;
        }
        // 获取本地
        let tempPhoneList: Array<any> = this.getPhoneListByKey(key)
        let phoneList: Array<any> = [];
        // 剔除相同的数据
        for (let i = 0; i < tempPhoneList.length; i++) {
            if (tempPhoneList[i].number == phoneNum) {
                continue;
            }
            phoneList = phoneList.concat(tempPhoneList[i]);
        }
        let tempPhoneInfo = { number: phoneNum, info: phoneInfo }
        let tempLength = phoneList.unshift(tempPhoneInfo);
        phoneList = tempLength > 3 ? phoneList.slice(0, 3) : phoneList;

        // 保存
        let tempStr = JSON.stringify(phoneList);
        StorageUtility.set(key, tempStr);

        this.checkAndRetry(key, tempStr, phoneNum);
    }

    /**
     * 清除已支付phone列表
     */
    static clearPayedPhone(key: string) {
        StorageUtility.remove(key);
    }

    static getPhoneListByKey(key: string) {
        var localData = StorageUtility.get(key);
        if (!CommonUtility.isJSON(localData)) {
            return [];
        }
        var phoneList: any = JSON.parse(localData) || [];
        return phoneList;
    }

    /**
     * 检查重试
     * 
     * 存储结果为空或者不等于传入的数据 则重试
     * 
     * @param key 数据key
     * @param data 数据源
     * @param currentStr 本次存储的数据
     */
    private static checkAndRetry(key: string, data: any, currentStr: string) {
        let temp = StorageUtility.get(key);

        if (temp == null || JSON.stringify(temp).indexOf(currentStr) == -1) {
            console.log("----storage retry----", data);
            StorageUtility.setAsyn(key, data);
        }
    }
}

/**
 * 号码
 * 
 * @class Phone
 */
class Phone {
    time: number;
    num: string;

    constructor(num: string, time: number) {
        this.num = num;
        this.time = time;
    }
}

/**
 * 号段信息
 * 
 * {"carrier_no":"YD", "carrier_name":"移动", "province_name":"浙江", "province_no":"ZJ"}
 * 
 * @class PhoneInfo
 */
export class PhoneInfo {
    carrier_no: string;
    carrier_name: string;
    province_name: string;
    province_no: string;
}