import "@rush/main-menu"
import { Settings } from "@rush/main-config"
import WindowManager from "@rush/main-window-manager"
import ProcessManager from "@rush/main-process-manager"
import LogManager from "@rush/main-log-manager"
import { BrowserView, BrowserWindow, app, ipcMain, net, protocol, session } from "electron"
import { MessageManager } from "@rush/common-message-manager/main"
import { UpdaterManage } from "@rush/main-updater"
import { initCommands, initPrase } from "./parseCommand"
import { initPopup } from "./popup"
import path from "path"
import config from "@buildin/config"

export async function initGlobal() {
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

    /**
     * 消息管理器初始化
     */
    MessageManager.init()

    // 更新器初始化
    ;(await import("@rush/main-updater")).UpdaterManage.init()

    initPrase()
    initCommands()

    initPopup()

    ipcMain.on("runCommand", (ev, command, cwd: string, isLazy: boolean) => {
        console.log(command);
        if (command) {
            ProcessManager.create(command, cwd, isLazy)
        }
    })
    ipcMain.on("forceKillByPid", (ev, pid) => {
        console.log(pid);
        if (pid) {
            ProcessManager.forceKillByPid(pid)
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
        let mainWindow = WindowManager.getMainWindow()
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
            mainWindow.show()
        }
    })
    /**
     * 当应用程序完成初始化之后执行一次
     */
    app.on("ready", () => {
        WindowManager.showMainWindow()
        // showMainWindow()

        // wood-file协议
        // https://electron.nodejs.cn/docs/latest/api/protocol/
        protocol.handle(`${config.app_scheme}-file`, (request) => {
            const absolutePath = path.resolve(Settings.values("storagePath"), "./file", request.url.slice(`${config.app_scheme}-file://`.length))
            return net.fetch('file://' + absolutePath)
        })

        const xxx_filter = {
            urls: ["*://wp.birdpaper.com.cn/*"]
        }
        session.defaultSession.webRequest.onBeforeSendHeaders(xxx_filter, (details, callback)=> {
            delete details.requestHeaders['Origin']
            delete details.requestHeaders['Referer']
            callback({requestHeaders: details.requestHeaders});
        })
    })

    /**
     * 所有窗口关闭时触发，如果没有订阅该事件，默认退出程序，如果订阅之后，是否退出自行代码决定
     * 如果开发者调用了app.quit()，程序会自动关闭所有窗口，并且回调will-quit事件，不会回调该事件
     */
    app.on("window-all-closed", () => {
        // 可以在这里面清理创建的子进程
        if (process.platform !== "darwin") {
            app.exit()
        }
    })

    process.on("error", (err)=>{
        logger.error("系统错误:")
        logger.error(err)
    })
}