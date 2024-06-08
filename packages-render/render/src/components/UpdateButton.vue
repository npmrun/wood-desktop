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
            <div class="border-t flex items-center !justify-end p-12px overflow-hidden gap-x-5" v-if="[EUpdateStatus.Downloading, EUpdateStatus.Downloaded, EUpdateStatus.Avaliable].includes(curStatus)">
                <progress v-if="[EUpdateStatus.Downloading, EUpdateStatus.Downloaded].includes(curStatus)" class="progress is-primary" style="margin-bottom: 0;" :value="downloadPercent" max="100">
                    {{ downloadPercent }}%
                </progress>
                <div v-if="[EUpdateStatus.Downloaded].includes(curStatus)" class="buttons" @click="quitAndInstall">
                    <button class="button is-success">安装</button>
                </div>
                <div v-if="[EUpdateStatus.Avaliable].includes(curStatus)" class="buttons" @click="startDownload">
                    <button class="button is-success">下载</button>
                </div>
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">

const updateStore = useUpdateStore()
const { onCheck, EUpdateStatus, startDownload, quitAndInstall } = updateStore
const { updateInfo, isUpdating, UpdateStatus, downloadPercent, curStatus } = storeToRefs(updateStore)
const showDialog = ref(false)
const showDetail = ref(false)
console.log(curStatus);

watchEffect(()=>{
    if ([EUpdateStatus.Avaliable, EUpdateStatus.Notavaliable].includes(curStatus.value)) {
        showDialog.value = true
    }
})
</script>
