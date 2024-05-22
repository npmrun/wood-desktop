<template>
    <button class="button is-info" :disabled="isUpdating" @click="onCheck"> {{ isUpdating ? "正在检查更新" : "检查更新"}} </button>
    <div class="mt-1">{{ UpdateStatus }}</div>
    <Dialog disabled v-model:show="showDialog">
        <div class="bg-light-50 rounded-4px flex flex-col m-4">
            <div class="text-size-20px font-bold p-12px border-b flex items-center">
                <div v-if="EUpdateStatus.Avaliable === curStatus" class="flex-1 w-0">更新提示</div>
                <div v-if="EUpdateStatus.Notavaliable === curStatus" class="flex-1 w-0">已经是最新版本</div>
                <button class="delete" @click="showDialog = false"></button>
            </div>
            <div class="text-size-16px p-12px flex-1 flex flex-col">
                <p>版本 v{{ updateInfo.version }} 的更新信息为:</p>
                <p class="p-5 text-size-14px">{{ updateInfo.releaseNotes }}</p>
                <div><button class="button is-light" @click="showDetail = !showDetail">查看详细信息</button></div>
                <p v-if="showDetail" class="overflow-auto flex-1 h-0 mt-2 max-h-[450px]">
                    <pre>{{ updateInfo }}</pre>
                </p>
            </div>
            <div class="border-t flex items-center !justify-end p-12px overflow-hidden gap-x-5" v-if="[EUpdateStatus.Avaliable].includes(curStatus)">
                <progress v-if="[EUpdateStatus.Downloading, EUpdateStatus.Downloaded].includes(curStatus)" class="progress is-primary" style="margin-bottom: 0;" :value="downloadPercent" max="100">
                    {{ downloadPercent }}%
                </progress>
                <div class="buttons">
                    <button class="button is-success">下载</button>
                </div>
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { toast } from "vue3-toastify"

const showDialog = ref(false)
const showDetail = ref(false)

const { t } = useI18n()

const downloadPercent = ref(0)
// const curVersion = ref(_agent.info.version)
const updateInfo = ref()
const nextVersion = ref()
const enum EUpdateStatus {
    IDLE,
    InitCheckingUpdate,
    CheckingUpdate,
    Error,
    Avaliable,
    Notavaliable,
    Downloading,
    Downloaded,
}
const UpdateStatus = computed(
    () =>
        ({
            [EUpdateStatus.IDLE]: "",//t("update.status.IDLE"),
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
    if (
        [
            EUpdateStatus.InitCheckingUpdate,
            EUpdateStatus.CheckingUpdate,
            EUpdateStatus.Avaliable,
            EUpdateStatus.Downloading,
        ].includes(curStatus.value)
    ) {
        toast.warn("正在更新，请稍后")
        return
    }
    if ([EUpdateStatus.IDLE, EUpdateStatus.Error, EUpdateStatus.Notavaliable].includes(curStatus.value)) {
        _agent.send("updater:check")
        curStatus.value = EUpdateStatus.InitCheckingUpdate
    }
    if (curStatus.value === EUpdateStatus.Downloaded) {
        _agent.send("updater:quitandinstall")
    }
}

const isUpdating = computed(()=>{
    return [
            EUpdateStatus.InitCheckingUpdate,
            EUpdateStatus.CheckingUpdate,
            EUpdateStatus.Avaliable,
            EUpdateStatus.Downloading,
        ].includes(curStatus.value)
})

_agent.on("checking-for-update", (_, res: any) => {
    curStatus.value = EUpdateStatus.CheckingUpdate
})
_agent.on("updater:error", (_, res: any) => {
    curStatus.value = EUpdateStatus.Error
    toast.error(`更新出错：${res.data}, 点击打开更新日志`, {
        onClick() {
            _agent.call("openLogDir", "__update__.txt")
        },
    })
})
_agent.on("updater:avaliable", (_, res: any) => {
    curStatus.value = EUpdateStatus.Avaliable
    nextVersion.value = res.data.version
    updateInfo.value = res.data
    showDialog.value = true
})
_agent.on("updater:notavaliable", (_, res: any) => {
    curStatus.value = EUpdateStatus.Notavaliable
    nextVersion.value = res.data.version
    updateInfo.value = res.data
    showDialog.value = true
})
_agent.on("updater:download_progress", (_, res: any) => {
    downloadPercent.value = (+res.percent).toFixed(2) as any
    curStatus.value = EUpdateStatus.Downloading
})
_agent.on("updater:downloaded", (_, res: any) => {
    curStatus.value = EUpdateStatus.Downloaded
})

onBeforeUnmount(() => {
    _agent.offAll("checking-for-update")
    _agent.offAll("updater:error")
    _agent.offAll("updater:avaliable")
    _agent.offAll("updater:notavaliable")
    _agent.offAll("updater:download_progress")
    _agent.offAll("updater:downloaded")
})
</script>
