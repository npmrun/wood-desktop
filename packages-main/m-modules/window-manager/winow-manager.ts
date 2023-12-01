import { BrowserWindow, BrowserWindowConstructorOptions, app, dialog, shell } from "electron";
import { cloneDeep, extend } from "lodash"
import { appIconPath } from "@rush/main-common/shared"
import setting from "@buildin/share/setting"
import { getFileUrl } from "@rush/main-tool";

interface IConfig {
    name: string
    url: string
    type: "info" | ""
    windowOpts: BrowserWindowConstructorOptions
    overideWindowOpts: boolean
    denyWindowOpen: boolean
}

type Param = Partial<IConfig> & Required<Pick<IConfig, "name">>

const defaultWindowConfig = {
    height: 600,
    useContentSize: true,
    width: 800,
    show: true,
    resizable: true,
    minWidth: 900,
    minHeight: 600,
    // icon: appIconPath,
    frame: true, // 去除原生的菜单
    transparent: false, // 背景透明, 会导致窗体没有阴影
    alwaysOnTop: false,
    webPreferences: {
        webviewTag: true,
        nodeIntegration: true,
        contextIsolation: true,
        preload: __appStatic + "/preload.js", // 预加载项
    },
}

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

    showWindow(name: string, winOpts?: BrowserWindowConstructorOptions) {
        let have = false
        for (const key in this.#urlMap) {
            const info = this.#urlMap[key];
            if (new RegExp(key).test(name)) {
                info.name = name
                if (winOpts) {
                    info.windowOpts = winOpts
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

    #mainInfo = {
        name: "main", // 主窗口key
        url: getFileUrl("index.html"),
        windowOpts: {
            icon: appIconPath,
        }
    }
    #urlMap = {
        "^about": {
            "url": getFileUrl("about.html"),
            overideWindowOpts: true,
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
                // parent: Shared.data.mainWindow as BrowserWindow,
                webPreferences: {
                    devTools: false,
                    enableRemoteModule: false,
                    sandbox: false,
                    nodeIntegration: false,
                    contextIsolation: true,
                },
            }
        }
    }

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
        denyWindowOpen: true
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
        const browserWin = new BrowserWindow(extend(curConfig.overideWindowOpts ? {} : cloneDeep(defaultWindowConfig), curConfig.windowOpts ?? {}))
        browserWin.webContents.setWindowOpenHandler(details => {
            if (curConfig.denyWindowOpen) {
                return { action: "deny" }
            }
        })
        browserWin.webContents.$$senderName = curConfig.name
        browserWin.$$forceClose = false
        browserWin.$$lastChoice = -1
        browserWin.on("close", (event: any) => {
            if (curConfig.name !== this.#mainInfo.name) {
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
        })
        browserWin.$$opts = curConfig
        // 在此注册窗口
        // browserWin.webContents.executeJavaScript(`window._global=${JSON.stringify({ name: curConfig.name })}`)
        if (curConfig.type === "info") {
            // 隐藏菜单
            browserWin.setMenuBarVisibility(false)
            browserWin.on("ready-to-show", () => {
                browserWin?.show()
            })
        }
        curConfig.url && browserWin.loadURL(curConfig.url)
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
