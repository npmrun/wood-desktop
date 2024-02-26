import { isDev } from "@rush/main-tool"
import { rootPath, distPath } from "@buildin/share/var"
import fs from "fs-extra"
import path from "path"

const resolvePath = (...argu: string[]) => {
    // let p = __appAsarDir
    // if (isDev) {
    //     p = rootPath
    // }
    return path.resolve(__appAsarDir, ...argu)
}
const resolveDist = (...argu: string[]) => {
    // let p = app.getAppPath()
    // if (isDev) {
    //     p = distPath
    // }
    return path.resolve(__appAsarDir, ...argu)
}
const commands = {
    "live-server": resolvePath("node_modules/live-server/live-server.js"),
    show: resolveDist("scripts/main.js"),
    test: resolveDist("scripts/test.js"),
}

export function checkCommand(str: string) {
    const p = commands[str]
    const isExist = fs.pathExistsSync(p)
    if (p && isExist) {
        return p
    } else {
        console.log(`不存在${str}命令:${p}`);
    }
}

export default commands
