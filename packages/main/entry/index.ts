import { Base } from "@rush/main-common/interface"
import { app } from "electron"
import { Application } from "./Base"
import { forceClose, mainWindow, showMainWindow } from "./showMain"

interface ILife {
    // onLaunch?(): void
    // onShow?: () => void
    // onHide?: () => void
    // onError?: () => void
    // onUnhandledRejection?: () => void
}

abstract class WindowApplication implements Base {
    createWindow() {
        showMainWindow()
    }

    windowAllClosed(): void {
        if (process.platform !== "darwin") {
            app.quit()
        }
    }
    activate(event: Electron.Event, hasVisibleWindows: boolean): void {
        if (!mainWindow) {
            showMainWindow()
        }
    }
    beforeQuit(event: Electron.Event): void {
        if (forceClose) {
            // app.exit()
        } else {
            event.preventDefault()
        }
    }
    whenReady(event: Electron.Event, launchInfo: Record<string, any> | Electron.NotificationResponse): void {
        this.createWindow()
    }
    secondInstance(event: Electron.Event, argv: string[], workingDirectory: string, additionalData: unknown): void {}

    // /**
    //  * 初始化完成时触发（全局只触发一次）
    //  */
    // abstract onLaunch()
    // /**
    //  * 启动，或从后台进入前台显示
    //  */
    // abstract onShow()
    // /**
    //  * 从前台进入后台
    //  */
    // abstract onHide()
    // /**
    //  *  报错时触发
    //  */
    // abstract onError()
    // /**
    //  * 对未处理的 Promise 拒绝事件监听函数（2.8.1+）
    //  */
    // abstract onUnhandledRejection()
}

class MainWindow extends WindowApplication {
    onLaunch() {}
    onShow() {}
    onHide() {
        throw new Error("Method not implemented.")
    }
    onError() {
        throw new Error("Method not implemented.")
    }
    onUnhandledRejection() {
        throw new Error("Method not implemented.")
    }
    onLoad() {
        throw new Error("Method not implemented.")
    }
}

const exe = new Application()
exe.register(new MainWindow())
