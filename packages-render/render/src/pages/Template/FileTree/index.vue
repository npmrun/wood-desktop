<script lang="ts" setup>
import { convertTreeData, INiuTreeData, INiuTreeKey } from "princess-ui"
import FileTree from "./_components/FileTree/FileTree.vue"
import params from "./params.json"

defineOptions(params)

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
    console.log(33);

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

</script>
<template>
    <div class="h-full flex">
        <div class="min-w-200px max-w-300px w-1/4 border-r h-full">
            <FileTree @clickNode="handleClickNode" sort :list="state.filelist" v-model:activeKeys="state.activeKeys"
                v-model:openKey="state.openKey" v-model:focusKey="state.focusKey" v-model:isFocus="state.isFocus">
                <template #default="{ data: { isFolder, title, key }, deep }">
                    <div>
                        {{ state.treeMap[key] }}
                    </div>
                </template>
            </FileTree>
        </div>
        <div>
            <button class="button" @click="handleAdd">Add</button>
        </div>
    </div>
</template>

