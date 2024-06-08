import fs from "fs-extra"
import { app } from "electron"
import path from "path"
import setting from "@buildin/config"
import { cloneDeep, replace } from "lodash"
// import { injectable } from "inversify"

type IOnFunc = (n: IConfig, c: IConfig, keys?:(keyof IConfig)[]) => void
type IT = (keyof IConfig)[] | keyof IConfig | "_"

let storagePath = path.join(app.getPath("documents"), setting.app_title)
let storagePathDev = path.join(app.getPath("documents"), setting.app_title + "-dev")

if (process.env.NODE_ENV === "development") {
    storagePath = storagePathDev
}

let _tempConfig = cloneDeep(setting.default_config as IConfig)
Object.keys(_tempConfig).forEach(key => {
    if (typeof _tempConfig[key] === "string" && _tempConfig[key].includes("$storagePath$")) {
        _tempConfig[key] = _tempConfig[key].replace(/\$storagePath\$/g, storagePath)
        if (_tempConfig[key] && path.isAbsolute(_tempConfig[key])) {
            _tempConfig[key] = path.normalize(_tempConfig[key])
        }
    }
})

const defaultConfig: IConfig = cloneDeep(_tempConfig)

function init(config: IConfig) {
    // 在配置初始化后执行
    Object.keys(config).forEach(key => {
        if (config[key] && path.isAbsolute(config[key])) {
            fs.ensureDirSync(config[key])
        }
    })
    // 在配置初始化后执行
    // fs.ensureDirSync(config["snippet.storagePath"])
    // fs.ensureDirSync(config["bookmark.storagePath"])
}

// 判断是否是空文件夹
function isEmptyDir(fPath: string) {
    var pa = fs.readdirSync(fPath)
    if (pa.length === 0) {
        return true
    } else {
        return false
    }
}

class _Settings {
    private constructor() { }
    static instance: null | _Settings = null
    static getInstance() {
        if (_Settings.instance == null) {
            _Settings.instance = new _Settings()
        }
        return _Settings.instance
    }

    #cb: [IT, IOnFunc][] = []

    onChange(fn: IOnFunc, that?: any)
    onChange(key: IT, fn: IOnFunc, that?: any)
    onChange(fnOrType: IT | IOnFunc, fnOrThat: IOnFunc | any = null, that: any = null) {
        if (typeof fnOrType === "function") {
            this.#cb.push(["_", fnOrType.bind(fnOrThat)])
        } else {
            this.#cb.push([fnOrType, fnOrThat.bind(that)])
        }
    }

    #runCB(n: IConfig, c: IConfig, keys: (keyof IConfig)[]) {
        for (let i = 0; i < this.#cb.length; i++) {
            const temp = this.#cb[i]
            const k = temp[0]
            const fn = temp[1]
            if (k === "_") {
                fn(n, c, keys)
            }
            if (typeof k === "string" && keys.includes(k as keyof IConfig)) {
                fn(n, c)
            }
            if (Array.isArray(k) && k.filter(v => keys.indexOf(v) !== -1).length) {
                fn(n, c)
            }
        }
    }

    #pathFile: string = process.env.NODE_ENV === "development" ? path.resolve(app.getPath("userData"), "./config_path-dev") : path.resolve(app.getPath("userData"), "./config_path")
    #config: IConfig = defaultConfig
    #configPath(storagePath?: string): string {
        return path.join(storagePath || this.#config.storagePath, "./config.json")
    }
    /**
     * 读取配置文件变量同步
     * @param confingPath 配置文件路径
     */
    #syncVar(confingPath?: string) {
        const configFile = this.#configPath(confingPath)
        if (!fs.pathExistsSync(configFile)) {
            fs.ensureFileSync(configFile)
            fs.writeJSONSync(configFile, {})
        }
        const config = fs.readJSONSync(configFile) as IConfig
        confingPath && (config.storagePath = confingPath)
        // 优先取本地的值
        for (const key in config) {
            // if (Object.prototype.hasOwnProperty.call(this.#config, key)) {
            //     this.#config[key] = config[key] || this.#config[key]
            // }
            // 删除配置时本地的配置不会改变，想一下哪种方式更好
            this.#config[key] = config[key] || this.#config[key]
        }
    }
    init() {
        console.log(`位置：${this.#pathFile}`)
        if (fs.pathExistsSync(this.#pathFile)) {
            const confingPath = fs.readFileSync(this.#pathFile, { encoding: "utf8" })
            if (confingPath && fs.pathExistsSync(this.#configPath(confingPath))) {
                this.#syncVar(confingPath)
                // 防止增加了配置本地却没变的情况
                this.#sync(confingPath)
            } else {
                this.#syncVar(confingPath)
                this.#sync(confingPath)
            }
        } else {
            this.#syncVar()
            this.#sync()
        }
        init.call(this, this.#config)
    }
    config() {
        return this.#config
    }
    #sync(c?: string) {
        const config = cloneDeep(this.#config)
        delete config.storagePath
        const p = this.#configPath(c)
        fs.ensureFileSync(p)
        fs.writeJSONSync(this.#configPath(c), config)
    }
    #change(p: string) {
        const storagePath = this.#config.storagePath
        if (fs.existsSync(storagePath) && !fs.existsSync(p)) {
            fs.moveSync(storagePath, p)
        }
        if (fs.existsSync(p) && fs.existsSync(storagePath) && isEmptyDir(p)) {
            console.log("文件夹为空，直接覆盖")
            fs.moveSync(storagePath, p, { overwrite: true })
        }
        fs.writeFileSync(this.#pathFile, p, { encoding: "utf8" })
    }
    reset(key: keyof IConfig){
        this.set(key, cloneDeep(_tempConfig[key]))
    }
    set(key: keyof IConfig | Partial<IConfig>, value?: any) {
        let oldMainConfig = Object.assign({}, this.#config)
        let isChange = false
        let changeKeys: (keyof IConfig)[] = []
        let canChangeStorage = (targetPath: string) => {
            if (fs.existsSync(oldMainConfig.storagePath) && fs.existsSync(targetPath) && !isEmptyDir(targetPath)) {
                if (fs.existsSync(path.join(targetPath, "./config.json"))) {
                    return true
                }
                return false
            }
            return true
        }
        if (typeof key === "string") {
            if (value != undefined && value !== this.#config[key]) {
                if (key === "storagePath") {
                    if (!canChangeStorage(value)) {
                        throw "无法改变存储地址"
                        return
                    }
                    try {
                        this.#change(value)
                    } catch (error) {
                        throw error
                    }
                    changeKeys.push("storagePath")
                    this.#config["storagePath"] = value
                } else {
                    changeKeys.push(key)
                    this.#config[key as string] = value
                }
                isChange = true
            }
        } else {
            if (key['storagePath'] !== undefined && key['storagePath'] !== this.#config['storagePath']) {
                if (!canChangeStorage(key['storagePath'])) {
                    throw "无法改变存储地址"
                    return
                }
                try {
                    this.#change(key['storagePath'])
                } catch (error) {
                    throw error
                }
                this.#config['storagePath'] = key['storagePath']
                changeKeys.push('storagePath')
                isChange = true
            }
            for (const _ in key) {
                if (Object.prototype.hasOwnProperty.call(key, _)) {
                    const v = key[_]
                    if (v != undefined && _ !== "storagePath" && v !== this.#config[_]) {
                        this.#config[_] = v
                        changeKeys.push(_ as keyof IConfig)
                        isChange = true
                    }
                }
            }
        }
        if (isChange) {
            this.#sync()
            this.#runCB(this.#config, oldMainConfig, changeKeys)
        }
    }
    values(key: keyof IConfig) {
        return this.#config[key]
    }
}

export const Settings = _Settings.getInstance()