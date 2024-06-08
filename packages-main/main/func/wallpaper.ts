import { app, screen } from "electron"
import * as electronAsWallpaper from "@rush/native-demo"
// https://koffi.dev/functions
import koffi from "koffi"
import { Settings } from "@rush/main-config"
import WindowManager from "@rush/main-window-manager"
import path from "path"
import { platform } from "@rush/main-tool"
import { setDesktop } from "./utils"

// await _agent.callLong("attachWindow")
// await _agent.callLong("refreshWindow")
// await _agent.callLong("loadWallpaper", "https://www.nayuki.io/res/full-screen-clock-javascript/full-screen-clock-12hr-with-seconds.html")
// await _agent.callLong("detachWindow")
app.whenReady().then(() => {
    const url = Settings.values("desktop:wallpaper")
    if (url) {
        WindowManager.showWindow("hidden")
        const wallpaper = WindowManager.get("hidden")
        wallpaper.setBounds(screen.getPrimaryDisplay().bounds)
        if (wallpaper) {
            wallpaper.loadURL(url).then(() => {
                electronAsWallpaper.attach(wallpaper)
            })
        }
    }
})

export function attachWindow() {
    WindowManager.showWindow("hidden")
    const wallpaper = WindowManager.get("hidden")
    wallpaper.setBounds(screen.getPrimaryDisplay().bounds)
    const url = wallpaper.webContents.getURL()
    if (url) {
        Settings.set("desktop:wallpaper", url)
    }
    electronAsWallpaper.attach(wallpaper, { transparent: true })
}
export function refreshWindow() {
    // 在分离前窗口关闭的话屏幕会变黑色
    // 如果屏幕是黑的，可调用这个函数刷新一下
    electronAsWallpaper.refresh()
}
export function detachWindow() {
    const wallpaper = WindowManager.get("hidden")
    Settings.reset("desktop:wallpaper")
    wallpaper && electronAsWallpaper.detach(wallpaper)
    wallpaper.setBounds({ width: 800, height: 600 })
}
export function closeWallpaper() {
    const wallpaper = WindowManager.get("hidden")
    if (wallpaper) {
        Settings.reset("desktop:wallpaper")
        electronAsWallpaper.detach(wallpaper)
        wallpaper.close()
        electronAsWallpaper.refresh()
    }
}
export function loadWallpaper(url: string) {
    const wallpaper = WindowManager.get("hidden")
    if (wallpaper) {
        Settings.set("desktop:wallpaper", url)
        wallpaper.loadURL(url)
    }
}

export function setStaticWallpaper(pathString: string) {
    setDesktop(pathString)
}

export function Test(a: number, b: number) {
    // koffi demo
    // https://zhuanlan.zhihu.com/p/687513603
    const lib = koffi.load(path.resolve(__buildAssets, "dll/add.dll"))
    const add = lib.func("Add", "int", ["int", "int"])
    return add(a, b)

    // koffi demo
    // const lib = koffi.load('user32.dll');
    // // Declare constants
    // const MB_OK = 0x0;
    // const MB_YESNO = 0x4;
    // const MB_ICONQUESTION = 0x20;
    // const MB_ICONINFORMATION = 0x40;
    // const IDOK = 1;
    // const IDYES = 6;
    // const IDNO = 7;

    // // Find functions
    // const MessageBoxA = lib.func('__stdcall', 'MessageBoxA', 'int', ['void *', 'str', 'str', 'uint']);
    // const MessageBoxW = lib.func('__stdcall', 'MessageBoxW', 'int', ['void *', 'str16', 'str16', 'uint']);

    // let ret = MessageBoxA(null, 'Do you want another message box?', 'Koffi', MB_YESNO | MB_ICONQUESTION);
    // if (ret == IDYES)
    //     MessageBoxW(null, 'Hello World!', 'Koffi', MB_ICONINFORMATION);
}
