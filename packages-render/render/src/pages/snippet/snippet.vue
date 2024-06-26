<template>
    <div class="h-1/1 flex">
        <div class="h-1/1 w-250px min-w-100px relative" ref="LeftEl">
            <Left @change="onLeftChange" @create-snip="onCreateSnip" @clear-snip="onClearSnip" @del="onDel"
                @rename="onRename" @all="onAll" @drop-snip="onDropSnip">
            </Left>
            <niu-adjust-width mid="2" :target="LeftEl"></niu-adjust-width>
        </div>
        <div @contextmenu="handleSnipContextMenu"
            class="w-250px min-w-100px bg-light-400 scrollbar relative flex flex-col" ref="RightEl">
            <form action="#" class="flex items-center relative" @contextmenu.stop @submit.prevent>
                <div
                    class="flex-1 group m-8px p-5px border h-25px rounded-5px flex items-center bg-white overflow-hidden">
                    <input type="text" @keypress="" v-model="search" class="outline-0 h-1/1 flex-1 w-0">
                    <div @click="handleClear" v-if="!!search"
                        class="px-8px group-hover:block hidden cursor-pointer align-middle text-size-12px">x</div>
                </div>
                <button type="submit" class="h-25px px-5px" @click="handleSearch">搜索</button>
                <button class="h-25px px-5px mr-3px" @click="handleCreate">创建</button>
            </form>
            <div class="flex-1 h-0 overflow-y-auto scrollbar">
                <template v-for="(item, index) in snippetList" :key="index">
                    <div draggable="true" @click="handleClick(item)" @contextmenu.stop="handleContextMenu(item)"
                        @dragstart="onDragStart($event, item)" :class="[curSnip === item.key ? 'bg-light-800' : '']"
                        class="leading-25px px-5px py-5px border-b cursor-pointer overflow-x-hidden">
                        <div class="overflow-hidden whitespace-nowrap overflow-ellipsis">{{ item.title || "无标题" }}</div>
                        <div class="flex items-center text-size-12px text-gray-400">
                            <div class="flex-1">{{ item.fromText }}</div>
                        </div>
                    </div>
                </template>
            </div>
            <niu-adjust-width mid="1" :target="RightEl"></niu-adjust-width>
        </div>
        <div class="flex-grow relative w-0">
            <Right @save="onSave" :current-note="curSnipData"></Right>
        </div>
    </div>
</template>
<script lang="ts" setup>
// import Toastify from 'toastify-js'
import { PopupMenu } from "@/bridge/PopupMenu"
import { INiuTreeData, INiuTreeKey } from "princess-ui"
import { v4 } from "uuid"
import type { ISnip } from "./type"
import Left from "./_ui/left.vue"
import Right from "./_ui/right.vue"
import { throttle } from 'lodash'
import niuAdjustWidth from '@/components/AdjustLine/AdjustLine.vue'
import "princess-ui/theme-chalk/ps-tree.css"

function Toastify(...argu) {
    return {
        showToast() { }
    }
}

const LeftEl = ref()
const RightEl = ref()

function toast(text: string) {
    Toastify({
        text: text,
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
        }
    }).showToast();
}

const curSnip = ref<string>()
const curSnipData = computed(() => {
    if (!curSnip.value) {
        return
    }
    const data = snippetList.value.filter(v => v.key === curSnip.value)
    if (data && data.length) return data[0]
})
const snippetList = ref<ISnip[]>([])

const localData = localStorage.getItem("fuckSnip")
if (localData) {
    curSnip.value = localData
}

watch(
    () => curSnip.value,
    () => {
        if (curSnip.value) {
            localStorage.setItem("fuckSnip", curSnip.value)
        } else {
            localStorage.removeItem("fuckSnip")
        }
    },
    { immediate: true, deep: true },
)
// 节流
const func = throttle(async (data: ISnip) => {
    await _agent.call("sapi.snippet.snip.modify", data.key, data)
    snippetList.value.forEach(v => {
        if (v.key === data.key) {
            Object.assign(v, data)
        }
    })
}, 200)
async function onSave(data: ISnip) {
    func(toRaw(data))
}

function handleClick(item: ISnip) {
    curSnip.value = item.key
}

const search = ref('')
async function handleClear() {
    search.value = ''
    handleSearch()
}
async function handleSearch() {
    let key: any = ''
    if (openData.value) {
        key = openData.value.key
    }
    console.log(search.value);
    const res = await _agent.call("sapi.snippet.snip.readData", key, search.value)
    snippetList.value = res
}
async function handleCreate() {
    if (openData.value) {
        console.log(openData.value);
        const snip: ISnip = {
            key: v4(),
            title: "",
            activeFileIndex: 0,
            from: openData.value.key,
            fromText: openData.value.title,
            files: [],
        }
        await _agent.call("sapi.snippet.snip.add", snip)
        curSnip.value = snip.key
        snippetList.value.push(snip)
        count.value++
    }
}

const openData = ref<INiuTreeData>()
function handleSnipContextMenu() {
    const list: IMenuItemOption[] = [
        {
            label: "新建片段",
            async click() {
                if (openData.value) {
                    console.log(openData.value);
                    const snip: ISnip = {
                        key: v4(),
                        title: "",
                        activeFileIndex: 0,
                        from: openData.value.key,
                        fromText: openData.value.title,
                        files: [],
                    }
                    await _agent.call("sapi.snippet.snip.add", snip)
                    curSnip.value = snip.key
                    snippetList.value.push(snip)
                    count.value++
                }
            },
        },
        {
            label: "清空片段",
            async click() {
                const res = await _agent.call("dialog.confrim", { title: "是否清空？", message: "将删除其所有碎片" })
                if (res == 1) {
                    await _agent.call("sapi.snippet.snip.delByFrom", openData.value?.key)
                    snippetList.value = []
                    toast("笔记本已清空")
                    count.value++
                }
            },
        },
    ]
    const menus = new PopupMenu(list)
    menus.show()
}

function handleContextMenu(item: ISnip) {
    const list: IMenuItemOption[] = [
        {
            label: "删除",
            async click() {
                await _agent.call("sapi.snippet.snip.del", item.key)
                snippetList.value = snippetList.value.filter(v => v.key !== item.key)
                toast("删除片段成功")
                count.value++
            },
        },
        // {
        //     label: "清空片段",
        //     async click() {
        //         const res = await _agent.call("dialog.confrim", {title: "是否清空？", message: "将删除其所有碎片"})
        //         if(res==1){
        //             await _agent.call("sapi.snippet.snip.delByFrom", openData.value?.key)
        //             snippetList.value = []
        //             toast("笔记本已清空")
        //         }
        //     },
        // }
    ]
    const menus = new PopupMenu(list)
    menus.show()
}

function onAll(state: any) {
    state.openKey = undefined
    state.activeKeys = []
}

function onDel(keys: INiuTreeKey[], state: any) {
    if (keys.includes(state.openKey)) {
        snippetList.value = []
    } else {
        snippetList.value = snippetList.value.filter(v => !keys.includes(v.from))
    }
    count.value++
    toast("笔记本已清空并删除")
}

async function onRename(key: INiuTreeKey, title: string, state: any) {
    await _agent.call("sapi.snippet.snip.modifyByFrom", key, {
        fromText: title,
    })
    snippetList.value.forEach(v => {
        if (v.from === key) {
            v.fromText = title
        }
    })
}

function onDragStart(event: DragEvent, data: ISnip) {
    if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move"
        event.dataTransfer.effectAllowed = "move"
        event.dataTransfer.setData("data", JSON.stringify(data))
    }
}

async function onDropSnip(event: DragEvent, data: INiuTreeData, state: any) {
    const f = event.dataTransfer?.getData("data")
    if (f) {
        const d = JSON.parse(f)
        d.from = data.key
        d.fromText = data.title
        await _agent.call("sapi.snippet.snip.modify", d.key, d)
        snippetList.value.forEach(v => {
            if (v.key === d.key) {
                Object.assign(v, d)
            }
        })
        if (state.openKey != undefined && data.key !== state.openKey) {
            snippetList.value = snippetList.value.filter(v => v.key !== d.key)
        }
        count.value++
    }
}

async function onClearSnip(key: INiuTreeKey, data: INiuTreeData, state: any) {
    await _agent.call("sapi.snippet.snip.delByFrom", key)
    if (key === state.openKey) {
        snippetList.value = []
    }
    count.value++
    toast("笔记本已清空")
}
async function onCreateSnip(key: INiuTreeKey, data: INiuTreeData, state: any) {
    const k = v4()
    const snip: ISnip = {
        key: k,
        title: "",
        activeFileIndex: 0,
        from: data.key,
        fromText: data.title,
        files: [],
    }
    await _agent.call("sapi.snippet.snip.add", snip)
    state.openKey = key
    state.activeKeys = [key]
    curSnip.value = k
    snippetList.value.push(snip)
    count.value++
}
const count = ref(0)
provide("snippetList", count)
async function onLeftChange(key?: INiuTreeKey, data?: INiuTreeData) {
    openData.value = data
    const res = await _agent.call("sapi.snippet.snip.readData", key)
    snippetList.value = res
    if (curSnip.value && snippetList.value.length && !snippetList.value.map(v => v.key).includes(curSnip.value)) {
        curSnip.value = snippetList.value[0].key
    }
    count.value++
}
</script>
<style lang="scss" scoped>
.middle {
    background-color: #ebebeb7e;
}
</style>