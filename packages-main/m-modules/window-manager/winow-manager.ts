import { BrowserWindow, BrowserWindowConstructorOptions, app, dialog, shell } from "electron";
import { cloneDeep, merge } from "lodash"
import { appIconPath } from "@rush/main-common/shared"
import setting from "@buildin/config"
import { getFileUrl } from "@rush/main-tool";
import { defaultWindowConfig, getWindowsMap, mainInfo } from "./windowsMap";
import path from "path";

interface IConfig {
    name: string
    url: string
    type: "info" | ""
    windowOpts: BrowserWindowConstructorOptions
    overideWindowOpts: boolean
    denyWindowOpen: boolean
    confrimWindowClose: boolean
    confrimWindowCloseText?: {
        title: string,
        message: string,
        buttons: string[],
        defaultId: number,
        cancelId: number,
    },
}

type Param = Partial<IConfig> & Required<Pick<IConfig, "name">>

export default class WindowManager {
    private constructor() { }
    static instance: null | WindowManager = null
    static getInstance() {
        if (WindowManager.instance == null) {
            WindowManager.instance = new WindowManager()
        }
        return WindowManager.instance
    }

    #showWin(info: Param) {
        if (this.#windows.length >= 6) {
            dialog.showErrorBox("错误", "窗口数量超出限制")
            return
        }
        let index = this.findIndex(info?.name)
        if (index === -1) {
            this.#windows.push(WindowManager.getInstance().#add(info))
        } else {
            if (this.#windows[index].isDestroyed()) {
                this.#windows[index] = WindowManager.getInstance().#add(info)
            } else {
                this.#windows[index].show()
            }
        }
        this.showCurrentWindow()
    }

    showMainWindow() {
        this.#showWin(this.#mainInfo)
    }

    showWindow(name: string, opts?: Partial<IConfig>) {
        let have = false
        for (const key in this.#urlMap) {
            const info = this.#urlMap[key];
            if (new RegExp(key).test(name)) {
                opts && merge(info, opts)
                info.name = name
                if (!info.url) {
                    dialog.showErrorBox("错误", name + "窗口未提供url")
                    return
                }
                this.#showWin(info)
                have = true
            }
        }
        if (!have) {
            dialog.showErrorBox("错误", name + "窗口未创建成功")
            return
        }
    }

    init() {
        /**
         * 当应用被激活时触发
         */
        app.on("activate", () => {
            this.showMainWindow()
        })
        /**
         * 应用程序开始关闭时回调，可以通过event.preventDefault()阻止，以下两点需要注意：
         * 1. 如果是autoUpdater.quitAndInstall()关闭的，那么会所有窗口关闭，并且在close事件之后执行
         * 2. 关机，重启，用户退出时不会触发
         */
        app.on("before-quit", (event: Electron.Event) => {
            let mainWin = this.get(this.#mainInfo.name)
            if (mainWin.$$forceClose) {
                // app.exit()
            } else {
                event.preventDefault()
            }
        })
    }

    #mainInfo = mainInfo

    #urlMap = getWindowsMap()

    getWndows() {
        return this.#windows
    }

    length() {
        return this.#windows.length
    }

    public get mainInfo() {
        return this.#mainInfo
    }


    #windows: BrowserWindow[] = []

    #defaultConfig: IConfig = {
        name: "",
        url: "",
        windowOpts: {},
        type: "",
        overideWindowOpts: false,
        confrimWindowClose: false,
        denyWindowOpen: true,
        confrimWindowCloseText: {
            title: setting.app_title,
            defaultId: 0,
            cancelId: 0,
            message: "确定要关闭吗？",
            buttons: ["没事", "直接退出"]
        },
    }

    #add(config: Param) {
        let curConfig = cloneDeep(this.#defaultConfig)
        for (const key in config) {
            if (Object.prototype.hasOwnProperty.call(config, key)) {
                const value = config[key];
                if (Reflect.has(curConfig, key)) {
                    curConfig[key] = value
                }
            }
        }
        const privateConfig = merge(curConfig.overideWindowOpts ? {} : cloneDeep(defaultWindowConfig), curConfig.windowOpts ?? {})
        logger.debug(`当前创建的窗口参数：`)
        logger.debug(privateConfig)
        const browserWin = new BrowserWindow(privateConfig)
        browserWin.webContents.setWindowOpenHandler(details => {
            console.log(details);
            
            if (curConfig.denyWindowOpen) {
                return { action: "deny" }
            }
        })
        browserWin.webContents.$$senderName = curConfig.name
        browserWin.$$forceClose = false
        browserWin.$$lastChoice = -1
        browserWin.on("close", (event: any) => {
            // if (curConfig.name !== this.#mainInfo.name) {
            //     this.#onClose(curConfig.name)
            //     return
            // }
            if (!curConfig.confrimWindowClose) {
                this.#onClose(curConfig.name)
                return
            }
            let that = this
            function justQuit() {
                browserWin.$$lastChoice = 1
                that.delete(curConfig.name)
                // app.quit()
                // 不要用quit();试了会弹两次
                browserWin.$$forceClose = true
                app.quit() // exit()直接关闭客户端，不会执行quit();
                that.showCurrentWindow()
            }
            if (browserWin.$$forceClose) {
                that.delete(curConfig.name)
                app.quit()
            } else {
                let choice = -1
                if (browserWin.$$lastChoice >= 0) {
                    choice = browserWin.$$lastChoice
                } else {
                    choice = dialog.showMessageBoxSync(browserWin, {
                        type: "info",
                        title: curConfig.confrimWindowCloseText.title,
                        defaultId: curConfig.confrimWindowCloseText.defaultId,
                        cancelId: curConfig.confrimWindowCloseText.cancelId,
                        message: curConfig.confrimWindowCloseText.message,
                        buttons: curConfig.confrimWindowCloseText.buttons,
                    })
                }
                if (choice === 1) {
                    justQuit()
                } else {
                    event && event.preventDefault()
                }
            }
        })
        browserWin.$$opts = curConfig
        // 在此注册窗口
        // browserWin.webContents.addListener("did-finish-load", ()=>{
        //     browserWin.webContents.executeJavaScript(`console.log("did-finish-load")`)
        //     browserWin.webContents.executeJavaScript(`window._global=${JSON.stringify({ name: curConfig.name })};console.log(_global)`)
        // })
        // https://www.electronjs.org/zh/docs/latest/tutorial/security#12-%E5%88%9B%E5%BB%BAwebview%E5%89%8D%E7%A1%AE%E8%AE%A4%E5%85%B6%E9%80%89%E9%A1%B9
        browserWin.webContents.on('will-attach-webview', (event, webPreferences, params) => {

            if(webPreferences.preload !== path.resolve(app.getAppPath(), "webview.js")) {
                // 如果未使用，则删除预加载脚本或验证其位置是否合法
                delete webPreferences.preload
            }
        
            // 禁用 Node.js 集成
            webPreferences.nodeIntegration = false
        
            // 验证正在加载的 URL
            // if (!params.src.startsWith('https://example.com/')) {
            //   event.preventDefault()
            // }
        })
        if (curConfig.type === "info") {
            // 隐藏菜单
            browserWin.setMenuBarVisibility(false)
            browserWin.on("ready-to-show", () => {
                browserWin?.show()
            })
        }
        if (curConfig.url) {
            browserWin.loadURL(curConfig.url)
            logger.debug(`当前窗口网址：${curConfig.url}`)
        }
        return browserWin
    }

    showCurrentWindow() {
        console.log(this.#windows.map(v => v.$$opts.name).join(","));
    }

    #onClose(name: string) {
        for (let i = this.#windows.length - 1; i >= 0; i--) {
            let win = this.#windows[i]
            if (name === win.$$opts.name) {
                win.destroy()
                this.#windows.splice(i, 1)
            }
        }
        this.showCurrentWindow()
    }

    get(name: string) {
        return this.#windows.find(v => {
            return v.$$opts.name === name
        })
    }

    getFocusWindow() {
        let mainWindow = this.getMainWindow()
        if (mainWindow.isFocused()) {
            return mainWindow
        }
        for (let i = 0; i < this.#windows.length; i++) {
            const win = this.#windows[i];
            if (win.isFocused()) {
                return win
            }
        }
    }

    getMainWindow() {
        return this.#windows.find(v => {
            return v.$$opts.name === this.#mainInfo.name
        })
    }

    close(name: string | RegExp) {
        let indexList = this.findAllIndex(name)
        for (let i = indexList.length - 1; i >= 0; i--) {
            const index = indexList[i];
            const win = this.#windows[index]
            win.close()
        }
    }

    delete(name: string | RegExp) {
        let indexList = this.findAllIndex(name)
        for (let i = indexList.length - 1; i >= 0; i--) {
            const index = indexList[i];
            this.#windows.splice(index, 1)
        }
    }

    findIndex(name: string | RegExp) {
        let index = this.#windows.findIndex(v => {
            if (typeof name === "string") {
                return v.$$opts.name === name
            } else {
                return name.test(v.$$opts.name)
            }
        })
        return index
    }

    findAllIndex(name: string | RegExp) {
        const result: number[] = []
        for (let i = 0; i < this.#windows.length; i++) {
            const win = this.#windows[i];
            if (typeof name === "string" && win.$$opts.name === name) {
                result.push(i)
            } else if (typeof name !== "string" && name.test(win.$$opts.name)) {
                result.push(i)
            }
        }
        return result
    }

    // show(name: string | RegExp) {
    //     let indexList = this.findAllIndex(name)
    //     if (!!indexList.length) {
    //         for (let i = 0; i < indexList.length; i++) {
    //             const index = indexList[i];
    //             const win = this.#windows[index]
    //             if (win.isDestroyed()) {
    //                 this.#windows[index] = this.#add(win.$$opts)
    //             } else {
    //                 win.show()
    //             }
    //         }
    //     } else {
    //         console.warn("该窗口不存在")
    //     }
    // }
}
