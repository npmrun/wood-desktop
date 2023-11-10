import { BrowserWindow, Menu } from "electron"
import { windowsMenu } from "./menu"

const menu = Menu.buildFromTemplate(<any>windowsMenu)
Menu.setApplicationMenu(menu)