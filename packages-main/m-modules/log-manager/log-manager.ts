import { app } from "electron";
import type Logger from "electron-log";
import logger from "electron-log/main";
import { formatDate } from "@rush/common/utils/date";
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

        logger.transports.file.level = 'debug'
        logger.transports.file.maxSize = 10024300 // 文件最大不超过 10M
        // logger.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}'
        let dateStr = formatDate(new Date(), "yyyy_MM_dd_HH") //_mm_ss_S
        logger.transports.file.resolvePathFn = (variables: Logger.PathVariables, message?: Logger.LogMessage) => {
            if(message.scope === "preload" || message.scope === "client"){
                return path.resolve(app.getPath("logs"), `./${dateStr}/__client__.txt`)
            }
            if(message.scope && message.scope.startsWith("single:")){
                message.scope = message.scope.replace(/^single\:/, "")
                return path.resolve(app.getPath("logs"), `./${dateStr}/__${message.scope}__.txt`)
            }
            return path.resolve(app.getPath("logs"), `./${dateStr}/__global__.txt`)
        }
        // @ts-ignore
        logger.$$date = dateStr
        // const mainLog = logger.scope('main');
        global.logger = logger
    }
}