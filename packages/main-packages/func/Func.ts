import { isPromise } from "@rush/main-common/shared"
import { ipcMain } from "electron"
import { injectable } from "inversify"

@injectable()
export class Func {
    modelsFile: __WebpackModuleApi.RequireContext
    funcs: Record<string, Function> = {}

    constructor() {
        this.modelsFile = require.context("./func", true, /\.ts$/)
    }

    init() {
        const modelsFileKeys = this.modelsFile.keys()
        modelsFileKeys.forEach(key => {
            const res = this.modelsFile(key)
            const module = res.default || res
            if (key === "./index.ts") {
                this.funcs = Object.assign(this.funcs, module)
            } else {
                this.funcs[
                    key
                        .replace(/(\.\/|\.ts)/g, "")
                        .split("/")
                        .filter(v => v != "index")
                        .join("/")
                ] = module
            }
        })
    }

    parseCommand(command: string): Function | undefined {
        let commands = command.split(".")
        const modulePath = commands.slice(0, -1).join("/")
        let funcName = commands[commands.length - 1]
        const module = this.funcs[modulePath]
        let func
        if (module) {
            func = module[funcName]
        } else {
            func = this.funcs[funcName]
        }
        if (func) {
            const result = func.bind(module)
            if (typeof result === "function") {
                return result
            }
        }
    }

    initCommands() {
        ipcMain.addListener("command", (event, key, command: string, ...argus) => {
            try {
                let run = this.parseCommand(command)
                if (run) {
                    let result: Promise<any> | any = run(...argus)
                    if (isPromise(result)) {
                        result
                            .then((res: any) => {
                                console.log(command, `将要发送的数据`, res);
                                event.reply(key, null, res ?? null)
                                event.returnValue = res ?? null
                            })
                            .catch((err: Error) => {
                                console.log(command, `将要发送的数据`, null);
                                event.reply(key, err)
                                event.returnValue = null
                            })
                    } else {
                        console.log(command, `将要发送的数据`, result);
                        event.reply(key, null, result ?? null)
                        event.returnValue = result ?? null
                    }
                } else {
                    console.log(command, `将要发送的数据`, null);
                    event.reply(key, new Error("不存在该命令"))
                    event.returnValue = null
                }
            } catch (error) {
                console.log(command, `将要发送的数据`, null);
                event.reply(key, error)
                event.returnValue = null
            }
        })
    }

}