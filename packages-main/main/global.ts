import "@rush/main-menu"
import { Settings } from "@rush/main-config"
import WindowManager from "@rush/main-window-manager"
import ProcessManager from "@rush/main-process-manager"
import LogManager from "@rush/main-log-manager"
import { app, ipcMain } from "electron"

export function initGlobal() {
    /**
     * 初始化配置
     */
    Settings.init()

    /**
     * 初始化Log
     */
    LogManager.init()

    /**
     * 窗口管理器初始化
     */
    WindowManager.init()

    ipcMain.on("runCommand", (ev, command) => {
        console.log(command);
        if (command) {
            ProcessManager.create(command)
        }
    })
    ipcMain.on("killByPid", (ev, pid) => {
        console.log(pid);
        if (pid) {
            ProcessManager.killByPid(pid)
        }
    })

    /**
   * 当运行了第两个应用程序时执行app.requestSingleInstanceLock()时触发
   */
    app.on("second-instance", () => {

    })
    /**
     * 当应用程序完成初始化之后执行一次
     */
    app.on("ready", () => {
        WindowManager.showMainWindow()
        // showMainWindow()
    })

    /**
     * 所有窗口关闭时触发，如果没有订阅该事件，默认退出程序，如果订阅之后，是否退出自行代码决定
     * 如果开发者调用了app.quit()，程序会自动关闭所有窗口，并且回调will-quit事件，不会回调该事件
     */
    app.on("window-all-closed", () => {

    })

}