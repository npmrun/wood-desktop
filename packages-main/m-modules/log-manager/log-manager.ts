import { app } from "electron";
import logger from "electron-log/main";
import path from "path";

logger.initialize({ preload: false })
export default class LogManager {
    private constructor() { }
    static instance: null | LogManager = null
    static getInstance() {
        if (LogManager.instance == null) {
            LogManager.instance = new LogManager()
        }
        return LogManager.instance
    }

    init() {
        logger.transports.file.resolvePathFn = () => path.resolve(app.getPath("logs"), "__client__.txt")

        const loggerMain = logger.create({ logId: "main" })
        // @ts-ignore
        loggerMain.transports.file.resolvePathFn = () => path.resolve(app.getPath("logs"), "__main__.txt")

        global.logger = logger
        global.loggerMain = loggerMain
    }
}