import { ChildProcess } from "child_process"
import { checkCommand } from "./checkCommands"
import { forkFn, execa } from "./execa"
import { app } from "electron"
import kill, { killPID } from "./kill"
import { broadcast } from "@rush/main-tool"
import { nextTick } from "process"
import { EventEmitter } from "events"

export enum EProcessStatus {
    Normal = "normal",
    Starting = "starting",
    Running = "running",
    Stopping = "stoping",
    Exit = "exit",
}

export default class ProcessManager {
    #processTasks: ProcessTask[] = []
    private constructor() { }
    static instance: null | ProcessManager = null
    static getInstance() {
        if (ProcessManager.instance == null) {
            ProcessManager.instance = new ProcessManager()
        }
        return ProcessManager.instance
    }

    // 创建进程
    create(command: string, isLazy = false) {
        let task = new ProcessTask(command, isLazy)
        task.event.on("*", () => {
            this.emit()
        })
        this.#processTasks.push(task)
    }

    emit() {
        this.refresh()
        broadcast("process-list", this.#processTasks.map(v => {
            return {
                pid: v.pid,
                status: v.status,
                command: v.command,
                log: v.log,
            }
        }))
    }

    // 刷新进程列表
    refresh() {
        const array = this.#processTasks
        for (let i = array.length - 1; i >= 0; i--) {
            const process = array[i]
            process.refresh()
            if (process.status === EProcessStatus.Exit || process.status === EProcessStatus.Normal) {
                process.event.removeAllListeners()
                this.#processTasks.splice(i, 1)
            }
        }
    }

    // 强制杀死进程
    forceKillByPid(pid: number) {
        const process = this.#processTasks.find(v => {
            if (v.isProcessRunning()) {
                return v.pid == pid
            }
        })
        if (process) {
            process.forceKill()
        }
    }

    // 杀死进程
    killByPid(pid: number) {
        const process = this.#processTasks.find(v => {
            if (v.isProcessRunning()) {
                return v.pid == pid
            }
        })
        if (process) {
            process.kill()
        }
    }
}

class ProcessTask {
    pid?: number
    event = new EventEmitter()
    command: string
    execCommand: {
        cmd: string
        isFile: boolean
        argu: string[]
    }
    status: EProcessStatus = EProcessStatus.Normal
    log: string[] = []
    instance: null | ChildProcess = null
    constructor(command, isLazy = false) {
        this.command = command
        this.#init()
        if (!isLazy) {
            this.run()
        }
    }

    isProcessRunning() {
        // https://wenku.csdn.net/answer/84c1b0fd72804cff90d5b882fde49dc3
        if (this.pid) {
            try {
                process.kill(this.pid, 0)
                return true
            } catch (error) {
                return false
            }
        }
        return false
        // return this.instance?.exitCode === null ?? false
    }

    #init() {
        const commandArray = this.command.split(" ")
        let execCommand = checkCommand(commandArray[0])
        let isFile = !!execCommand
        let args = commandArray.slice(1)

        this.execCommand = {
            cmd: isFile ? execCommand : commandArray[0],
            isFile,
            argu: args,
        }
    }

    refresh() {
        if (this.status === EProcessStatus.Starting) return
        if (this.status === EProcessStatus.Stopping) return
        if (this.isProcessRunning()) {
            this.status = EProcessStatus.Running
        } else if (this.status !== EProcessStatus.Normal) {
            this.status = EProcessStatus.Exit
        }
    }

    run() {
        if (this.pid) return
        if (this.status === EProcessStatus.Starting) return
        if (this.status === EProcessStatus.Stopping) return
        if (!this.execCommand) return
        if (this.isProcessRunning()) return
        const { cmd: execCommand, argu: args, isFile } = this.execCommand
        let exec = isFile ? forkFn : execa

        this.status = EProcessStatus.Starting
        this.event.emit(this.status)
        this.event.emit("*")
        let instance = exec(execCommand, args, (err, data, isComplete) => {
            if (isComplete) {
                this.status = EProcessStatus.Exit
                this.event.emit(this.status)
                this.event.emit("*")
                broadcast("process-msg", this.command, `已结束进程：${this.command}\n`, isComplete ? instance.exitCode : undefined)
                return
            }
            broadcast("process-msg", this.command, err || data, isComplete ? instance.exitCode : undefined)
            if (err) {
                this.log.push(err)
            } else {
                this.log.push(data)
            }
        }, {}, app.getAppPath())

        instance.on("spawn", () => {
            this.status = EProcessStatus.Running
            this.event.emit(this.status)
            this.event.emit("*")
        })
        this.instance = instance
        this.pid = instance.pid
        broadcast("process-start", this.pid)
    }

    kill(force?: boolean) {
        if (!force && this.status === EProcessStatus.Starting) return
        if (!force && this.status === EProcessStatus.Stopping) return
        if (!this.instance) return
        if (!this.isProcessRunning()) return
        this.status = EProcessStatus.Stopping
        this.event.emit(this.status)
        this.event.emit("*")
        this.instance.kill()
    }

    // 强制杀死
    forceKill() {
        if (!this.instance) return
        if (!this.isProcessRunning()) return
        this.status = EProcessStatus.Stopping
        this.event.emit(this.status)
        this.event.emit("*")
        kill(this.instance)
    }
}