/**
 * 模态框工具类
 * 
 * 缺陷：
 * 1、延时执行所需时间在各终端表现不一，易导致看不到动画效果
 * 2、close需要在对应页面添加关闭的方法
 * 
 * @export
 * @class ModalUtil
 */
import { BaseAnimation } from "./BaseAnimation";

export class GuideModalUtil extends BaseAnimation {
    //iphone6 默认屏幕高度为667
    static screenHeight: number = 666;

    /**
     * 展示模态框
     * 
     * @memberof ModalUtil
     */
    public static showGuideModal(): void {
        if (this.screenHeight == 666) {
            let systemInfo: any = wx.getSystemInfoSync();
            this.screenHeight = systemInfo.windowHeight;
        }
        let tempAnimation = this.getAnimationInstance();
        let currentPage = this.getCurrPage();

        currentPage.setData({
            "_modal_.showModal": true
        });
        tempAnimation.translateY(this.screenHeight / 5).step();
        // 解决遮罩层显示与动画一起执行时无动画效果的问题
        setTimeout(() => {
            currentPage.setData({ "_modal.vAnimationData": tempAnimation.export() })
        }, 50)
    }

    public static swipe(left): void {

        let tempAnimation = this.getAnimationInstance();
        let currentPage = this.getCurrPage();

        tempAnimation.translate(left).step({ duration: 200 });
        return tempAnimation.export();
    }

    /**
     * 隐藏模态框
     * 
     * @static
     * @memberof ModalUtil
     */
    public static closeGuideModal(): void {
        let currentPage = this.getCurrPage();
        let tempAnimation = this.getAnimationInstance();

        tempAnimation.translateY(-(this.screenHeight / 5)).step();
        currentPage.setData({ "_modal.vAnimationData": tempAnimation.export() })
        // 解决遮罩层隐藏与动画一起执行时无动画效果的问题
        setTimeout(() => {
            currentPage.setData({ "_modal_.showModal": false });
        }, 300)
    }
}