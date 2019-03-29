/**
 * 时间工具类
 * 
 * @export
 * @class TimeUtility
 */
import { DateUtility } from "./date";

export class TimeUtility {

    /**
     * 获取当前时间
     * 
     * @static
     * @returns {string} 
     * @memberof TimeUtility
     */
    static getTimeNow(): string {
        return DateUtility.toString(new Date(), "yyyyMMddhhmmss");
    }

    /**
     * 获取今日 如：20171013
     */
    static getToday(): string {
        return DateUtility.toString(new Date(), "yyyyMMdd");
    }

    /**
     * 获取本月 如：201710
     */
    static getMonth(): string {
        return DateUtility.toString(new Date(), "yyyyMM");
    }

    /**
     * 是否是圣诞节或者平安夜
     */
    static isChristmas(): boolean {
        let today = DateUtility.toString(new Date(), "MMdd");
        return "1225" == today || "1224" == today;
    }
}
