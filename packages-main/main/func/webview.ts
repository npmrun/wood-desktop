import { webContents } from "electron"

let lastWebview
export function preventWebview(id: number) {
    const webview = webContents.fromId(id)
    if (webview.id === lastWebview?.id) {
        return
    }
    // https://www.electronjs.org/zh/blog/electron-13-0#highlight-features
    webview.setWindowOpenHandler(details => {
        webview.loadURL(details.url)
        return { action: "deny" }
    })
    lastWebview = webview
}

export function destoryWebview(id: number) {
    const webview = webContents.fromId(id)
    if (webview.id === lastWebview?.id) {
        lastWebview = undefined
    }
}

export function toggleDevTools(id: number) {
    const webview = webContents.fromId(id)
    if (webview.isDevToolsOpened()) {
        webview.closeDevTools()
    } else {
        webview.openDevTools({
            mode: "detach",
        })
    }
}