import { toast } from "vue3-toastify"

export const useUpdateStore = defineStore("update", () => {
    const { t } = useI18n()

    const downloadPercent = ref(0)
    // const curVersion = ref(_agent.info.version)
    const updateInfo = ref<any>({})
    const nextVersion = ref()
    enum EUpdateStatus {
        IDLE = "IDLE",
        InitCheckingUpdate = "InitCheckingUpdate",
        CheckingUpdate = "CheckingUpdate",
        Error = "Error",
        Avaliable = "Avaliable",
        Notavaliable = "Notavaliable",
        Downloading = "Downloading",
        Downloaded = "Downloaded",
    }
    const UpdateStatus = computed(
        () =>
            ({
                [EUpdateStatus.IDLE]: "", //t("update.status.IDLE"),
                [EUpdateStatus.InitCheckingUpdate]: t("update.status.InitCheckingUpdate"),
                [EUpdateStatus.CheckingUpdate]: t("update.status.CheckingUpdate"),
                [EUpdateStatus.Error]: t("update.status.Error"),
                [EUpdateStatus.Avaliable]: t("update.status.Avaliable", { version: nextVersion.value }),
                [EUpdateStatus.Notavaliable]: t("update.status.Notavaliable", { version: nextVersion.value }),
                [EUpdateStatus.Downloading]: t("update.status.Downloading", { percent: downloadPercent.value }),
                [EUpdateStatus.Downloaded]: t("update.status.Downloaded"),
            }[curStatus.value]),
    )
    let curStatus = ref<EUpdateStatus>(EUpdateStatus.IDLE)

    function onCheck() {
        if ([EUpdateStatus.IDLE, EUpdateStatus.Error, EUpdateStatus.Notavaliable].includes(curStatus.value)) {
            _agent.send("updater:check")
            curStatus.value = EUpdateStatus.InitCheckingUpdate
            isUpdating.value = true
        }
    }

    const isUpdating = ref(false)

    _agent.on("checking-for-update", (_, res: any) => {
        curStatus.value = EUpdateStatus.CheckingUpdate
    })
    _agent.on("updater:error", (_, res: any) => {
        curStatus.value = EUpdateStatus.Error
        isUpdating.value = false
        toast.error(`更新出错：${res.data}, 点击打开更新日志`, {
            onClick() {
                _agent.call("openLogDir", "__update__.txt")
            },
        })
    })
    function resetUpdate(){
        if([EUpdateStatus.Avaliable, EUpdateStatus.Notavaliable, EUpdateStatus.Error].includes(curStatus.value)) {
            curStatus.value = EUpdateStatus.IDLE
            updateInfo.value = {}
        }
    }
    _agent.on("updater:avaliable", (_, res: any) => {
        curStatus.value = EUpdateStatus.Avaliable
        isUpdating.value = false
        nextVersion.value = res.data.version
        updateInfo.value = res.data
    })
    _agent.on("updater:notavaliable", (_, res: any) => {
        curStatus.value = EUpdateStatus.Notavaliable
        nextVersion.value = res.data.version
        isUpdating.value = false
        updateInfo.value = res.data
    })
    _agent.on("updater:download_progress", (_, res: any) => {
        downloadPercent.value = (+res.percent).toFixed(2) as any
        curStatus.value = EUpdateStatus.Downloading
    })
    _agent.on("updater:downloaded", (_, res: any) => {
        toast.success("新版本下载完成，准备安装")
        toast.success("点击查看安装包", {
            delay: 300,
            onClick(){
                _agent.call("utils.showItemInFolder", res.downloadedFile)
            }
        })
        curStatus.value = EUpdateStatus.Downloaded
    })
    _agent.on("updater:download_start", ()=> {
        downloadPercent.value = 0
        curStatus.value = EUpdateStatus.Downloading
        logger.debug("开始下载")
    })
    // onBeforeUnmount(() => {
    //     _agent.offAll("checking-for-update")
    //     _agent.offAll("updater:error")
    //     _agent.offAll("updater:avaliable")
    //     _agent.offAll("updater:notavaliable")
    //     _agent.offAll("updater:download_progress")
    //     _agent.offAll("updater:downloaded")
    // })

    function startDownload(){
        _agent.send("start-download")
    }

    function quitAndInstall(){
        if (curStatus.value === EUpdateStatus.Downloaded) {
            _agent.send("updater:quitandinstall")
        }
    }

    return {
        EUpdateStatus,
        isUpdating,
        resetUpdate,
        startDownload,
        onCheck,
        quitAndInstall,
        UpdateStatus,
        curStatus,
        downloadPercent,
        nextVersion,
        updateInfo,
    }
})
