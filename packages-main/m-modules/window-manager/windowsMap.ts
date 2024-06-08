import { appIconPath } from "@rush/main-common/shared";
import { getFileUrl } from "@rush/main-tool";
import setting from "@buildin/config"
import { cloneDeep } from "lodash";

export const mainInfo = {
    name: "main", // 主窗口key
    url: getFileUrl("index.html"),
    confrimWindowClose: true,
    windowOpts: {
        webPreferences: {
            webviewTag: true,
            nodeIntegration: true,
            contextIsolation: true,
            preload: __appStatic + "/preload.js", // 预加载项
        },
    }
}

export const defaultWindowConfig = {
    height: 600,
    useContentSize: true,
    width: 800,
    show: true,
    resizable: true,
    minWidth: 900,
    minHeight: 600,
    icon: appIconPath,
    frame: true, // 去除原生的菜单
    transparent: false, // 背景透明, 会导致窗体没有阴影
    alwaysOnTop: false,
    webPreferences: {},
}

export function getWindowsMap() {
    return {
        "_blank": {
            overideWindowOpts: false,
            confrimWindowClose: true,
            confrimWindowCloseText: {
                title: setting.app_title,
                defaultId: 0,
                cancelId: 0,
                message: "确定要关闭吗？",
                buttons: ["没事", "直接退出"]
            },
            type: "info",
            windowOpts: {
                height: 600,
                useContentSize: true,
                width: 800,
                show: true,
                resizable: true,
                minWidth: 900,
                minHeight: 600,
                frame: true,
                transparent: false,
                alwaysOnTop: false,
                icon: appIconPath,
                title: setting.app_title,
                webPreferences: {
                    devTools: false,
                    enableRemoteModule: false,
                    sandbox: true,
                    nodeIntegration: false,
                    contextIsolation: true,
                    webviewTag: false,
                    preload: null
                },
            }
        },
        "^hidden": {
            overideWindowOpts: true,
            confrimWindowClose: false,
            ignoreEmptyUrl: true,
            type: "info",
            windowOpts: {
                show: false,
                frame: false,
                focusable: false, // 窗口不能作为焦点被选中
                transparent: true, // 使窗口透明
                enableLargerThanScreen: true,
                autoHideMenuBar: true,
                webPreferences: {
                    devTools: false,
                    backgroundThrottling: false,
                },
            }
        },
        "^about": {
            "url": getFileUrl("about.html"),
            overideWindowOpts: true,
            confrimWindowClose: false,
            type: "info",
            windowOpts: {
                width: 600,
                height: 200,
                minimizable: false,
                darkTheme: true,
                modal: true,
                show: false,
                resizable: false,
                icon: appIconPath,
                webPreferences: {
                    devTools: false,
                    enableRemoteModule: false,
                    sandbox: false,
                    nodeIntegration: false,
                    contextIsolation: true,
                },
            }
        },
    }
}