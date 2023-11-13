// import { spawn } from "cross-spawn"
import { spawn } from "child_process"
// import * as iconv from "iconv-lite"
import { URL } from "url"
import { fork } from "child_process"
import {npmRunPathEnv} from 'npm-run-path';

// cwd不存在或者不是一个目录时的话会导致报错
export function execa(
    command: string,
    argu?: string[],
    callback?: (err?: any, data?: any, isComplete?: boolean) => void,
    env?: {},
    cwd?: string | URL
) {
    let myProcess = spawn(command, argu, {
        // https://www.jianshu.com/p/d4d7cf170e79
        shell: process.platform === 'win32', // 仅在当前运行环境为 Windows 时，才使用 shell
        stdio: "pipe",
        env: npmRunPathEnv(),
        // env: env,
        cwd
    })
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
    return myProcess
}

export function forkFn(
    file: string,
    argu?: string[],
    callback?: (err?: any, data?: any, isComplete?: boolean) => void,
    env?: {},
    cwd?: string | URL
) {
    let myProcess = fork(file, argu, {
        stdio: "pipe",
        env: npmRunPathEnv(),
        cwd
    })
    myProcess?.stdout?.on("data", data => {
        callback && callback(null, `${data}`)
    })
    myProcess.on("error", err => {
        callback && callback(`${err}`)
    })
    myProcess?.stderr?.on("data", data => {
        callback && callback(`${data}`)
    })

    myProcess.on("close", code => {
        callback && callback(null, `${code}`, true)
    })
    return myProcess
}
