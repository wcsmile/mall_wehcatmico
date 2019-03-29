export class CommonUtility {

    /**
     * 是否为JSON格式
     * 
     * @static
     * @param {any} str 
     * @returns {boolean} 
     * @memberof CommonUtility
     */
    static isJSON(str): boolean {
        if (!str) {
            return false;
        }
        try {
            var obj = JSON.parse(str);
            if (str.indexOf('{') > -1) {
                return true;
            } else {
                return false;
            }

        } catch (e) {
            console.log(e);
            return false;
        }
    }

    /**
     * 对象合并，需要注意属性名重复的问题
     * 如果重复，后面对象的属性替换前者
     * @param params 参数
     */
    static merge(...params: { [key: string]: any }[]) {
        const result: { [key: string]: any } = {};
        params.forEach(item => {
            this.forEach(item, (val, key) => {
                result[key] = val;
            })
        });
        return result;
    }

    /**
     * 遍历键值对对象
     * @param source 数据源，必须是{string:any}类型
     * @param iterate 迭代处理函数
     */
    static forEach(source: { [key: string]: any }, iterate: (value: any, key?: string, index?: number) => null | any): void {
        let count = 0;
        for (const key in source) {
            iterate(source[key], key, count++);
        }
    }

    static IdCardValidate = function (idCard): boolean {        
        var Wi = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1];    // 加权因子             
        var ValideCode = [1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2];            // 身份证验证位值.10代表X             
        if (idCard.length == 15) {            
            var year = idCard.substring(6, 8);            
            var month = idCard.substring(8, 10);            
            var day = idCard.substring(10, 12);            
            var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));            // 对于老身份证中的你年龄则不需考虑千年虫问题而使用getYear()方法                 
            if (temp_date.getFullYear() != parseFloat(year) || temp_date.getMonth() != parseFloat(month) - 1 || temp_date.getDate() != parseFloat(day)) {                
                return false;            
            } else {                
                return true;            
            }        
        } else if (idCard.length == 18) {            
            var a_idCard = idCard.split("");                // 得到身份证数组             
            var year = idCard.substring(6, 10);            
            var month = idCard.substring(10, 12);            
            var day = idCard.substring(12, 14);            
            var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));            // 这里用getFullYear()获取年份，避免千年虫问题                 
            if (temp_date.getFullYear() != parseFloat(year) || temp_date.getMonth() != parseFloat(month) - 1 || temp_date.getDate() != parseFloat(day)) {                
                return false;            
            }
            var sum = 0;                             // 声明加权求和变量                 
            if (a_idCard[17].toLowerCase() == 'x') {                
                a_idCard[17] = 10;                    // 将最后位为x的验证码替换为10方便后续操作                 
            }            
            for (var i = 0; i < 17; i++) {                
                sum += Wi[i] * a_idCard[i];            // 加权求和                 
            }
            var valCodePosition = sum % 11;                // 得到验证码所位置                 
            if (a_idCard[17] == ValideCode[valCodePosition]) {                
                return true;            
            } else {                
                return false;            
            }        
        } else {            
            return false;        
        }    
    }
}