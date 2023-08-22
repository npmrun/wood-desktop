import path from "path"
import * as rimraf from "rimraf"
import { rootPath } from "@buildin/share"

const resolvePath = (...argus: string[]) => {
    return path.resolve(rootPath, ...argus)
}

rimraf.sync(resolvePath("dist/electron"))
rimraf.sync(resolvePath("dist/scripts"))
rimraf.sync(resolvePath("dist/node_modules"))
rimraf.sync(resolvePath("dist/package-lock.json"))
