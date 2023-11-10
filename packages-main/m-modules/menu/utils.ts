import { Menu } from "electron";
import { cloneDeep } from "lodash";

export function updateMenu(windowsMenu, id: string, key: string, value: any) {
    const menus = cloneDeep(windowsMenu)
    const _update = (menus: any) => {
        for (let i = 0; i < menus.length; i++) {
            const menu = menus[i];
            if (menu.id === id) {
                menu[key] = value
                return
            }
            if (menu.submenu && menu.submenu.length) {
                _update(menu.submenu)
            }
        }
    }
    _update(menus)
    windowsMenu = menus
    const menuTemp = Menu.buildFromTemplate(<any>windowsMenu)
    Menu.setApplicationMenu(menuTemp)
}