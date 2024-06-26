
import { execa } from "@/utils"
import { join } from "path"
import { Debug, Error } from "@/utils/log"
import { ChildProcess } from "child_process"
import config from "@/config"
export default function run() {
    return new Promise<ChildProcess>((resolve, reject) => {
        const viteProcess = execa(
            "node",
            [config.rootViteCMD, "-c", config.rootViteConfig],
            (err: any, data: any, isComplete?: boolean) => {
                if (isComplete) {
                    resolve(viteProcess)
                    return
                }
                if (err != null) {
                    Error("vite", err)
                }else{
                    Debug("vite", data)
                    if (data.includes("ready")) {
                        resolve(viteProcess)
                    }
                }
            },
            undefined,
            config.rootClientMD // 指定cwd为客户端开发目录
        )
    })
}