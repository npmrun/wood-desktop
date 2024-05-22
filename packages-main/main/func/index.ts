import WindowManager from "@rush/main-window-manager"
import { app, shell } from "electron";
import path from "path";

export const createWindow = (opts)=>{
    console.log(opts);
    
    WindowManager.showWindow("_blank", opts)
}

export function openLogDir(curPath?: string){
    // @ts-ignore
    shell.openPath(path.resolve(app.getPath("logs"), logger.$$date, curPath ?? ""))
}