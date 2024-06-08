import WindowManager from "@rush/main-window-manager"
import { app, shell } from "electron"
import path from "path"
import fs from "fs-extra"
import { exec } from "child_process"
import { platform } from "@rush/main-tool"
import { error } from "./dialog"
// https://koffi.dev/functions
import koffi from "koffi"

export function openExternal(url: string) {
    shell.openExternal(url)
}

export async function openDir(path: string) {
    shell.openPath(path)
}

export function showItemInFolder(fullPath: string) {
    console.log(fullPath)

    return shell.showItemInFolder(path.normalize(fullPath))
}

export function getdownloadFilePath(fileName, fileType) {
    const filePath = path.join(app.getPath("pictures"), "/download", `${fileName}.${fileType}`)
    if(!fs.pathExistsSync(filePath)){
        throw {
            message: "请先下载",
        }
    }
    return filePath
}
export function checkFileExist(filePath: string) {
    return fs.pathExistsSync(filePath)
}

/**
 *  description: 下载文件到指定目录
 *  param {string} url 文件下载链接
 *  param {string} fileName 文件名称
 *  param {string} fileType 文件格式
 *  author: longyunfei
 */
export function downloadFileToFolder(url, fileName, fileType) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(app.getPath("pictures"), "/download", `${fileName}.${fileType}`)
        if(fs.pathExistsSync(filePath)){
            reject({
                message: "已存在该图片，点击查看",
                data: filePath
            })
            return
        }
        WindowManager.getFocusWindow().webContents.downloadURL(url)
        WindowManager.getFocusWindow().webContents.session.once("will-download", (event, item, webContents) => {
            //设置保存路径
            console.log(filePath);
            
            item.setSavePath(filePath)
            // item.on('updated', (event, state) => {
            //   if (state === 'interrupted') {
            //     console.log('下载中断，可以继续');
            //   } else if (state === 'progressing') {
            //     if (item.isPaused()) {
            //       console.log('下载暂停');
            //     } else {
            //       console.log(`当前下载项目的接收字节${item.getReceivedBytes()}`);
            //       console.log(`下载完成百分比：${item.getReceivedBytes() / item.getTotalBytes() * 100}`);
            //     }
            //   }
            // });
            item.once("done", (event, state) => {
                if (state === "completed") {
                    // shell.openPath(filePath) //打开文件
                    resolve(filePath)
                }
            })
        })
    })
}

export function setDesktop(p: string){
    // if (window.preferences.customScript[utools.getLocalId()]) {
    //     exec(window.preferences.customScript[utools.getLocalId()].replace("$file", path), (err, stdout, stderr) => {
    //         err && utools.showNotification(stderr)
    //         return
    //     })
    // }
    if (platform === "MacOS") {
        exec(`osascript -e 'tell application "System Events" to set picture of desktop 1 to "${p}"'`, (err, stdout, stderr) => {
            err && error("设置壁纸错误", stderr)
        })
    } else if (platform === "windows") {
        var script = path.resolve(__extra, "./scripts/setDesktop.cs")
        exec(`powershell -NoProfile -Command "Add-Type -Path ${script}; [Wallpaper.Setter]::SetWallpaper('${p}')"`, (err, stdout, stderr) => {
            err && error("设置壁纸错误", stderr)
        })
    } else {
        var script = path.resolve(__extra, "./scripts/set_wallpaper_linux.sh")
        exec(`bash "${script}" "${p}"`, (err, stdout, stderr) => {
            err && error("设置壁纸错误", stderr)
        })
    }
}

export function setWindowsDesktop(pathString: string){
    // 设置壁纸
    // https://www.cnblogs.com/ajanuw/p/14223779.html
    const SPI_SETDESKWALLPAPER = 0x0014
    const lib = koffi.load("user32.dll")
    // https://www.cnblogs.com/china1/p/3415473.html
    const SystemParametersInfoA = lib.func("SystemParametersInfoA", "bool", ["uint", "uint", "const char*", "uint"])
    return SystemParametersInfoA(SPI_SETDESKWALLPAPER, 0, pathString, 2)
}