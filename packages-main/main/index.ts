import "reflect-metadata"

import "@rush/main-menu"

import { BrowserWindow, Menu, app, ipcMain } from "electron"
import { forceClose, mainWindow, showMainWindow } from "@rush/main-window"

import { containerMap } from "@rush/main-core"
import { onProcessTreeMetricsForPid } from '@rush/process-reporter';
import { broadcast, getFileUrl } from "@rush/main-tool";
import ProcessManager from "@rush/main-process-manager";
import MessageManager from "@rush/common-message-manager/main";
import WindowManager from "@rush/main-window-manager";
// onProcessTreeMetricsForPid(process.pid, { samplingInterval: 1000 }) // returns a rx.Observable
//   .subscribe(report => {
//     broadcast("process-report", report)
//   })

ipcMain.on("runCommand", (ev, command) => {
    console.log(command);
    if (command) {
        ProcessManager.getInstance().create(command)
    }
})
ipcMain.on("killByPid", (ev, pid) => {
    console.log(pid);
    if (pid) {
        ProcessManager.getInstance().killByPid(pid)
    }
})

console.log(containerMap.Settings.config());

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
    app.exit()
} else {
    WindowManager.getInstance().init()
    /**
    * 当运行了第两个应用程序时执行app.requestSingleInstanceLock()时触发
    */
    app.on("second-instance", () => {

    })
    /**
     * 当应用程序完成初始化之后执行一次
     */
    app.on("ready", () => {
        WindowManager.getInstance().showWindow("about")
        WindowManager.getInstance().showMainWindow()
        // showMainWindow()
    })

    /**
     * 所有窗口关闭时触发，如果没有订阅该事件，默认退出程序，如果订阅之后，是否退出自行代码决定
     * 如果开发者调用了app.quit()，程序会自动关闭所有窗口，并且回调will-quit事件，不会回调该事件
     */
    app.on("window-all-closed", () => {

    })
}
