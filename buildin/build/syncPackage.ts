
import setting from "@buildin/config"
import { rootPath } from "@buildin/share/var"
import path from "path"
import fs from "fs-extra"

fs.ensureFileSync(path.resolve(rootPath, `./changelog/${setting.app_version}.md`))
const workInfo = fs.readJSONSync(path.resolve(rootPath, "./package.json"))

const pkgStr = {
    "name": setting.app_title,
    "description": setting.app_desc,
    "author": setting.app_author,
    "main": "./electron/entry.js",
    "dependencies": workInfo.dependencies,
    "version": setting.app_version
}

fs.writeJSONSync(path.resolve(rootPath, "dist/package.json"), pkgStr, {
    spaces: 4,
    EOL: '\n'
})