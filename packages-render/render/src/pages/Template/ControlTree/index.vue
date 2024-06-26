<script lang="ts" setup>
import { PopupMenu } from "@/bridge/PopupMenu"
import FileTree from "./_components/FileTree/FileTree.vue"
import { findNode, findPath } from "@rush/common/utils/treeHelper"
import { INiuTreeKey, convert, findByKeyParent, ENiuTreeStatus } from "princess-ui"
import { INiuTreeData, convertTreeData } from "princess-ui"
import CodeEditor from "./_components/CodeEditor/code-editor.vue"
import MdEditor from "./_components/MdEditor/MdEditor.vue"
import AdjustLine from "@/components/AdjustLine/AdjustLine.vue"
import { toast } from "vue3-toastify"
import Preview from "./_components/Preview/Preview.vue"
import params from "./params.json"

defineOptions(params)

const ppp: any = {
    viewerEffect({ markdownBody }: any) {

        const links = markdownBody.querySelectorAll("a")
        links.forEach((link: any) => {
            link.setAttribute('target', '_blank');
        });
    }
}

const previewRef = ref<InstanceType<typeof Preview>>()

const configStore = useConfigStore()
const state = reactive<{
    showURL?: string
    rootDir?: string
    curFile?: string
    content: string
    fileData: any[]
    openKey?: INiuTreeKey
    focusKey?: INiuTreeKey
    activeKeys: INiuTreeKey[]
    isFocus?: boolean
}>({
    showURL: undefined,
    rootDir: undefined, //_agent.file.replacePath(configStore.storagePath),
    curFile: undefined,
    content: "",
    fileData: [],
    openKey: undefined,
    focusKey: undefined,
    activeKeys: [],
    isFocus: undefined,
})

const activeNode = computed(() => {
    return findNode(state.fileData, n => {
        return n.key === state.openKey
    })
})

function listenFileChange(_: any, ev: any) {
    // 从任意文件名修改为aaa.这个文件名的话不会有create事件
    console.log(ev)
    const array = ev as { path: string; type: string }[]

    if (array.length === 2) {
        // 在这可以判断是否是修改名字
    }

    for (let i = 0; i < array.length; i++) {
        const temp = array[i]
        temp.path = _agent.file.replacePath(temp.path)
        switch (temp.type) {
            case "delete": {
                let node = findNode(state.fileData, node => {
                    return findNodePath(node) == temp.path
                })
                if (node) {
                    let parentNode = findByKeyParent(node.key, state.fileData)
                    if (parentNode) {
                        parentNode.children = parentNode.children?.filter(t => {
                            return t.key !== node.key
                        })
                    } else if (state.fileData.find(t => t.key === node.key)) {
                        state.fileData = state.fileData?.filter(t => {
                            return t.key !== node.key
                        })
                    }
                    if (state.openKey === node.key) {
                        state.openKey = undefined
                    }
                    let index = state.activeKeys.indexOf(node.key)
                    if (index !== -1) {
                        state.activeKeys.splice(index)
                    }
                }
                break
            }
            case "create": {
                let pPath = temp.path.split("/").slice(0, -1).join("/")
                let childFiles =
                    (_agent.file.isDirectory(temp.path)
                        ? _agent.file.readFolderToTree(temp.path).children
                        : undefined) ?? []
                if (state.rootDir === pPath) {
                    let key = _agent.file.realpathSync(temp.path, "hex")
                    state.fileData.push(
                        convert({
                            key: key,
                            title: temp.path.split("/").slice(-1).join(""),
                            // @ts-ignore
                            base: temp.path.split("/").slice(-1).join(""),
                            // @ts-ignore
                            type: _agent.file.isDirectory(temp.path) ? "folder" : "file",
                            children: _agent.file.isDirectory(temp.path) ? childFiles : undefined,
                        }),
                    )
                    // state.openKey = key
                    // state.activeKeys = [key]
                } else {
                    let pNode = findNode(state.fileData, node => {
                        return findNodePath(node) == pPath
                    })
                    if (pNode) {
                        let key = _agent.file.realpathSync(temp.path, "hex")
                        pNode.children?.push(
                            convert({
                                key: key,
                                title: temp.path.split("/").slice(-1).join(""),
                                // @ts-ignore
                                base: temp.path.split("/").slice(-1).join(""),
                                // @ts-ignore
                                type: _agent.file.isDirectory(temp.path) ? "folder" : "file",
                                children: _agent.file.isDirectory(temp.path) ? childFiles : undefined,
                            }),
                        )
                        // state.openKey = key
                        // state.activeKeys = [key]
                    }
                }
                break
            }
            case "update": {
                let node = findNode(state.fileData, node => {
                    return findNodePath(node) == temp.path
                })

                if (node && node.key === state.openKey) {
                    console.log(temp.path)
                    state.content = _agent.file.readFileSync(temp.path)
                }
                break
            }
            default:
                console.warn("未知操作:", ev)
                break
        }
    }
}

let stopWatch: Function
watch(
    () => state.openKey,
    () => {
        try {
            if (state.openKey) {
                let node = findNode(state.fileData, node => {
                    return node.key === state.openKey
                })
                if (node && node.isFile) {
                    stopWatch?.()
                    state.curFile = findNodePath(node)
                    state.content = _agent.file.readFileSync(state.curFile)
                    stopWatch = watch(
                        () => state.content,
                        () => {
                            try {
                                if (
                                    state.curFile &&
                                    _agent.file.existsSync(state.curFile) &&
                                    !_agent.file.isDirectory(state.curFile)
                                ) {
                                    console.log("成功写入", state.curFile)
                                    _agent.file.writeFileSync(state.curFile, state.content)
                                    if (
                                        (state.curFile.endsWith(".html") || state.curFile.endsWith(".css")) &&
                                        state.showURL
                                    ) {
                                        previewRef.value?.update()
                                    }
                                }
                            } catch (error: any) {
                                toast.error(`保存错误：${error}`)
                            }
                        },
                    )
                }
            } else {
                state.curFile = undefined
            }
        } catch (error) {
            toast.error(`打开错误：${error}`)
        }
    },
    { immediate: true },
)

async function initDir() {
    if (!state.rootDir) return
    if (!_agent.file.isDirectory(state.rootDir)) throw new Error("将要打开的目录不是文件夹:" + state.rootDir)
    state.fileData = convertTreeData(_agent.file.readFolderToTree(state.rootDir).children)
    await _agent.call("filetree.init", state.rootDir)
    console.log("initDir", state.rootDir)
    _agent.file.saveOpenFile(state.rootDir)
}

async function dispose() {
    if (!state.rootDir) return
    await _agent.call("filetree.dispose", state.rootDir)
    console.log("dispose", state.rootDir)
}

onBeforeMount(async () => {
    console.log("onBeforeMount")
    let str = _agent.file.loadOpenFile()
    if (str) {
        state.rootDir = str
    }
    await initDir()
    _agent.on("filetree-update-message", listenFileChange)
})
onBeforeUnmount(async () => {
    console.log("onBeforeUnmount")
    await dispose()
    _agent.offAll("filetree-update-message")
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
}

function findNodePath(data: INiuTreeData) {
    let array =
        findPath(state.fileData, node => {
            return data.key === node.key
        }) ?? []
    const path = state.rootDir + "/" + array.map((v: any) => v.base).join("/")
    return path
}
const filetreeRef = ref<InstanceType<typeof FileTree>>()
function handleContextmenu(data: INiuTreeData) {
    const menuList: IMenuItemOption[] = []
    if (data.isFile) {
        menuList.push({
            label: "默认程序打开",
            click() {
                const path = findNodePath(data)
                _agent.call("func.openDir", path)
            },
        })
    }
    if (data.isFolder) {
        menuList.push({
            label: "操作本目录",
            async click() {
                const path = findNodePath(data)
                await dispose()
                state.rootDir = _agent.file.replacePath(path)
                await initDir()
            },
        })
    }
    menuList.push({
        label: "打开所在文件夹",
        click() {
            const path = findNodePath(data)
            _agent.call("func.showItemInFolder", path)
        },
    })
    menuList.push({
        type: "separator",
    })
    if (data.isFile) {
        menuList.push({
            label: "复制",
            click() {
                const path = findNodePath(data)
                _agent.call("copyFile", path)
            },
        })
    }
    menuList.push({
        label: "重命名",
        click() {
            data.isEdit = true
        },
    })
    menuList.push({
        label: "删除",
        async click() {
            const answer = await _agent.call("dialog.confrim", { title: "是否删除", message: "是否删除？" })
            if (answer) {
                let path = findNodePath(data)
                if (_agent.file.existsSync(path)) {
                    _agent.file.rm(path)
                }
            }
        },
    })
    if (state.activeKeys.length > 1) {
        menuList.push({
            label: "删除所有",
            async click() {
                const answer = await _agent.call("dialog.confrim", { title: "是否删除所有", message: "是否删除所有？" })
                if (answer) {
                    for (let i = 0; i < state.activeKeys.length; i++) {
                        const key = state.activeKeys[i]
                        let node = findNode(state.fileData, node => {
                            return node.key === key
                        })
                        if (node) {
                            let path = findNodePath(node)
                            if (path && _agent.file.existsSync(path)) {
                                _agent.file.rm(path)
                            }
                        }
                    }
                }
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
                data.isFolder && (data.isExpand = true)
                data.children?.push(
                    convert({
                        key: "",
                        base: "",
                        title: "",
                        type: "file",
                        order: 0,
                        isNew: true,
                        isEdit: true,
                    } as any),
                )
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
    }
    const menu = new PopupMenu(menuList)
    menu.show()
}
function handleGlobalContextmenu() {
    if (!state.rootDir) return
    const menuList: IMenuItemOption[] = []
    menuList.push({
        label: "关闭文件夹",
        async click() {
            await dispose()
            Object.assign(state, {
                showURL: undefined,
                rootDir: undefined, //_agent.file.replacePath(configStore.storagePath),
                curFile: undefined,
                content: "",
                fileData: [],
                openKey: undefined,
                focusKey: undefined,
                activeKeys: [],
                isFocus: undefined,
            })
        },
    })
    menuList.push({
        type: "separator",
    })
    menuList.push({
        label: "切换文件夹打开",
        async click() {
            handleChooseDir()
        },
    })
    menuList.push({
        label: "操作父级目录",
        async click() {
            if (state.rootDir) {
                await dispose()
                state.rootDir = state.rootDir.split("/").slice(0, -1).join("/")
                await initDir()
            }
        },
    })
    menuList.push({
        label: "打开所在的文件夹",
        click() {
            _agent.call("func.openDir", _agent.file.normalizePath(state.rootDir))
        },
    })
    menuList.push({
        label: "新建文件",
        click() {
            state.fileData?.push(
                convert({
                    key: "",
                    base: "",
                    title: "",
                    type: "file",
                    order: 0,
                    isNew: true,
                    isEdit: true,
                } as any),
            )
        },
    })
    menuList.push({
        label: "新建文件夹",
        click() {
            state.fileData?.push(
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
async function handleCreateOne(data: INiuTreeData, parent: INiuTreeData, done: (status?: boolean) => void) {
    try {
        let p = findNodePath(data)
        const pPath = p.split("/").slice(0, -1).join("/")
        let newPath = pPath + "/" + data.title
        // @ts-ignore
        if (data.type === "file") {
            _agent.file.createFileSync(newPath)
        }
        // @ts-ignore
        if (data.type === "folder") {
            _agent.file.mkdirSync(newPath)
        }
        done(false)
    } catch (error) {
        console.error(error)
        done(false)
    }
}
async function handleRename(data: INiuTreeData, done: (status?: boolean) => void) {
    let p = findNodePath(data)
    const pPath = p.split("/").slice(0, -1).join("/")
    // @ts-ignore
    let oldPath = pPath + "/" + data.base
    let newPath = pPath + "/" + data.title
    try {
        await _agent.file.renameFile(oldPath, newPath)
        let isSuccess = _agent.file.existsSync(newPath)
        done(isSuccess)
    } catch (error) {
        console.error(error)
        done(false)
    }
}

async function handleDropFn(type: ENiuTreeStatus, data: INiuTreeData, targetData: INiuTreeData) {
    if (type !== ENiuTreeStatus.DragInner && type !== ENiuTreeStatus.DragIn) return false
    if (targetData?.children?.find(node => node.key === data.key)) {
        toast.warn("一样的地方拖着干啥？")
        return false
    }
    if (targetData === undefined && state.fileData.find(node => node.key === data.key)) {
        toast.warn("一样的地方拖着干啥？")
        return false
    }
    // TODO 拖动多个文件
    if (data.key && targetData && targetData.key) {
        let srcPath = findNodePath(data)
        let destPath = findNodePath(targetData) + "/" + data.title
        _agent.file.moveSync(srcPath, destPath)
        return false
    } else if (data.key && targetData === undefined) {
        let srcPath = findNodePath(data)
        let destPath = state.rootDir + "/" + data.title
        _agent.file.moveSync(srcPath, destPath)
        return false
    }
    return false
}

function toggleShowWeb(node: INiuTreeData) {
    if (state.showURL) {
        state.showURL = undefined
    } else {
        let p = findNodePath(node)
        state.showURL = _agent.file.pathToFileURL(p)
    }
}

async function handleChooseDir() {
    const p = await _agent.callLong("dialog.chooseDir", "选择文件夹", configStore.storagePath)
    if (p) {
        await dispose()
        state.rootDir = _agent.file.replacePath(p)
        await initDir()
    }
}

_agent.on("process.run", (_, data) => {
    console.log(data);
})
_agent.on("event:process", (_, { key, message, status }) => {
    console.log(key, status);
    console.log(message);
})
</script>

<template>
    <div class="flex h-1/1 filetree">
        <div class="w-300px flex-shrink-0 relative border-r flex flex-col">
            <div class="flex-1 h-0" @contextmenu="handleGlobalContextmenu">
                <div class="text-center pt-25px mx-12px overflow-hidden" v-if="!state.rootDir">
                    <button @click="handleChooseDir" class="button">打开一个文件夹</button>
                </div>
                <FileTree v-if="state.rootDir" ref="filetreeRef" @contextmenu="handleContextmenu" sort
                    :list="state.fileData" v-model:activeKeys="state.activeKeys" v-model:openKey="state.openKey"
                    v-model:focusKey="state.focusKey" v-model:isFocus="state.isFocus" @clickNode="handleClickNode"
                    @rename="handleRename" @createOne="handleCreateOne" :dropFn="handleDropFn">
                    <template #default="{ data: { data } }">
                        <!-- 未保存 -->
                    </template>
                </FileTree>
            </div>
            <div class="flex-shrink-0 border-t p-6px relative text-center bg-white">
                <!-- <span class="text-red-300" @click="handleExtra">可以放点快捷的目录来点击打开</span>
                <span class="text-red-300" @click="handleExtraaa">11111111111</span> -->
                <AdjustLine mid="filetree-demo-left" direction="top"></AdjustLine>
            </div>
            <AdjustLine mid="filetree-demo-left" direction="right"></AdjustLine>
        </div>
        <div class="flex-1 w-0 flex flex-col h-1/1">
            <div class="flex-shrink-0 p-16px border-b"
                v-if="(activeNode && activeNode.title.endsWith('.html')) || !!state.showURL">
                <button @click="toggleShowWeb(activeNode)" v-if="state.showURL" class="button is-primary">
                    取消展示
                </button>
                <button v-else @click="toggleShowWeb(activeNode)" class="button">展示网页</button>
            </div>
            <div class="flex-1 h-0">
                <template v-if="activeNode && activeNode.isFile">
                    <!-- View没有样式，需要自己引入 -->
                    <MdEditor style="height:100%" :modelValue="state.content"
                        @update:modelValue="(v: string) => state.content = v" v-if="activeNode.title.endsWith('.md')">
                    </MdEditor>
                    <img crossorigin="anonymous" v-else-if="activeNode.title.endsWith('.png')" :src="activeNode.path"
                        alt="">
                    <!-- <img crossorigin="anonymous" v-else-if="activeNode.title.endsWith('.png')" :src="activeNode.path" alt=""> -->
                    <CodeEditor v-else v-model="state.content" :key="activeNode.key" :name="activeNode.title as any"
                        :logo="configStore['editor.bg']"></CodeEditor>
                </template>
            </div>
        </div>
        <div v-if="state.showURL" class="relative border-l">
            <Preview ref="previewRef" class="h-1/1" type="browser" :src="state.showURL"></Preview>
            <AdjustLine mid="filetree-demo-right" direction="left"></AdjustLine>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.filetree {
    :deep(.bytemd) {
        height: 100%;
        user-select: text;
    }
}
</style>
