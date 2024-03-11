import { webContents, session } from "electron"

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
    console.log("-----------------------------");

    const filter = {
        urls: ['https://*.github.com/*', '*://electron.github.io/*'],
        types: ["xhr"]
    } as any
    // webview.session.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    //     details.requestHeaders['User-Agent'] = 'MyAgent'
    //     console.log(details.url);

    //     callback({ requestHeaders: details.requestHeaders })
    // })
    // webview.session.webRequest.onCompleted(filter, (details) => {
    //     // details.requestHeaders['User-Agent'] = 'MyAgent'
    //     // console.log(details);

    //     // callback({ requestHeaders: details.requestHeaders })
    // })
    try {
        webview.debugger.attach('1.1')
    } catch (err) {
        console.log('Debugger attach failed : ', err)
    }
    webview.debugger.on('message', async (event, method, params) => {
        // https://www.jianshu.com/p/e31228f17416
        // https://juejin.cn/post/7081506118060474382
        // https://www.electronjs.org/zh/docs/latest/api/debugger
        
        // if (method === 'Network.requestWillBeSent') {
        //     if (/[https|http]\:\/\/enesoon-saas-back-test\.cn/.test(params.request.url)) {
        //         console.log(params)
        //     }
        // }
        if (method === 'Network.responseReceived') {
            // if (params.response.url.indexOf('github') > 0) {
                if (/[https|http]\:\/\/enesoon-saas-back-test\.cn/.test(params.response.url)) {
                console.log('Event: responseReceived ' + params.requestId + '-' + params.response.url)
                const result = await webview.debugger.sendCommand('Network.getResponseBody', { "requestId": params.requestId }) as { body: string, base64Encoded: boolean }
                console.log(result)
            }
        }

        // if (method === 'Network.webSocketFrameReceived') {
        //     console.log(params.response)
        // }
    })
    webview.debugger.sendCommand('Network.enable')
    // session.fromPartition("persist:app").webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    //     details.requestHeaders['User-Agent'] = 'MyAgent'
    //     console.log(details.url);

    //     callback({ requestHeaders: details.requestHeaders })
    // })
    // session.fromPartition("persist:app").webRequest.onBeforeRequest({ url: 'https://github.com' }).then((cookies) => {
    //     console.log(cookies);
    // });
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