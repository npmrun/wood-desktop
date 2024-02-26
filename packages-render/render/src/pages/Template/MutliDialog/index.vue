<script lang="ts" setup>
import Dialog from "./_components/Dialog/Dialog.vue"

defineOptions({
    url: "/Template/MutliDialog",
    title: "嵌套对话框"
})

const showDialog = ref(false)
const showDialog2 = ref(false)
const showDialog3 = ref(false)
</script>

<template>
    <button class="button is-info content" @click="showDialog = true">打开对话框</button>
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
            </div>
            <div class="border-t flex !justify-end p-12px overflow-hidden">
                <div class="buttons">
                    <button class="button is-danger">重置</button>
                    <button class="button is-info" @click="showDialog2 = true">打开嵌套对话框</button>
                </div>
            </div>
        </div>
        <Dialog v-model:show="showDialog2" width="50%" max-width="500px" min-width="120px">
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
            <Dialog v-model:show="showDialog3" width="50%" max-width="500px" min-width="120px">
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

<style lang="scss" scoped></style>
