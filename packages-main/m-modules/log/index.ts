import { app } from "electron";
import logger from "electron-log/main";
import path from "path";


logger.initialize({ preload: false })
export function initGlobalLog() {
    console.log("初始化Log");
     
    logger.transports.file.resolvePathFn = () => path.resolve(app.getPath("logs"), "__client__.txt")

    const loggerMain = logger.create({ logId: "main" })
    // @ts-ignore
    loggerMain.transports.file.resolvePathFn = () => path.resolve(app.getPath("logs"), "__main__.txt")

    global.logger = logger
    global.loggerMain = loggerMain
}
