import { platform } from "@rush/main-tool"
import { ChildProcess, execSync } from "child_process"
import { spawn } from "child_process"
// import * as iconv from "iconv-lite"

export default function kill(process: ChildProcess | null, callback?: (err?: any, data?: any, isComplete?: boolean) => void) {
    if (!process) return
    const pid = process.pid
    let myProcess
    if (platform === "Linux") {
        console.log("kill -9 " + pid)
        myProcess = spawn("kill", ["-9", String(pid)])
    }
    if (platform === "MacOS") {
        console.log("kill -9 " + pid)
        myProcess = spawn("kill", ["-9", String(pid)])
    }
    if (platform === "windows") {
        console.log("TASKKILL /F /T /PID " + pid)
        myProcess = spawn("TASKKIll", ["/F", "/T", "/PID", String(pid)])
    }
    myProcess.stdout.on("data", data => {
        callback && callback(null, `${data}`)
    })
    myProcess.on("error", err => {
        callback && callback(`${err}`)
    })
    myProcess.stderr.on("data", data => {
        // callback && callback(`${iconv.decode(data, "gbk")}`)
        callback && callback(`${data}`)
    })

    myProcess.on("close", code => {
        callback && callback(null, `${code}`, true)
    })
}

export function killPID(pid: string, callback?: (err?: any, data?: any, isComplete?: boolean) => void) {
    if (!pid) return
    let myProcess
    if (platform === "Linux") {
        console.log("kill -9 " + pid)
        myProcess = spawn("kill", ["-9", String(pid)])
    }
    if (platform === "MacOS") {
        console.log("kill -9 " + pid)
        myProcess = spawn("kill", ["-9", String(pid)])
    }
    if (platform === "windows") {
        console.log("TASKKILL /F /T /PID " + pid)
        myProcess = spawn("TASKKIll", ["/F", "/T", "/PID", String(pid)])
    }
    myProcess.stdout.on("data", data => {
        callback && callback(null, `${data}`)
    })
    myProcess.on("error", err => {
        callback && callback(`${err}`)
    })
    myProcess.stderr.on("data", data => {
        // callback && callback(`${iconv.decode(data, "gbk")}`)
        callback && callback(`${data}`)
    })

    myProcess.on("close", code => {
        callback && callback(null, `${code}`, true)
    })
}