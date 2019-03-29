export class DateUtility {
    constructor() { }
    /**
     * 格式化日期 
     * ---------------------------------------------------
     * @UTC bool date如果是UTC格式的日期类型，请将UTC=true
     */
    static toString(date: Date, format?: string, UTC?: Boolean): string {
        format = format || "yyyy-MM-dd hh:mm:ss";
        let o = {
            "M+": (UTC ? date.getUTCMonth() : date.getMonth()) + 1,
            "d+": UTC ? date.getUTCDate() : date.getDate(),
            "h+": UTC ? date.getUTCHours() : date.getHours(),
            "m+": UTC ? date.getUTCMinutes() : date.getMinutes(),
            "s+": UTC ? date.getUTCSeconds() : date.getSeconds(),
            "q+": Math.floor(((UTC ? date.getUTCMonth() : date.getMonth()) + 3) / 3), /*季度*/
            "S": UTC ? date.getUTCMilliseconds() : date.getMilliseconds()
        };
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, ((UTC ? date.getUTCFullYear() : date.getFullYear()) + "").substr(4 - RegExp.$1.length));
        }
        for (let k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    };

    /**
    * 以字符串格式创建时间对象
    * 创建不出来，返回null
    * 支持:yyyy yyyy([-/]MM)([-/]dd)([ ]HH)([:]mm)([:]ss)
    */
    static create(val: string): Date {

        if (typeof val != "string") return val;

        let reg_yyyyMMddHHmmss = new RegExp("^(\\d{4})[-\/]?([0-1]\\d{1})[-\/]?([0-3]\\d{1})\\s*([0-2]\\d{1})[:]?([0-5]\\d{1})[:]?([0-5]\\d{1})$"),
            reg_yyyyMMddHHmm = new RegExp("^(\\d{4})[-\/]?([0-1]\\d{1})[-\/]?([0-3]\\d{1})\\s*([0-2]\\d{1})[:]?([0-5]\\d{1})$"),
            reg_yyyyMMddHH = new RegExp("^(\\d{4})[-\/]?([0-1]\\d{1})[-\/]?([0-3]\\d{1})\\s*([0-2]\\d{1})$"),
            reg_yyyyMMdd = new RegExp("^(\\d{4})[-\/]?([0-1]\\d{1})[-\/]?([0-3]\\d{1})$"),
            reg_yyyyMM = new RegExp("^(\\d{4})[-\/]?([0-1]\\d{1})$"),
            reg_yyyy = new RegExp("^(\\d{4})$"),
            arr = reg_yyyy.exec(val)
                || reg_yyyyMM.exec(val)
                || reg_yyyyMMdd.exec(val)
                || reg_yyyyMMddHH.exec(val)
                || reg_yyyyMMddHHmm.exec(val)
                || reg_yyyyMMddHHmmss.exec(val);

        if (arr && arr.length > 0) {
            let yMdHms = new Array(1970, 1, 1, 0, 0, 0);
            for (let i = 1, len = arr.length; i < len; i++) {
                yMdHms[i - 1] = parseInt(arr[i], 10);
            }
            return new Date(yMdHms[0], yMdHms[1] - 1, yMdHms[2], yMdHms[3], yMdHms[4], yMdHms[5]);
        } else {
            return null;
        }
    };

    /**
     * 计算两个时间之间的间隔（相差天数/小时数等）注意和timeDiff函数的差别
     * 将使用参数t限制的最小单位值来计算结果（最小单位之后的值被忽略，不加入计算）
     * 例如：timeSpan(2015-01-09 23:06,2015-01-10 00:06,'d') => 1
     * @date2 不传则为now
     * @t y,M,d,h,m,s 
     */
    static timeSpan(date1: Date, date2?: Date, t?: string): number {
        date2 = date2 || new Date();
        let timeType = t || 's',
            o = {
                y: 'yyyy',
                M: 'yyyyMM',
                d: 'yyyyMMdd',
                h: 'yyyyMMddhh',
                m: 'yyyyMMddhhmm',
                s: 'yyyyMMddhhmmss'
            };

        if (!o.hasOwnProperty(timeType)) {
            return NaN;
        }

        switch (timeType) {
            case 'y': return this.year(date2) - this.year(date1);
            case 'M':
                let y = this.year(date2) - this.year(date1),
                    m = this.month(date2) - this.month(date1);
                return y * 12 + m;
            case 'd':
            case 'h':
            case 'm':
            case 's':
            default:
                let
                    format = o[timeType],
                    strDate1 = this.toString(date1, format),
                    strDate2 = this.toString(date2, format),
                    newDate1 = this.create(strDate1),
                    newDate2 = this.create(strDate2);
                return this.timeDiff(newDate1, newDate2, timeType);
        }
    };

    /** 
    * 计算两个时间之间的差值，将使用两个时间的毫秒差来计算返回值（注意和timeSpan函数的不同点）
    * 注意：1年=365天，1月=30天 
    * 例如：2015-01-09 18:06 和 2015-01-10 09:06，算d，则返回0，因为已经间隔已不足24个小时
    * --------------------------
    * @date2：[date] 不传，则为now
    * @t: [S,s,m,h,d,w,M,y] S-毫秒,w-周
    */
    static timeDiff(date1: Date, date2?: Date, t?: string): number {
        let timeType = t || 's';
        date2 = date2 || new Date();
        let timeTypes = {
            S: 1,
            s: 1000 * 1,
            m: 1000 * 60,
            h: 1000 * 60 * 60,
            d: 1000 * 60 * 60 * 24,
            w: 1000 * 60 * 60 * 24 * 7,
            M: 1000 * 60 * 60 * 24 * 30,
            y: 1000 * 60 * 60 * 24 * 365
        };
        let ret = (date2.getTime() - date1.getTime()) / (timeTypes[timeType] || 1);
        /* 负数要向上取整才正确 */
        return ret < 0 ? Math.ceil(ret) : Math.floor(ret);
    };

    static addNow(options: { [key: string]: number }): Date {
        return this.add(new Date, options);
    }

    static add(date?: Date, options?: { [key: string]: number }): Date {
        let ret = date || new Date();
        options = options || {};
        for (let key in options) {
            if (!options.hasOwnProperty(key)) continue;
            if (typeof options[key] != "number") continue;
            if (["y", "year"].indexOf(key) >= 0) { ret = this.addYears(ret, options[key]); continue; }
            if (["M", "mon", "month"].indexOf(key) >= 0) { ret = this.addMonths(ret, options[key]); continue; }
            if (["d", "day"].indexOf(key) >= 0) { ret = this.addDays(ret, options[key]); continue; }
            if (["h", "hour"].indexOf(key) >= 0) { ret = this.addHours(ret, options[key]); continue; }
            if (["m", "min", "minute"].indexOf(key) >= 0) { ret = this.addMinutes(ret, options[key]); continue; }
            if (["s", "sec", "second"].indexOf(key) >= 0) { ret = this.addSeconds(ret, options[key]); continue; }
        }
        return ret;
    }

    static addYears(date: Date, val: number): Date {
        let ret = this.clone(date);
        ret.setFullYear(this.year(ret) + val);
        return ret;
    };

    static addMonths(date: Date, val: number): Date {
        let ret = this.clone(date),
            before = this.day(date);

        ret.setMonth(this.month(date) + val - 1);
        let after = this.day(ret);

        if (before != after) {
            ret.setDate(1);
            ret = this.addDays(ret, -1);
        }
        return ret;
    };

    static addDays(date: Date, val: number): Date {
        let ret = this.clone(date);
        ret.setDate(this.day(ret) + val);
        return ret;
    };

    static addHours(date: Date, val: number): Date {
        let ret = this.clone(date);
        ret.setHours(this.hour(ret) + val);
        return ret;
    };

    static addMinutes(date: Date, val: number): Date {
        let ret = this.clone(date);
        ret.setMinutes(this.minute(ret) + val);
        return ret;
    };

    static addSeconds(date: Date, val: number): Date {
        let ret = this.clone(date);
        ret.setSeconds(this.second(ret) + val);
        return ret;
    };


    /** 
    * 获取月天数 
    * ------------------
    * @arg:[num/date] 
    *   不传，则取当月；
    *   num：数字，表示求几月份的天数（如果>12则对13求余，所得月份(在今年)的天数）
    *   date：所传日期所在月份的天数
    */
    static mdays(arg: number | Date): number {

        let date, days, now = new Date();
        if (arg instanceof Date) {
            date = arg;
        } else if (typeof arg == "number") {
            date = new Date(this.year(now), (<number>arg % 13) - 1, 1);
        } else {
            date = now;
        }

        let m = this.month(date);
        if (m == 2) {
            days = this.isLeapYear(date) ? 29 : 28;
        } else if ('1,3,5,7,8,10,12,'.indexOf(m + ',') >= 0) {
            days = 31;
        } else {
            days = 30;
        }

        return days;
    };

    /*--------------------------------------------------------------
    ***** 便利函数
    ---------------------------------------------------------------*/
    /**
     * 格式化为UTC的日期字符串
     */
    static toUTCString(date: Date, format?: string): string {
        return this.toString(date, format, true);
    };

    /**
     * 返回4位数的年份
     */
    static year(date: Date): number {
        return date.getFullYear();
    };

    /**
     * 返回实际月份
     */
    static month(date: Date): number {
        return date.getMonth() + 1;
    };

    /**
     * 返回实际号数
     */
    static day(date: Date): number {
        return date.getDate();
    };

    /* 返回星期数 */
    static week(date: Date): number {
        return date.getDay();
    };

    static hour(date: Date): number {
        return date.getHours();
    };

    static minute(date: Date): number {
        return date.getMinutes();
    };

    /**
     * 获取秒数
     */
    static second(date: Date): number {
        return date.getSeconds();
    };

    static millisecond(date: Date): number {
        return date.getMilliseconds();
    };

    static clone(date: Date): Date {
        return new Date(date.getTime());
    };

    static isLeapYear(date: Date): boolean {
        let pYear = this.year(date);
        if (pYear % 400 == 0) {
            return true;
        } else if (pYear % 100 != 0 && pYear % 4 == 0) {
            return true;
        }
        return false;
    };
}

export enum PkgTimeUnit { year, month, week, day, hour, minute, second, millisecond };