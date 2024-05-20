import { shell } from "electron"
import path from "path"

export function openExternal(url:string) {
    shell.openExternal(url)
}

export async function openDir(path: string){
    shell.openPath(path)
}

export function showItemInFolder(fullPath: string){
    console.log(fullPath);
    
    return shell.showItemInFolder(path.normalize(fullPath))
}
