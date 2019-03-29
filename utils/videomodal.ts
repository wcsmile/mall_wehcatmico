/**
 * 模态框工具类
 * 
 * 缺陷：
 * 1、延时执行所需时间在各终端表现不一，易导致看不到动画效果
 * 2、close需要在对应页面添加关闭的方法
 * 
 * @export
 * @class ViedoModalUtil
 */
import { BaseAnimation } from "./BaseAnimation";

export class ViedoModalUtil extends BaseAnimation {

    //iphone6 默认屏幕高度为667
    static screenHeight: number = 666;

    /**
     * 展示模态框
     * 
     * @memberof ViedoModalUtil
     */
    public static show(tips): void {
        let tempAnimation = this.getAnimationInstance();
        let currentPage = this.getCurrPage();

        let systemInfo: any = wx.getSystemInfoSync();
        this.screenHeight = systemInfo.windowHeight;
        
        console.log("========", this.screenHeight);

        currentPage.setData({
            "_modal_.showVideoModal": true,
            vRechargeLimit: tips
        });
        tempAnimation.translateY(400).step();
        // 解决遮罩层显示与动画一起执行时无动画效果的问题
        setTimeout(() => {
            currentPage.setData({ "_modal.vVideoAnimationData": tempAnimation.export() })
        }, 50)
    }

    /**
     * 隐藏模态框
     * 
     * @static
     * @memberof ViedoModalUtil
     */
    public static hide(): void {
        let currentPage = this.getCurrPage();
        let tempAnimation = this.getAnimationInstance();

        tempAnimation.translateY(-400).step();
        currentPage.setData({ "_modal.vVideoAnimationData": tempAnimation.export() })
        // 解决遮罩层隐藏与动画一起执行时无动画效果的问题
        setTimeout(() => {
            currentPage.setData({
                "_modal_.showVideoModal": false
            });
        }, 300)
    }
}