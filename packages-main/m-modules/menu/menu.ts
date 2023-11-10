import { broadcast, platform } from "@rush/main-tool"
// import { showAboutWindow } from "../window/about"
// import { setupTray } from "../window/tray"
import { Shared } from "@rush/main-share"
import { BrowserWindow, Menu, app, ipcMain, MenuItem, Settings, dialog } from "electron"
import { cloneDeep } from "lodash"
import setting from "@buildin/share/setting"
import autoLaunch from "auto-launch"
import { updateMenu } from "./utils"

let isAutoRun = false
let isLoadingAuto = true
async function checkAutoStatus() {
    try {
        const outlineAutoLauncher = new autoLaunch({
            name: setting.app_title,
            isHidden: true
        });
        const v = await outlineAutoLauncher.isEnabled()
        if (v != isAutoRun) {
            isAutoRun = v
            updateMenu(windowsMenu, "setupAction", "checked", isAutoRun)
        }
        isLoadingAuto = false
    } catch (error) {
        // logger.error("获取开机自启报错")
        // logger.error(error)
        console.log(error);

    }
}
checkAutoStatus()


export let windowsMenu: any[] = [
    {
        label: "置顶",
        id: "alwaysTopID",
        click: function (item: any, focusedWindow: BrowserWindow) {
            if (Shared.data.mainWindow?.isAlwaysOnTop()) {
                Shared.data.mainWindow.setAlwaysOnTop(false)
                updateMenu(windowsMenu, "alwaysTopID", "label", "置顶")
            } else {
                Shared.data.mainWindow?.setAlwaysOnTop(true)
                updateMenu(windowsMenu, "alwaysTopID", "label", "取消置顶")
            }
        },
    },
    {
        label: "重载",
        accelerator: "CmdOrCtrl+R",
        click: function (item: any, focusedWindow: BrowserWindow) {
            if (focusedWindow) {
                // 重载之后, 刷新并关闭所有的次要窗体
                if (focusedWindow.id === 1) {
                    BrowserWindow.getAllWindows().forEach(function (win) {
                        if (win.id > 1) {
                            win.close()
                        }
                    })
                }
                focusedWindow.reload()
            }
        },
    },
    {
        label: "功能",
        submenu: [
            // {
            //     label: "悬浮窗",
            //     click: function (item: any, focusedWindow: BrowserWindow) {

            //     },
            // },
            {
                label: "最小化到托盘",
                click: function (item: any, focusedWindow: BrowserWindow) {
                    // Shared.data.lastChoice = 1
                    // if (Shared.data.trayWindow) {
                    //     Shared.data.mainWindow?.hide() // 调用 最小化实例方法
                    // } else {
                    //     setupTray()
                    // }
                },
            },
            {
                label: "切换全屏",
                accelerator: (function () {
                    if (process.platform === "darwin") {
                        return "Ctrl+Command+F"
                    } else {
                        return "F11"
                    }
                })(),
                click: function (item: any, focusedWindow: BrowserWindow) {
                    if (focusedWindow) {
                        focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
                    }
                },
            },
            {
                type: "checkbox",
                id: "setupAction",
                label: "开机启动",
                checked: false,
                click: async function () {
                    if (!isLoadingAuto) {
                        let ss = !isAutoRun;
                        const outlineAutoLauncher = new autoLaunch({
                            name: setting.app_title,
                            isHidden: true
                        });
                        try {
                            if (ss) {
                                await outlineAutoLauncher.enable();
                            } else {
                                await outlineAutoLauncher.disable();
                            }
                        } catch (error) {
                            // logger.error("设置开机自启报错")
                            // logger.error(error)
                        }
                        const isStart = await outlineAutoLauncher.isEnabled()
                        isAutoRun = isStart
                        // logger.debug("是否开机自启:", isStart, ss)
                    } else {
                        checkAutoStatus()
                    }
                }
            }
        ],
    },
    {
        label: "开发者",
        submenu: [
            {
                label: "切换开发者工具",
                accelerator: (function () {
                    if (process.platform === "darwin") {
                        return "Alt+Command+I"
                    } else {
                        return "Ctrl+Shift+I"
                    }
                })(),
                click: function (item: any, focusedWindow: BrowserWindow) {
                    if (focusedWindow) {
                        // @ts-ignore
                        focusedWindow.toggleDevTools()
                    }
                },
            },
        ],
    },
    // {
    //     label: "帮助",
    //     submenu: [
    //         {
    //             label: "设置",
    //             click: function (item: any, focusedWindow: BrowserWindow) {
    //                 broadcast("ev:opensetting")
    //             },
    //         },
    //         {
    //             label: "检查更新",
    //             click: function (item: any, focusedWindow: BrowserWindow) {

    //             },
    //         },
    //     ],
    // },
    // {
    //   label: '重新启动',
    //   click: function(item: any, focusedWindow: BrowserWindow) {
    //     app.exit()
    //     app.relaunch()
    //     // app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
    //     // app.quit()
    //   }
    // },
    {
        label: "帮助",
        submenu: [
            {
                label: "关于我",
                click(item: any, focusedWindow: BrowserWindow) {
                    // https://www.electronjs.org/docs/api/browser-window#winsetmenubarvisibilityvisible-windows-linux
                    // showAboutWindow()
                }
            }
        ]
    }
]
