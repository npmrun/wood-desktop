<script lang="ts" setup>
import { ENiuTreeStatus, INiuTreeData, INiuTreeKey, convert, findByKeyParent } from 'princess-ui';
import FileTree from "@/components/FileTree/FileTree.vue"
import { PopupMenu } from '@/bridge/PopupMenu';
import { v4 } from 'uuid';
import { useLoading } from "@/hooks/useLoading"
import { toast } from 'vue3-toastify';
import { useHomeContext } from '../_hook/Context';
import { findPath, findPathAll } from '@rush/common/utils/treeHelper';

const { LoadnigStatus, ELoadingStatus, isLoading } = useLoading()
const FileTreeRef = ref<InstanceType<typeof FileTree> | undefined>()

const { state } = useHomeContext()

onBeforeMount(() => {
    init()
})
function getTreeData() {
    return _agent.call("db.getData", "bookmark")
}
async function init() {
    try {
        // 读取文件信息并转换
        isLoading.value = true
        let stateData = localStorage.getItem("bookmark.state")
        logger.debug(stateData)
        if (stateData) {
            let data = JSON.parse(stateData)
            Object.assign(state, data)
        }
        const data = await getTreeData()
        if (data) {
            state.filetree = data
        }
        if(state.openKey){
            let nodes = findPath(state.filetree, (node)=>node.key === state.openKey)
            nodes?.forEach(node=>{
                if(state.openKey === node.key) return
                node.isFolder && (node.isExpand = true)
            })
        }  
    } catch (error) {
        console.error(error)
        toast.error("加载错误")
    }
    isLoading.value = false
}
watch(() => [state.isFocus, state.focusKey, state.openKey, state.activeKeys], () => {
    localStorage.setItem("bookmark.state", JSON.stringify({
        openKey: state.openKey,
        focusKey: state.focusKey,
        activeKeys: state.activeKeys,
        isFocus: state.isFocus,
    }))
})
function save() {
    const data = toRaw(state.filetree);
    console.log(data);
    return Promise.all([
        _agent.call("db.saveData", "bookmark", data),
    ])
}

defineExpose({
    save
})

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
    emit("clickNode", data)
}

function handleExpand(data: INiuTreeData) {
    save()
}

function handleChange() {
    try {
        save()
    } catch (error) {
        console.error(error);
        toast.error('保存出错')
    }
}

function handleGlobalContextmenu() {
    const menuList: IMenuItemOption[] = []
    menuList.push({
        label: "新建文件",
        click() {
            emit("newFile")
            // state.filetree?.push(
            //     convert({
            //         key: "",
            //         base: "",
            //         title: "",
            //         type: "file",
            //         order: 0,
            //         isNew: true,
            //         isEdit: true,
            //     } as any),
            // )
        },
    })
    menuList.push({
        label: "新建文件夹",
        click() {
            state.filetree?.push(
                convert({
                    key: "",
                    base: "",
                    title: "",
                    type: "folder",
                    order: 0,
                    isNew: true,
                    isEdit: true,
                    children: [],
                } as any),
            )
        },
    })

    const menu = new PopupMenu(menuList)
    menu.show()
}

const emit = defineEmits<{
    (ev: "newFile", data?: INiuTreeData): void
    (ev: "clickNode", data: INiuTreeData): void
    (ev: "contextMenuData", data: INiuTreeData): void
}>()

function handleContextMenu(data: INiuTreeData) {
    let menuList: IMenuItemOption[] = []
    if (data.isFile) {
        menuList.push({
            label: "修改",
            click() {
                emit("contextMenuData", data)
                // console.log(data);
                // data.data?.a
                // const path = findNodePath(data)
                // _agent.call("func.openDir", path)
            },
        })
    }
    if (data.isFolder) {
        menuList.push({
            type: "separator",
        })
        menuList.push({
            label: "新建文件",
            click() {
                emit("newFile", data)
                // data.isFolder && (data.isExpand = true)
                // data.children?.push(
                //     convert({
                //         key: "",
                //         base: "",
                //         title: "",
                //         type: "file",
                //         order: 0,
                //         isNew: true,
                //         isEdit: true,
                //     } as any),
                // )
            },
        })
        menuList.push({
            label: "新建文件夹",
            click() {
                data.isFolder && (data.isExpand = true)
                data.children?.push(
                    convert({
                        key: "",
                        base: "",
                        title: "",
                        type: "folder",
                        order: 0,
                        isNew: true,
                        isEdit: true,
                        children: [],
                    } as any),
                )
            },
        })
        menuList.push({
            label: "重命名",
            click() {
                data.isEdit = true
            },
        })
    }
    menuList.push({
        type: "separator",
    })
    menuList.push({
        label: "删除",
        click() {
            if (FileTreeRef.value) {
                FileTreeRef.value.delOne(data.key)
            }
        },
    })
    const menu = new PopupMenu(menuList)
    menu.show()
}

async function handleRename(data: INiuTreeData, done: (status?: boolean) => void) {
    done()
}

function handleCreateOne(data: INiuTreeData, parent: INiuTreeData, done: (status?: boolean) => void) {
    data.key = v4()
    done()
}


async function handleDropFn(type: ENiuTreeStatus, data: INiuTreeData, targetData: INiuTreeData) {
    console.log(type);

    return true
}

function handleDelOne(node: INiuTreeData, done: (canDel: boolean) => void) {
    done(true)
}
</script>

<template>
    <div class="h-full relative">
        <div class="absolute inset-0 z-999 flex items-center justify-center"
            v-show="LoadnigStatus === ELoadingStatus.loading">加载中</div>
        <div class="absolute inset-0 z-999" v-show="LoadnigStatus === ELoadingStatus.clientLoading"></div>
        <div class="h-full" @contextmenu="handleGlobalContextmenu">
            <FileTree ref="FileTreeRef" @contextmenu="handleContextMenu" @change="handleChange" @expand="handleExpand"
                @clickNode="handleClickNode" sort :list="state.filetree" v-model:activeKeys="state.activeKeys"
                v-model:openKey="state.openKey" v-model:focusKey="state.focusKey" @delOne="handleDelOne"
                v-model:isFocus="state.isFocus" :dropFn="handleDropFn" @rename="handleRename" @createOne="handleCreateOne">
                <!-- <template #default="{ data: { key, extra }, deep }"> -->
                    <!-- <div>{{ extra?.aaa }}</div> -->
                    <!-- <div>
                        {{ state.filetreeMap[key] }}-{{ deep }} - <button v-if="state.filetreeMap[key] !== undefined"
                            @click="handleAdd">handleAdd</button>
                    </div> -->
                <!-- </template> -->
            </FileTree>
            <div class="absolute inset-0 z-999 flex items-center justify-center text-2xl"
                v-show="state.filetree.length === 0 && !isLoading">空</div>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
