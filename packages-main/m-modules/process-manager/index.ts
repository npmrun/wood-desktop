import { ChildProcess } from "child_process"
import { checkCommand } from "./checkCommands"
import { forkFn, execa } from "./execa"
import { app } from "electron"
import kill, { killPID } from "./kill"
import { broadcast } from "@rush/main-tool"

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

    create(command: string, isLazy = false) {
        let task = new ProcessTask(command, isLazy)
        this.#processTasks.push(task)
    }
}

class ProcessTask {
    pid?: number
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

    isRunning() {
        switch (this.status) {
            case EProcessStatus.Starting:
            case EProcessStatus.Running:
            case EProcessStatus.Stopping:
                return true
            case EProcessStatus.Normal:
            case EProcessStatus.Exit:
                return false
            default:
                return false
        }
    }

    isProcessRunning() {
        return this.instance?.exitCode === null ?? false
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

    run() {
        if (!this.execCommand) return
        if (this.isRunning()) return
        const { cmd: execCommand, argu: args, isFile } = this.execCommand
        let exec = isFile ? forkFn : execa

        this.status = EProcessStatus.Starting
        let instance = exec(execCommand, args, (err, data, isComplete) => {
            broadcast("process-msg", this.command, data, isComplete ? data : undefined)
            if (isComplete) {
                this.status = EProcessStatus.Exit
                // this.log.push(`${data}`)
                this.checkDeath()
                return
            }
            if (err) {
                this.log.push(err)
            } else {
                this.log.push(data)
            }
        }, {}, app.getAppPath())

        instance.on("spawn", () => {
            this.status = EProcessStatus.Running
        })
        this.instance = instance
        this.pid = instance.pid
        broadcast("process-start", this.pid)
    }

    kill() {
        if (!this.instance) return
        this.status = EProcessStatus.Stopping
        let isKilled = this.instance.kill()
        if (!isKilled) {
            kill(this.instance)
        }
        this.status = EProcessStatus.Exit
        this.checkDeath()
    }

    checkDeath() {
        if (!this.instance) return
        if (this.isRunning()) return
        if (!this.isProcessRunning()) return
        let isKilled = this.instance.kill()
        if (!isKilled) {
            kill(this.instance)
        }
    }
}