<template>
    <div class="h-full flex">
        <div class="min-w-200px max-w-300px w-1/4">
            <Left @newFile="handleNewFile" ref="leftRef" @clickNode="handleClickNode"
                @contextMenuData="handleContextMenuData"></Left>
        </div>
        <!-- {{ curTime?.toString() }} -->
        <Browser @collect="handleCollect" @webinfo="handleGetWebInfo" ref="browserRef" class="border-l flex-1" home="我的首页" :hide="[]"
            @leftmenu="handleClickLeftMenu"></Browser>
        <Dialog v-model:show="dialogState.show">
            <div class="bg-light-50 rounded-4px min-w-350px max-w-550px">
                <div class="text-size-20px font-bold p-12px border-b flex items-center">
                    <div class="flex-1 w-0">
                        {{ dialogState.isEdit ? "修改" : "新增" }}
                    </div>
                    <button class="delete" @click="dialogState.show = false"></button>
                </div>
                <div class="text-size-16px p-12px min-h-80px">
                    <div class="field">
                        <label class="label">标题</label>
                        <div class="control">
                            <input v-focus v-model="dialogState.formData.title" class="input" type="text" placeholder="Text input">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label">图标</label>
                        <div class="control">
                            <input v-model="dialogState.formData.favicon" class="input" type="text" placeholder="Text input">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label">链接</label>
                        <div class="control">
                            <input v-model="dialogState.formData.url" class="input" type="text" placeholder="Text input">
                        </div>
                    </div>
                </div>
                <div class="buttons border-t flex !justify-end p-12px">
                    <!-- <button class="button is-danger !mb-0" @click="syncFavicon">同步favicon</button> -->
                    <button class="button is-info !mb-0" @click="save">保存</button>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<route lang="yaml">
name: home
meta:
    cache: false
</route>

<script setup lang="ts">
import Left from "./_ui/left.vue"
import { createHomeContext, IHomeData, useHomeContext } from "./_hook/Context"
import Browser from "@/components/Browser/browser.vue"
import Dialog from "@/components/Dialog/Dialog.vue"
import { convert, findByKey, INiuTreeData } from "princess-ui";
import { toast } from "vue3-toastify";
import { assign, cloneDeep } from "lodash";
import { v4 } from "uuid";

defineOptions({
    name: "home"
})

// const { curTime} = useTime({autoRun: true})

const vFocus = {
  mounted: (el: HTMLInputElement) => el.focus()
}

const leftRef = ref<InstanceType<typeof Left>>()
const initDialogStateFormData = {
    title: "",
    favicon: "",
    url: ""
}
const dialogState = reactive<IHomeData['dialogState']>({
    show: false,
    isEdit: false,
    tempData: undefined,
    formData: cloneDeep(initDialogStateFormData),
    resetFormData() {
        dialogState.formData = assign(dialogState.formData, cloneDeep(initDialogStateFormData))
    }
})

const state = reactive<IHomeData['state']>({
    openKey: undefined,
    focusKey: undefined,
    activeKeys: [],
    isFocus: undefined,
    filetreeMap: {},
    filetree: []
})

createHomeContext({ state, dialogState })

function handleNewFile(data: INiuTreeData) {
    console.log(data);
    dialogState.resetFormData()
    dialogState.show = true
    dialogState.isEdit = false
    dialogState.tempData = data
}

function handleClickNode(data: INiuTreeData) {
    if (data && data.key && data.isFile) {
        let node = findByKey(data.key, state.filetree)
        if (node && node.isFile) {
            if (node.data?.url) {
                browserRef.value?.loadURL(node.data.url)
            }
        }
    }
}

async function save() {
    if(!dialogState.formData.title){
        toast.error("请填写标题")
        return
    }
    if (dialogState.isEdit) {
        let tempData = dialogState.tempData
        if (tempData) {
            let node = findByKey(tempData.key, state.filetree)
            if (node) {
                if (!node.data) {
                    node.data = {}
                }
                node.title = dialogState.formData.title
                node.data.url = dialogState.formData.url
                node.data.favicon = dialogState.formData.favicon
            }
        }
    } else {
        let tempData = dialogState.tempData
        if (tempData) {
            let node = findByKey(tempData.key, state.filetree)
            if (node) {
                node.isFolder && (node.isExpand = true)
                node.children?.push(
                    convert({
                        key: v4(),
                        title: dialogState.formData.title,
                        type: "file",
                        data: {
                            url: dialogState.formData.url,
                            favicon: dialogState.formData.favicon
                        },
                    } as any),
                )
            }
        } else {
            state.filetree?.push(
                convert({
                    key: v4(),
                    title: dialogState.formData.title,
                    type: "file",
                    data: {
                        url: dialogState.formData.url,
                        favicon: dialogState.formData.favicon,
                    },
                } as any),
            )
        }
    }
    if (leftRef.value) {
        try {
            await leftRef.value.save()
            dialogState.show = false
            dialogState.tempData = undefined
        } catch (error) {
            console.error(error);
            toast.error("保存失败")
        }
    }
}

function handleCollect(url: string) {
    const webinfo = browserRef.value?.getWebInfo()
    dialogState.resetFormData()
    dialogState.show = true
    dialogState.isEdit = false
    dialogState.formData.url = url
    if(webinfo?.title){
        dialogState.formData.title = webinfo.title
    }
    if(webinfo?.favicon){
        dialogState.formData.favicon = webinfo.favicon
    }
    if(state.openKey){
        let node = findByKey(state.openKey, state.filetree)
        if(node?.isFolder){
            dialogState.tempData = node
        }
    }
}

function handleContextMenuData(data: INiuTreeData) {
    dialogState.resetFormData()
    dialogState.show = true
    dialogState.isEdit = true
    dialogState.tempData = data
    dialogState.formData.title = data.title
    if (data.data) {
        dialogState.formData.url = data.data.url
        dialogState.formData.favicon = data.data.favicon
    }
}

async function handleGetWebInfo(webinfo: any, curUrl: string) {
    console.log(webinfo);
    if (state.openKey && webinfo && webinfo.favicon) {
        let node = findByKey(state.openKey, state.filetree)
        if (node?.data?.url) {
            let url = node?.data?.url
            if (url === curUrl) {
                node.data.favicon = webinfo.favicon
                await leftRef.value?.save()
            }
        }
        console.log(node);
    }
}

// function handleClick() {
//     _agent.call("createWindow", {
//         windowOpts: {
//             title: "加载中"
//         },
//         denyWindowOpen: false,
//         url: "https://baidu.com",
//         confrimWindowCloseText: {
//             title: "退出",
//             defaultId: 0,
//             cancelId: 0,
//             message: "你要退出百度吗？",
//             buttons: ["没事", "直接退出"]
//         },
//     })
// }

const configStore = useConfigStore()
console.log(configStore);

// const browserState = reactive<{
//     collectList: any
//     showSideMenu: boolean
//     curWebviewUrl: string
// }>({
//     collectList: [],
//     showSideMenu: false,
//     curWebviewUrl: "file:///D:/1XYX/pro/ene-desktop/extra/home.html"
// })

const browserRef = ref<InstanceType<typeof Browser>>()

// function handleToPage(url: string) {
//     browserRef.value?.loadURL(url)
// }

function handleClickLeftMenu() {
    console.log("handleClickLeftMenu");
}
</script>