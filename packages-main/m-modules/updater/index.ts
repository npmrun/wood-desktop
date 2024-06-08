import { ipcMain, app } from "electron"
import { NsisUpdater, ProgressInfo, UpdateInfo } from "electron-updater"
import { Settings } from "@rush/main-config"
import { broadcast } from "@rush/main-tool"

const enableDevUpdate = true // 开发时是否启用更新用来测试

class _UpdaterManage {
    private constructor() {}
    static instance: null | _UpdaterManage = null
    static getInstance() {
        if (_UpdaterManage.instance == null) {
            _UpdaterManage.instance = new _UpdaterManage()
        }
        return _UpdaterManage.instance
    }

    autoUpdater: NsisUpdater

    updateInfo: ConstructorParameters<typeof NsisUpdater>[0]

    getUpdateInfo() {
        this.updateInfo = {
            provider: "github",
            owner: Settings.values("update.owner"),
            repo: Settings.values("update.repo"),
        }
    }

    init() {
        const log = logger.scope("single:update")

        this.getUpdateInfo()

        if (this.autoUpdater) {
            return
        }

        Settings.onChange("update.owner", ()=>{
            this.getUpdateInfo()
            this.autoUpdater.setFeedURL(this.updateInfo)
        })
        Settings.onChange("update.repo", ()=>{
            this.getUpdateInfo()
            this.autoUpdater.setFeedURL(this.updateInfo)
        })
        
        this.autoUpdater = new NsisUpdater(this.updateInfo)
        this.autoUpdater.autoDownload = false // 不自动下载
        this.autoUpdater.forceDevUpdateConfig = enableDevUpdate
        let autoUpdater = this.autoUpdater
        autoUpdater.fullChangelog = true

        autoUpdater.logger = log
        // 开始检查更新
        autoUpdater.on("checking-for-update", () => {
            logger.error("开始检查更新")
            broadcast("checking-for-update")
        })

        // 检查更新出错
        autoUpdater.on("error", (err) => {
            logger.error("检查更新出错", err.message)
            broadcast("updater:error", {
                data: err.message
            })
        })

        // 检查到新版本
        autoUpdater.on("update-available", (info: UpdateInfo) => {
            log.debug(`检查到新版本 v ${info.version}`, "新版本信息为:", info)
            broadcast("updater:avaliable", {
                data: info
            })
        })

        // 已经是新版本
        autoUpdater.on("update-not-available", (info: UpdateInfo) => {
            log.debug("当前更新不可用")
            log.debug("当前版本信息为:", info)
            broadcast("updater:notavaliable", {
                data: info
            })
        })

        // 更新下载中
        autoUpdater.on("download-progress", (info: ProgressInfo) => {
            log.debug("当前下载进度:", info.percent)
            broadcast("updater:download_progress", {
                percent: info.percent
            })
        })

        // 更新下载完毕
        autoUpdater.on("update-downloaded", () => {
            log.debug("新版本下载完毕,点击安装")
            broadcast("updater:downloaded")
        })
        ipcMain.on("start-download", async () => {
            log.debug("开始下载")
            const p = await this.autoUpdater.downloadUpdate()
            broadcast("updater:download_start", {
                path: p
            })
        })
        // 立即更新
        ipcMain.on("updater:quitandinstall", () => {
            autoUpdater.quitAndInstall()
        })

        ipcMain.on("updater:check", () => {
            log.debug("初始化检查更新")
            broadcast("checking-for-update")
            this.update()
        })
        this.update()
    }

    async update() {
        this.autoUpdater.checkForUpdatesAndNotify()
    }
}

export const UpdaterManage = _UpdaterManage.getInstance()
export default UpdaterManage