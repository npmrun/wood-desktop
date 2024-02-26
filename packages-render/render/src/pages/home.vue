<template>
    <div class="h-full flex">
        <div class="min-w-200px max-w-300px w-1/4">
            <FileTree @clickNode="handleClickNode" sort :list="state.filelist" v-model:activeKeys="state.activeKeys"
                v-model:openKey="state.openKey" v-model:focusKey="state.focusKey" v-model:isFocus="state.isFocus">
                <template #default="{ data: { isFolder, title, key }, deep }">
                    <div>
                        {{ state.treeMap[key] }}-{{ deep }}
                    </div>
                </template>
            </FileTree>
            <div class="buttons">
                <button class="button is-primary is-light">Primary</button>
                <button class="button is-link is-light">Link</button>
            </div>
            <div class="buttons">
                <button class="button is-primary">Primary</button>
                <button class="button is-link">Link</button>
            </div>
            <button class="button" @click="handleAdd">Add</button>
            <button class="button" @click="handleClick">创建</button>
            <div>
                {{ configStore.language }}
            </div>
        </div>
        <Browser class="border-l flex-1" home="我的首页" :hide="[]" @leftmenu="handleClickLeftMenu"></Browser>
    </div>
</template>

<route lang="yaml">
name: home
meta:
    cache: false
</route>

<script setup lang="ts">
import { convertTreeData, INiuTreeData, INiuTreeKey } from "princess-ui"
import Browser from "@/components/Browser/browser.vue"
import FileTree from "@/components/FileTree/FileTree.vue"

defineOptions({
    name: "home"
})

const state = reactive<{
    filelist: any[]
    openKey?: INiuTreeKey
    focusKey?: INiuTreeKey
    activeKeys: INiuTreeKey[]
    isFocus?: boolean
    treeMap: any
}>({
    openKey: undefined,
    focusKey: undefined,
    activeKeys: [],
    isFocus: undefined,
    treeMap: {},
    filelist: convertTreeData([
        {
            key: 1,
            title: "aaa",
            children: [
                {
                    key: 5,
                    title: "5文件夹",
                    children: [
                        {
                            key: 2,
                            title: "ccc"
                        },
                        {
                            key: 3,
                            title: "bbb"
                        },
                    ]
                },
            ]
        },
        {
            key: 6,
            title: "basdbb"
        },
    ])
})
state.treeMap[6] = 0
function handleAdd() {
    state.treeMap[6]++
}
const control = useKeyModifier("Control")
function handleClickNode(data: INiuTreeData) {
    if (control.value) {
        state.activeKeys.push(data.key)
        return
    }
    if (data.isFolder) {
        data.isExpand = !data.isExpand
    }
    state.openKey = data.key
    state.activeKeys = [data.key]
}

function handleClick() {
    _agent.call("createWindow", {
        windowOpts: {
            title: "加载中",
            // icon: "https://bulma.io/favicons/apple-touch-icon.png"
        },
        denyWindowOpen: false,
        url: "https://baidu.com",
        confrimWindowCloseText: {
            title: "退出",
            defaultId: 0,
            cancelId: 0,
            message: "你要退出百度吗？",
            buttons: ["没事", "直接退出"]
        },
    })
}

const configStore = useConfigStore()
console.log(configStore);

// const state = reactive<{
//     collectList: any
//     showSideMenu: boolean
//     curWebviewUrl: string
// }>({
//     collectList: [],
//     showSideMenu: false,
//     curWebviewUrl: "file:///D:/1XYX/pro/ene-desktop/extra/home.html"
// })

// const browserRef = ref<InstanceType<typeof Browser>>()

// function handleToPage(url: string) {
//     browserRef.value?.loadURL(url)
// }

function handleClickLeftMenu() {
    console.log("handleClickLeftMenu");
}
</script>