import { app } from "electron"
import { inject } from "inversify"
import { Settings } from "@rush/main-config"

abstract class Base {
    constructor() { }
    abstract windowAllClosed(): void
    abstract activate(event: Electron.Event, hasVisibleWindows: boolean): void
    abstract exit(event: Electron.Event): void
    abstract beforeQuit(event: Electron.Event): void
    abstract whenReady(event: Electron.Event, launchInfo: Record<string, any> | Electron.NotificationResponse): void
    abstract secondInstance(
        event: Electron.Event,
        argv: string[],
        workingDirectory: string,
        additionalData: unknown,
    ): void
}


class Application {
    constructor(
        
    ) {
        
    }
    #allModules: Base[] = []
    init() {
        const gotTheLock = app.requestSingleInstanceLock()
        if (!gotTheLock) {
            app.exit()
        } else {
            /**
             * 当运行了第两个应用程序时执行app.requestSingleInstanceLock()时触发
             */
            app.on("second-instance", this.#secondInstance.bind(this))
            /**
             * 当应用程序完成初始化之后执行一次
             */
            app.on("ready", this.#whenReady.bind(this))
            /**
             * 应用程序开始关闭时回调，可以通过event.preventDefault()阻止，以下两点需要注意：
             * 1. 如果是autoUpdater.quitAndInstall()关闭的，那么会所有窗口关闭，并且在close事件之后执行
             * 2. 关机，重启，用户退出时不会触发
             */
            app.on("before-quit", this.#beforeQuit.bind(this))
            /**
             * 所有窗口关闭时触发，如果没有订阅该事件，默认退出程序，如果订阅之后，是否退出自行代码决定
             * 如果开发者调用了app.quit()，程序会自动关闭所有窗口，并且回调will-quit事件，不会回调该事件
             */
            app.on("window-all-closed", this.#windowAllClosed.bind(this))
            /**
             * 当应用被激活时触发
             */
            app.on("activate", this.#activate.bind(this))

            process
                // Handle normal exits
                .on("exit", code => {
                    this.#exit.apply(this)
                })
                // Handle CTRL+C
                .on("SIGINT", () => {
                    // this.#exit.apply(this)
                })
        }
    }
    #activate() {
        this.#allModules.forEach(v => {
            v.activate.apply(v, arguments)
        })
    }
    #windowAllClosed() {
        this.#allModules.forEach(v => {
            v.windowAllClosed.apply(v, arguments)
        })
    }
    #secondInstance() {
        this.#allModules.forEach(v => {
            v.secondInstance.apply(v, arguments)
        })
    }

    #whenReady() {
        this.#allModules.forEach(v => {
            v.whenReady.apply(v, arguments)
        })
    }

    #beforeQuit() {
        this.#allModules.forEach(v => {
            v.beforeQuit.apply(this, arguments)
        })
    }

    #exit() {
        this.#allModules.forEach(v => {
            v.exit.apply(this, arguments)
        })
    }

    register(cls: Base) {
        this.#allModules.push(cls)
    }
}