import { app, BrowserWindow, dialog, shell } from "electron"
import { getFileUrl } from "@rush/main-tool"
import { appIconPath } from "@rush/main-common/shared"
import setting from "@buildin/config"

export let forceClose: boolean = false
export let lastChoice: number = -1
export let mainWindow: BrowserWindow | undefined

export function hideMainWindow() {
    if (!mainWindow || mainWindow?.isDestroyed()) {
        return
    }
    mainWindow.hide()
}

export function showMainWindow(opts = {}) {
    if (!mainWindow || mainWindow?.isDestroyed()) {
        mainWindow = new BrowserWindow({
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
            webPreferences: {
                webviewTag: true,
                nodeIntegration: true,
                contextIsolation: true,
                preload: __appStatic + "/preload.js", // 预加载项
            },
            ...opts,
        })
        mainWindow.loadURL(getFileUrl("index.html"))
        mainWindow.webContents.setWindowOpenHandler(details => {
            shell.openExternal(details.url)
            return { action: "deny" }
        })
        mainWindow.on("close", (event: any) => {
            quit(event)
        })
    } else {
        mainWindow?.show()
    }
}

export function quit(event?: any, nowQuit?: boolean) {
    // 强制退出
    function justQuit() {
        lastChoice = 1
        mainWindow = undefined
        // app.quit()
        // 不要用quit();试了会弹两次
        forceClose = true
        app.quit() // exit()直接关闭客户端，不会执行quit();
    }

    if (forceClose) {
        mainWindow = undefined
        app.quit()
    } else if (mainWindow) {
        let choice = -1
        if (lastChoice >= 0) {
            choice = lastChoice
        } else {
            choice = dialog.showMessageBoxSync(mainWindow, {
                type: "info",
                title: setting.app_title,
                defaultId: 0,
                cancelId: 0,
                message: "确定要关闭吗？",
                buttons: ["没事", "直接退出"],
            })
        }
        if (choice === 1) {
            justQuit()
        } else {
            event && event.preventDefault()
        }
    }
}
