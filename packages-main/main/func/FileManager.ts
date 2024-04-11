import fs from "fs-extra"
import { app } from "electron"
import path from "path"
import { normalizePath } from "@rush/common/utils/normalize-path"

function getAppPath(...paths) {
    return normalizePath(path.normalize(path.resolve(app.getAppPath(), ...paths)))
}

class FileManager {
    path: string
    all: FileManager[]
    constructor(file_path: string) {
        this.check(getAppPath(file_path))
        this.path = getAppPath(file_path)
        this.all.push(this)
        return new Proxy(this, {
            get(target, p, receiver) {
                let originValue = target[p]
                if (typeof originValue === "function" && typeof p === "string" && p.startsWith("auth_")) {
                    this.check()
                }
                return originValue
            },
        })
    }
    static getFilePath(...path) {
        return getAppPath(...path)
    }
    private check(p?: string) {
        let _path = p ?? this.path
        if (!fs.pathExistsSync(_path)) {
            logger.error(`不存在路径:` + _path)
            throw new Error("不存在路径:" + _path)
        }
    }
    auth_read() {
        return fs.readFile(this.path, { encoding: "utf-8" })
    }
    auth_write(data: string) {
        return fs.writeFileSync(this.path, data, { encoding: "utf-8" })
    }
    auth_delete() {
        return fs.unlink(this.path)
    }
}

let allManager: FileManager[] = []

export function init(path: string) {
    let curPath = FileManager.getFilePath(...path)
    allManager.push(new FileManager(curPath))
    return curPath
}
export function getData(path: string) {
    let curInstance = allManager.find(item => item.path === path)
    if (curInstance) {
        return curInstance.auth_read()
    }
}
export function setData(path: string, data: string) {
    let curInstance = allManager.find(item => item.path === path)
    if (curInstance) {
        return curInstance.auth_write(data)
    }
}
