import { AppConfig } from "../config";
import { StorageUtility } from "./storage";
import { CommonUtility } from "./common";

/**
 * 号码处理工具类
 * 
 * @export
 * @class VideoUtility
 */
export class VideoUtility {

    /**
     * 去除空格
     * 
     * @static
     * @param {any} str 
     * @returns {string} 
     * @memberof video
     */
    static trim(str: string): string {
        if (!str) return "";
        return str.toString().replace(/\s+/g, "");
    }

    /**
     * 输入号码是否合法（视频账号）
     * 
     * @static
     * @param {string} videoNum 
     * @returns {boolean} 
     * @memberof video
     */
    static videoNumValid(videoNum: string): boolean {
        let reg = new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+$/); //邮箱正则
        
        return (/^1\d{10}$/.test(videoNum) || reg.test(videoNum));
    }

    /**
     * 输入号码是否合法（视频账号）
     * 
     * @static
     * @param {string} videoNum 
     * @returns {boolean} 
     * @memberof video
     */
    static videoQQValid(videoNum: string): boolean {
        let reg = new RegExp(/^[1-9]\d{4,14}$/);   //QQ号的正则
        return reg.test(videoNum);
    }

    /**
     * 保存号码到本地
     * 
     * @static
     * @param {string} videoNum 
     * @returns {void} 
     * @memberof videoUtility
     */
    static setVideoToLocal(videoNum: string): void {
        videoNum = this.trim(videoNum);
        if (videoNum == null) {
            return;
        }
        // 获取本地
        let videoList: Array<any> = this.getVideoListByKey(AppConfig.dkVideoList);

        let temVideoList: Array<any> = [];
        let tempLength = videoList.length > 10 ? 10 : videoList.length;
        // 去除相同的号码
        for (let i = 0; i < tempLength; i++) {
            let item = videoList[i];
            if (videoNum != item.num) {
                temVideoList.push(item);
            }
        }
        console.log("------------", videoNum, videoList);
        
        temVideoList.unshift(new VideoCard(videoNum));
        // 保存
        let tempStr = JSON.stringify(temVideoList);
        StorageUtility.set(AppConfig.dkVideoList, tempStr);
        this.checkAndRetry(AppConfig.dkVideoList, tempStr);
    }

    /**
     * 获取最新的格式化之后的oilNumber
     * 
     * @static
     * @returns {string} 
     * @memberof OilUtility
     */
    static getLastVideoNumber(): string {
        var result: string = "";
        // 获取本地
        var oilList: Array<any> = this.getVideoListByKey(AppConfig.dkVideoList);
        
        if (oilList == null || oilList.length == 0) {
            return result;
        }
        return oilList[0].num;
    }

    /**
     * 保存支付已支付号码到本地
     * 
     * @static
     * @param {string} videoNum 
     * @returns {void} 
     * @memberof videoUtility
     */
    static setPayedVideoList(VideoNum: string, VideoInfo: string): void {
        if (!VideoNum  || !VideoInfo) {
            return;
        }
        // 获取本地
        let tempVideoList: Array<any> = this.getPayedVideoList();
        let videoList: Array<any> = [];
        // 剔除相同的数据
        for (let i = 0; i < tempVideoList.length; i++) {
            if (tempVideoList[i].number == VideoNum) {
                continue;
            }
            videoList = videoList.concat(tempVideoList[i]);
        }
        let tempVideoInfo = { number: VideoNum, info: VideoInfo }
        let tempLength = videoList.unshift(tempVideoInfo);
        videoList = tempLength > 3 ? videoList.slice(0, 3) : videoList;

        // 保存
        let tempStr = JSON.stringify(videoList);
        StorageUtility.set(AppConfig.dkPayedVideoList, tempStr)
        this.checkAndRetry(AppConfig.dkPayedVideoList, tempStr)
    }

    /**
     * 获取本地已支付video列表
     * 
     * @static
     * @returns {Array<video>} 
     * @memberof videoUtility
     */
    static getPayedVideoList(): any {
        return this.getVideoListByKey(AppConfig.dkPayedVideoList);
    }

    /**
     * 清除已支付video列表
     */
    static clearPayedVideoList() {
        StorageUtility.remove(AppConfig.dkPayedVideoList);
    }

    static getVideoListByKey(key: string) {
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
class VideoCard {
    num: string;

    constructor(num: string) {
        this.num = num;
    }
}