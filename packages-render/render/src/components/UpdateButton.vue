<template>
    <button class="button is-info content" @click="onCheck">{{ updater_text }}</button>
    <Dialog v-model:show="showDialog" width="50%" max-width="500px" min-width="320px">
        <div class="bg-light-50 rounded-4px w-full h-full flex flex-col min-h-[320px]">
            <div class="text-size-20px font-bold p-12px border-b flex items-center">
                <div class="flex-1 w-0">
                    提示
                </div>
                <button class="delete" @click="showDialog = false"></button>
            </div>
            <div class="text-size-16px p-12px flex-1">
                <p>您的设置尚未保存，请先确认</p>
                <p>您的设置尚未保存，请先确认</p>
                {{ showDialog2 }}
            </div>
            <div class="border-t flex !justify-end p-12px overflow-hidden">
                <div class="buttons">
                    <button class="button is-danger">重置</button>
                    <button class="button is-info" @click="showDialog2 = true">打开嵌套对话框</button>
                </div>
            </div>
        </div>
        <Dialog disabled v-model:show="showDialog2" width="50%" max-width="500px" min-width="120px">
            <div class="bg-light-50 rounded-4px w-full h-full flex flex-col min-h-[220px]">
                <div class="text-size-20px font-bold p-12px border-b flex items-center">
                    <div class="flex-1 w-0">
                        提示22
                    </div>
                    <button class="delete" @click="showDialog = false"></button>
                </div>
                <div class="text-size-16px p-12px flex-1">
                    <p>您的设置尚未保存，请先确认</p>
                </div>
                <div class="border-t flex !justify-end p-12px overflow-hidden">
                    <div class="buttons">
                        <button class="button is-danger">重置</button>
                        <button class="button is-info" @click="showDialog3 = true">打开嵌套对话框</button>
                    </div>
                </div>
            </div>
            <Dialog disabled v-model:show="showDialog3" width="50%" max-width="500px" min-width="120px">
                <div class="bg-light-50 rounded-4px w-full h-full flex flex-col min-h-[120px]">
                    <div class="text-size-20px font-bold p-12px border-b flex items-center">
                        <div class="flex-1 w-0">
                            提示22
                        </div>
                        <button class="delete" @click="showDialog = false"></button>
                    </div>
                    <div class="text-size-16px p-12px flex-1">
                        <p>您的设置尚未保存，请先确认</p>
                    </div>
                    <div class="border-t flex !justify-end p-12px overflow-hidden">
                        <div class="buttons">
                            <button class="button is-danger">重置</button>
                            <button class="button is-info">保存并跳转</button>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Dialog>
    </Dialog>
</template>

<script setup lang="ts">
import Dialog from "@/components/Dialog/Dialog.vue"

const showDialog = ref(false)
const showDialog2 = ref(false)
const showDialog3 = ref(false)

enum EStatus {
    normal,
    checking,
    waitForInstall
}
const updater_text = ref("检查更新")
const status = ref<EStatus>(EStatus.normal)
function onCheck() {
    showDialog.value = true
    if (status.value === EStatus.checking) return
    if (status.value === EStatus.normal) {
        _agent.send("updater:check")
    }
    if (status.value === EStatus.waitForInstall) {
        _agent.send("updater:quitandinstall")
    }
}
_agent.on("checking-for-update", ((_, res: any) => {
    updater_text.value = res.message
    status.value = EStatus.checking
}))
_agent.on("updater:error", ((_, res: any) => {
    updater_text.value = res.message
    status.value = EStatus.normal
}))
_agent.on("updater:avaliable", ((_, res: any) => {
    updater_text.value = res.message
    status.value = EStatus.checking
}))
_agent.on("updater:notavaliable", ((_, res: any) => {
    updater_text.value = res.message
    status.value = EStatus.normal
}))
_agent.on("updater:download_progress", ((_, res: any) => {
    updater_text.value = `当前下载进度${(+res.percent).toFixed(2)}%`
    status.value = EStatus.checking
}))
_agent.on("updater:downloaded", ((_, res: any) => {
    updater_text.value = res.message
    status.value = EStatus.waitForInstall
}))
</script>