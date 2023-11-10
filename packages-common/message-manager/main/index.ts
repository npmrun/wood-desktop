import { IpcMainEvent, ipcMain, webContents } from "electron"


export default class MessageManager {
    private constructor() { }
    static instance: null | MessageManager = null
    static getInstance() {
        if (MessageManager.instance == null) {
            MessageManager.instance = new MessageManager()
        }
        return MessageManager.instance
    }

    #sender = []

    listen(){
        ipcMain.on("bing-window", (ev: IpcMainEvent, senderName: string)=>{
            ev.sender.$senderName = senderName
        })
    }

    broadcast(event: string, ...args: any[]) {
        webContents.getAllWebContents().forEach(browser => browser.send(event, ...args))
    }
}