/**
 * 弹窗服务
 * 遗留问题：一次只能弹出一个窗口，不能同时弹出两个框(同类型或不同类型都不行)
 *   同时弹出两个窗口，后面一个会直接替换掉前者
 */
type DialogIcon = "info" | "success" | "danger" | "error";

export class DialogUtility {
    /**
     * icon-info 实圈i
     * icon-success 实圈√
     * icon-danger-circle 实圈！
     * icon-error 实圈×
     */
    private static icons = {
        info: "icon-info",
        success: "icon-success",
        danger: "icon-danger-circle",
        error: "icon-error"
    };

    static loading(msg: string, auto?: number): void {
        auto = auto || -1;
        this.alert({ title: msg || 'NULL', mode: "loading", auto: auto });
    }

    static tip(msg: string, icon?: DialogIcon): void {
        this.alert({ title: msg || 'NULL', mode: "tip", icon: this.icons[icon || "info"], auto: 2 });
    }

    static toast(msg: string, icon?: DialogIcon): void {
        if (!msg) {
            return;
        }
        this.alert({ title: msg || 'NULL', mode: "tip", icon: this.icons[icon || "info"], auto: 2 });
    }

    /**
     * 关闭Loading
     */
    static close(page: Page): void {
        page.setData({ '_dialog_.loadingState': false });
    }

    static alert(options: DialogOptions): void {
        if (options.mode == "tip") {
            options.tipState = true;
            options.loadingState = false;
        } else if (options.mode == "loading") {
            options.tipState = false;
            options.loadingState = true;
        } else {
            options.tipState = options.loadingState = false;
        }
        let page = this.getCurrPage();
        page.setData({ _dialog_: options });
        if (options.auto > 0) {
            setTimeout(() => {
                page.setData({ '_dialog_.tipState': false });
            }, options.auto * 1000);
        }
    }

    private static getCurrPage(): Page {
        let pages = getCurrentPages();
        let curPage = pages[pages.length - 1];
        return curPage;
    }
}

class DialogOptions {
    constructor(
        public title: string = "",
        public tipState?: boolean,
        public loadingState?: boolean,
        public mode?: string,
        public icon?: string,
        public auto?: number
    ) { }
}