import { app } from "electron";
import type Logger from "electron-log";
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
        // 可记录nodejs的报错
        // https://github.com/search?q=repo%3Agetsentry%2Fsentry-electron%20process.on&type=code
        console.log(`Log位置：`+app.getPath("logs"))

        const mainLog = logger.scope('main');

        logger.transports.file.resolvePathFn = (variables: Logger.PathVariables, message?: Logger.LogMessage) => {
            if(message.scope === "preload" || message.scope === "client"){
                return path.resolve(app.getPath("logs"), "__client__.txt")
            }
            return path.resolve(app.getPath("logs"), "__global__.txt")
        }
        global.logger = mainLog
    }
}