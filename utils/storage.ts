import { TimeUtility } from "./time";
import { DateUtility } from "./date";

/**
 * 缓存工具类
 * 
 * @class StorageUtility
 */
export class StorageUtility {

    /**
     * 设置数据到缓存中
     * 
     * @static
     * @param {string} key 缓存key
     * @param {*} data 缓存data
     * @param {number} [expired=0] 0:永不过期
     * @param {number} [expiredDay=0] 过期时间,单位:天
     * @param {number} [expiredHours=0] 过期时间,单位:小时
     * @param {number} [expiredMin=0] 过期时间,单位:分钟
     * @memberof StorageUtility
     */
    static set(key: string, data: any, option?: StorageOption): void {
        let expired: Date;
        if (option) {
            expired = DateUtility.addNow({ day: option.expiredDay, hour: option.expiredHours, min: option.expiredMin });
        }

        try {
            wx.setStorageSync(key, {
                data: data,
                expiredTime: option ? DateUtility.toString(expired, "yyyyMMddhhmmss") : 0
            });
        } catch (error) {
            console.log("----storage error----", error);
        }
    }

    /**
     * 异步缓存
     * @param key 
     * @param data 
     * @param option 
     */
    static setAsyn(key: string, data: any, option?: StorageOption): void {
        let expired: Date;
        if (option) {
            expired = DateUtility.addNow({ day: option.expiredDay, hour: option.expiredHours, min: option.expiredMin });
        }

        wx.setStorage({
            key: key,
            data: {
                data: data,
                expiredTime: option ? DateUtility.toString(expired, "yyyyMMddhhmmss") : 0
            }
        });
    }

    /**
     * 获取缓存中的数据,没有返回null,如果过期了返回null
     * 
     * @static
     * @param {string} key 缓存key
     * @returns {*} 
     * @memberof StorageUtility
     */
    static get(key: string): any {
        var storageData = null;
        try {
            storageData = wx.getStorageSync(key);
        } catch (error) {
            console.log(error);
        }

        if (!storageData) {
            return null;
        }

        if (!storageData.expiredTime || storageData.expiredTime == 0) {
            return storageData.data;
        }

        var timeNow = TimeUtility.getTimeNow();
        return timeNow > storageData.expiredTime ? null : storageData.data;
    }

    /**
     * 
     * @param key 移除缓存
     */
    static remove(key: string): void {
        wx.removeStorageSync(key);
    }
}

class StorageOption {
    constructor(
        public expiredDay?: number,
        public expiredHours?: number,
        public expiredMin?: number,
    ) { }
}