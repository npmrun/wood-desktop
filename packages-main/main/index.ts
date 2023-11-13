import "reflect-metadata"
import { initGlobal } from "./global"

import { app } from "electron"

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
    app.exit()
} else {
    initGlobal()
}
