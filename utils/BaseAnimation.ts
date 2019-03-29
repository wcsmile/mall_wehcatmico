/**
 * 红包弹窗工具类
 * 
 * 缺陷：
 * 1、延时执行所需时间在各终端表现不一，易导致看不到动画效果
 * 2、close需要在对应页面添加关闭的方法
 * 
 * @export
 * @class BaseAnimation
 */
export class BaseAnimation {

    private static animation: any;
    protected static defaultDuration: number = 1000;

    /**
     * 获取动画实例
     * 
     * @static
     * @returns 
     * @memberof BaseAnimation
     */
    protected static getAnimationInstance(duration?: number, timing?: string) {
        if (!this.animation) {
            this.animation = wx.createAnimation({
                duration: duration || this.defaultDuration,
                timingFunction: timing || "ease"
            });
        }
        return this.animation;
    }

    /**
     * 获取Page实例
     * 
     * @private
     * @static
     * @returns {Page} 
     * @memberof BaseAnimation
     */
    protected static getCurrPage(): Page {
        let pages = getCurrentPages();
        let curPage = pages[pages.length - 1];
        return curPage;
    }
}