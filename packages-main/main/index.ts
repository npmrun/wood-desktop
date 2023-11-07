import "reflect-metadata"

import { app } from "electron"
import { forceClose, mainWindow, showMainWindow } from "@rush/main-window"

import { containerMap } from "@rush/main-core"

console.log(containerMap.Settings.config());

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
    app.exit()
} else {
    /**
    * 当运行了第两个应用程序时执行app.requestSingleInstanceLock()时触发
    */
    app.on("second-instance", () => {

    })
    /**
     * 当应用程序完成初始化之后执行一次
     */
    app.on("ready", () => {
        showMainWindow()
    })
    /**
     * 应用程序开始关闭时回调，可以通过event.preventDefault()阻止，以下两点需要注意：
     * 1. 如果是autoUpdater.quitAndInstall()关闭的，那么会所有窗口关闭，并且在close事件之后执行
     * 2. 关机，重启，用户退出时不会触发
     */
    app.on("before-quit", (event: Electron.Event) => {
        if (forceClose) {
            // app.exit()
        } else {
            event.preventDefault()
        }
    })
    /**
     * 所有窗口关闭时触发，如果没有订阅该事件，默认退出程序，如果订阅之后，是否退出自行代码决定
     * 如果开发者调用了app.quit()，程序会自动关闭所有窗口，并且回调will-quit事件，不会回调该事件
     */
    app.on("window-all-closed", () => {

    })
    /**
     * 当应用被激活时触发
     */
    app.on("activate", () => {
        if (!mainWindow) {
            showMainWindow()
        }
    })
}
