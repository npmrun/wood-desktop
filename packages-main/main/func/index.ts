import WindowManager from "@rush/main-window-manager"
import { app, clipboard, shell } from "electron";
import path from "path";

export const createWindow = (opts)=>{
    console.log(opts);
    
    WindowManager.showWindow("_blank", opts)
}

export function openLogDir(curPath?: string){
    // @ts-ignore
    shell.openPath(path.resolve(app.getPath("logs"), logger.$$date, curPath ?? ""))
}

export function copyText(text: string) {
    clipboard.writeText(text, "clipboard")
    // const n = new Notification({title: "片段复制", body: "复制成功，请在您需要的地方粘贴", icon: appTrayPath})
    // n.show()
}