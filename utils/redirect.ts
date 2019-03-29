/**
 * 页面跳转
 * 
 * 封装原生navigateTo方法 解决快速点击打开多个相同页面的问题
 * 
 * @export
 * @class RedirectUtility
 */
export class RedirectUtility {
    private static isRedirecting: boolean = false;

    static navigateTo(tempUrl: string) {
        if (this.isRedirecting) return;
        this.isRedirecting = true;

        wx.navigateTo({
            url: tempUrl,
            complete: () => {
                setTimeout(() => {
                    this.isRedirecting = false;
                }, 300);
            }
        });
    }

    static switchTab(tempUrl: string) {
        if (this.isRedirecting) return;

        this.isRedirecting = true;

        wx.switchTab({
            url: tempUrl,
            complete: () => {
                setTimeout(() => {
                    this.isRedirecting = false;
                }, 300);
            }
        });
    }

    static redirectTo(tempUrl: string) {
        if (this.isRedirecting) return;
        this.isRedirecting = true;

        wx.redirectTo({
            url: tempUrl,
            complete: () => {
                setTimeout(() => {
                    this.isRedirecting = false;
                }, 300);
            }
        });
    }
}