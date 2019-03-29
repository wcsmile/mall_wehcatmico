/**
 * 代金券模态框工具类
 * 
 * 缺陷：
 * 1、延时执行所需时间在各终端表现不一，易导致看不到动画效果
 * 2、close需要在对应页面添加关闭的方法
 * 
 * @export
 * @class ModalUtil
 */
import { BaseAnimation } from "./BaseAnimation";

export class OrderUtil extends BaseAnimation {

    /**
     * 展示模态框
     * 
     * @memberof ModalUtil
     */
    public static showOrderModal(): void {
        let tempAnimation = this.getAnimationInstance(600, "ease");
        let currentPage = this.getCurrPage();

        currentPage.setData({
            "_modal_.showVoucherModal": true
        });
        tempAnimation.translateY(-300).step();
        // 解决遮罩层显示与动画一起执行时无动画效果的问题
        setTimeout(() => {
            currentPage.setData({ "_modal.vVoucherAnimationData": tempAnimation.export() })
        }, 50)
    }

    /**
     * 隐藏模态框
     * 
     * @static
     * @memberof ModalUtil
     */
    public static closeOrderModal(): void {
        let currentPage = this.getCurrPage();
        let tempAnimation = this.getAnimationInstance(600, "ease");

        tempAnimation.translateY(300).step();
        currentPage.setData({ "_modal.vVoucherAnimationData": tempAnimation.export() })
        // 解决遮罩层隐藏与动画一起执行时无动画效果的问题
        setTimeout(() => {
            currentPage.setData({ "_modal_.showVoucherModal": false });
        }, 300)
    }
}