import { IpcMainEvent, ipcMain, webContents, WebContents } from "electron"
import { BIND_WINDOW } from "../common";
// import WinodwManager, { WindowManager } from "@rush/main-window-manager";

class _MessageManager {
    private constructor() { }
    static instance: null | _MessageManager = null
    static getInstance() {
        if (_MessageManager.instance == null) {
            _MessageManager.instance = new _MessageManager()
        }
        return _MessageManager.instance
    }

    #sender: Record<string, WebContents> = {}

    init() {
        // 1. 从browindow获取webContents，优点是不用再渲染层注册
        // 需要监听窗口的创建与销毁来更新数据
        // const allWin = WindowManager.getWndows()
        // allWin.forEach(v => {
        //     const name = v.webContents.$$senderName
        //     this.#sender[name] = v.webContents
        // })
        // loggerMain.debug(`已注册的窗口：${Object.keys(this.#sender).join(",")}`)
        // 2. 从渲染层注册
        ipcMain.on(BIND_WINDOW, (ev: IpcMainEvent) => {
            const name = ev.sender.$$senderName
            this.#sender[name] = ev.sender
            loggerMain.debug(`当前注册窗口：${ev.sender.$$senderName}，已注册的窗口：${Object.keys(this.#sender).join(",")}`)
        })
    }

    broadcast(event: string, ...args: any[]) {
        webContents.getAllWebContents().forEach(browser => browser.send(event, ...args))
    }
}

export const MessageManager = _MessageManager.getInstance()