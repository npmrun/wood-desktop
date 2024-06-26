<script lang="ts" setup>
import parse from 'url-parse';
import { PopupMenu } from '@/bridge/PopupMenu'

const props = withDefaults(defineProps<{
    collect?: boolean,
    copyAll?: boolean,
    home?: string
    hide?: ("collect" | "clean" | "open" | "devtool" | "menu" | "left-menu")[]
    url?: string
}>(), {
    collect: false,
    copyAll: false,
    hide: () => ["left-menu"],
    url: '我的首页'
})

const emits = defineEmits<{
    (ev: "leftmenu"): void
    (ev: "collect", url: string): void
    (ev: "load-page", url: string): void
    (ev: "webinfo", websiteInfo: typeof state['websiteInfo'],url: string): void
}>()

const matchCustomUrl = {
    "我的首页": _agent.getStaticHtml("home")
}

const matchInternalUrl = {
    "403": _agent.getStaticHtml("403"),
    "404": _agent.getStaticHtml("404")
}

function getURL(url: string) {
    if (matchCustomUrl[url as "我的首页"]) {
        url = matchCustomUrl[url as "我的首页"]
    }
    return url
}

// 这个内部加载会有问题，点击刷新的时候刷新的不是顶部的网址而是这个内部链接了。因此内部链接可能弃用，暂时放这里
// function internalLoad(page: keyof typeof matchInternalUrl) {
//     let realUrl = matchInternalUrl[page]
//     state.curUrl = realUrl
//     state.curWebviewUrl = realUrl
//     webviewRef.value?.loadURL(realUrl)
// }

const webviewRef = ref<WebviewTag>()
const state = reactive<{
    tempUrl: string,
    curUrl: string,
    curWebviewUrl: string,
    canGoBack: boolean,
    canGoForward: boolean,
    isLoading: boolean,
    isLoadingWebsiteInfo: boolean,
    devtoolsIsOpen: boolean,
    webContentsId: number,
    websiteInfo?: any,
}>({
    tempUrl: props.url,
    curUrl: getURL(props.url),
    curWebviewUrl: getURL(props.url),
    canGoBack: false,
    canGoForward: false,
    isLoading: false,
    isLoadingWebsiteInfo: false,
    devtoolsIsOpen: false,
    webContentsId: -1,
    websiteInfo: undefined,
})

onBeforeUnmount(() => {
    _agent.call("webview.destoryWebview", state.webContentsId)
})
let isReady = false
let peddingFn: Function[] = []
function toPage(url: string) {
    const to = ()=>{
        let page = getURL(url)
        if (webviewRef.value?.isLoading()) {
            webviewRef.value?.stop()
        }
        if (parse(state.curUrl).toString() !== parse(page).toString()) {
            state.curUrl = page
        } else if (parse(page).toString() !== parse(state.curWebviewUrl).toString()) {
            webviewRef.value?.loadURL(page)
        }
    }
    if(!isReady) {
        peddingFn.push(to)
    } else {
        to()
    }
}

onMounted(() => {
    const we = webviewRef.value
    if (we) {
        // let isFirstLoad = true
        we.addEventListener("dom-ready", (ev) => {
            console.log(`耗时:${ev.timeStamp}ms`);
            let curWebContentsId = we.getWebContentsId()
            if (curWebContentsId !== state.webContentsId) {
                state.webContentsId = curWebContentsId
                _agent.call("webview.preventWebview", state.webContentsId)
            }
            isReady = true
            if(!!peddingFn.length) {
                peddingFn.forEach(cb=>cb())
                peddingFn = []
            }
        })
        function updateInfo() {
            if (we) {
                state.canGoBack = we.canGoBack()
                state.canGoForward = we.canGoForward()
                console.log(we.getURL());
                let url = decodeURIComponent(we.getURL())
                state.curWebviewUrl = decodeURIComponent(we.getURL())
                emits("load-page", state.curWebviewUrl)
                let have = false
                // 路径相同时只展示对应的文字路径，主要看跳转以及前进返回的顶部路径是否正确，这是比较妥协的办法。
                for (const key in matchCustomUrl) {
                    if (Object.prototype.hasOwnProperty.call(matchCustomUrl, key)) {
                        const element = matchCustomUrl[key as keyof typeof matchCustomUrl];
                        if (encodeURIComponent(element) === encodeURIComponent(url)) {
                            state.tempUrl = key
                            have = true
                        }
                    }
                }
                if (!have) {
                    state.tempUrl = url
                }
            }
        }
        we.addEventListener("did-navigate-in-page", () => {
            // 内部导航，可用于局部更新的网址更新
            updateInfo()
        })
        we.addEventListener("did-navigate", () => {
            updateInfo()
        })
        we.addEventListener('did-fail-load', function (e) {
            console.error(e);
            console.error(e?.errorDescription);
            // TODO 此处执行js代码不知有没有风险，只用于展示错误
            // if (e.errorCode === -300) {
            //     we.executeJavaScript(`document.open();document.write(\`${_agent.getStaticHtmlSource("404")}\`);document.close();`)
            // }
            if (e.errorCode === -100) {
                we.executeJavaScript(`document.open();document.write(\`${_agent.getStaticHtmlSource("404")}\`);document.close();`)
            }
            // if (e.errorCode === -105) {
            //     we.executeJavaScript(`document.open();document.write(\`${_agent.getStaticHtmlSource("403")}\`);document.close();`)
            //     // internalLoad("404")
            // }
            // if (e.errorCode === -21) {
            //     we.executeJavaScript(`document.open();document.write(\`${_agent.getStaticHtmlSource("403")}\`);document.close();`)
            //     // internalLoad("404")
            // }
            // if(e.errorCode === -337){
            //     internalLoad("403")
            // }
            nextTick(updateInfo)
        })
        we.addEventListener('ipc-message', function (event) {
            if (event.channel === "start-load-info") {
                state.isLoadingWebsiteInfo = true
            }
            if (event.channel === "stop-load-info") {
                state.websiteInfo = event.args[0]
                state.isLoadingWebsiteInfo = false
                emits('webinfo', toRaw(state.websiteInfo), state.curWebviewUrl)
            }
        })
        we.addEventListener('did-start-loading', function () {
            state.isLoading = true
        })
        we.addEventListener('did-stop-loading', function () {
            state.isLoading = false
        })
        we.addEventListener('context-menu', function (e: any) {
            console.log(e);
            console.log('右键菜单');
            const contextMenu = []
            if (e.params.selectionText.startsWith("http")) {
                contextMenu.push({
                    label: "前往",
                    click() {
                        toPage(e.params.selectionText)
                    }
                })
            }
            if (e.params.linkURL) {
                contextMenu.push({
                    label: "前往",
                    click() {
                        toPage(e.params.linkURL)
                    }
                })
            }
            if (e.params.srcURL && e.params.mediaType === "image") {
                contextMenu.push({
                    label: "图片另存为",
                    async click() {
                        const url = e.params.srcURL
                        console.log(url);
                        we.downloadURL(url)
                    }
                })
            }

            if (contextMenu.length) {
                new PopupMenu(contextMenu).show()
            }
        })
        we.addEventListener('devtools-opened', () => {
            state.devtoolsIsOpen = true
        })
        we.addEventListener('devtools-closed', () => {
            state.devtoolsIsOpen = false
        })
    }
})

function clickHome() {
    if (props.home) {
        toPage(state.tempUrl = props.home)
    }
}

function clickBack() {
    if (!webviewRef.value) return
    if (!state.canGoBack) return
    webviewRef.value.goBack()
}

function clickForward() {
    if (!webviewRef.value) return
    if (!state.canGoForward) return
    webviewRef.value.goForward()
}

defineExpose({
    update() {
        clickRefresh()
    },
    getWebInfo(){
        return state.websiteInfo
    },
    loadURL(url: string) {
        toPage(url)
    }
})

function clickRefresh() {
    if (!webviewRef.value) return

    let url = webviewRef.value.getURL()
    let isInternalUrl = Object.values(matchInternalUrl).includes(url)
    if (isInternalUrl) {
        webviewRef.value.goBack()
    } else {
        webviewRef.value.reload()
    }
}

function clickStopLoad() {
    if (!webviewRef.value) return
    webviewRef.value.stop()
}

function handleSubmit(e: Event) {
    e.preventDefault()
    if (state.tempUrl) {
        toPage(state.tempUrl)
    }
}

function handleInputBlur() {

}

function handleInputFocus(ev: any) {
    const el = ev.target as HTMLInputElement
    if(props.copyAll) {
        el.setSelectionRange(0, state.tempUrl.length)
        return
    }
    if (state.tempUrl.startsWith("http://") || state.tempUrl.startsWith("https://")) {
        el.setSelectionRange(state.tempUrl.indexOf("//") + 2, state.tempUrl.length)
    } else {
        el.setSelectionRange(0, state.tempUrl.length)
    }
}

function handleCollect() {
    emits("collect", state.curWebviewUrl)
}

function clickOpenBrowser() {
    if (!webviewRef.value) return
    _agent.call('utils.openExternal', state.curWebviewUrl)
}

function clickOpenWindow() {
    _agent.call("createWindow", {
        windowOpts: {
            title: state.curWebviewUrl,
            // icon: "https://bulma.io/favicons/apple-touch-icon.png"
        },
        denyWindowOpen: false,
        url: state.curWebviewUrl,
        loadURLInSameWin: true,
        confrimWindowCloseText: {
            title: "退出",
            defaultId: 0,
            cancelId: 0,
            message: "你要退出此窗口吗？",
            buttons: ["没事", "直接退出"]
        },
    })
}

function clickToggleDevTools() {
    if (state.webContentsId === -1) return
    _agent.call("webview.toggleDevTools", state.webContentsId)
}

function clickClear() {
    if (!webviewRef.value) return
    webviewRef.value.clearHistory()
    state.canGoBack = false
    state.canGoForward = false
}

const webviewPreloadPath = _agent.webviewPreloadPath

function handleClickMenu() {
    emits("leftmenu")
}
</script>

<template>
    <div class="flex flex-col">
        <div class="h-40px px-6px text-size-16px border-b flex items-center">
            <div v-if="!hide.includes('left-menu')"
                class="flex-shrink-0 w-30px h-30px p-5px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer"
                @click="handleClickMenu" title="侧边菜单">
                <SvgIcon name="browser-left-menu"></SvgIcon>
            </div>
            <div v-if="!!home"
                class="flex-shrink-0 w-30px h-30px p-5px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer"
                @click="clickHome" title="主页">
                <SvgIcon name="browser-home"></SvgIcon>
            </div>
            <div class="flex-shrink-0 w-30px h-30px p-8px box-border flex items-center justify-center rounded-lg"
                @click="clickBack" title="后退"
                :class="[state.canGoBack ? 'hover:bg-light-700 cursor-pointer' : 'opacity-60']">
                <SvgIcon name="browser-back"></SvgIcon>
            </div>
            <div v-if="state.canGoForward"
                class="flex-shrink-0 w-30px h-30px p-8px box-border flex items-center justify-center rounded-lg"
                :class="[state.canGoForward ? 'hover:bg-light-700 cursor-pointer' : 'opacity-60']" @click="clickForward"
                title="前进">
                <SvgIcon name="browser-forward"></SvgIcon>
            </div>
            <div v-if="!state.isLoading"
                class="flex-shrink-0 w-30px h-30px p-8px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer"
                @click="clickRefresh" title="刷新">
                <SvgIcon name="browser-refresh"></SvgIcon>
            </div>
            <div v-else
                class="flex-shrink-0 w-30px h-30px p-5px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer"
                @click="clickStopLoad" title="结束刷新">
                <SvgIcon name="close"></SvgIcon>
            </div>
            <form @submit="handleSubmit"
                class="group relative border box-border w-1/1 ml-6px mr-6px px-6px h-28px rounded-md flex items-center p-3px">
                <div v-if="!state.isLoadingWebsiteInfo && state.websiteInfo?.favicon"
                    class="w-22px h-22px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer">
                    <img :src="state.websiteInfo.favicon">
                </div>
                <div v-if="state.isLoadingWebsiteInfo"
                    class="flex-shrink-0 flex-shrink-0 w-22px h-22px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer">
                    <SvgIcon class="loading" name="browser-loading"></SvgIcon>
                </div>
                <input spellcheck="false" class="mx-6px inline-block w-0 flex-1 outline-none" type="text"
                    v-model="state.tempUrl" @blur="handleInputBlur" @focus="handleInputFocus">
                <div v-if="!hide.includes('collect')"
                    class="flex-shrink-0 w-22px h-22px p-2px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer"
                    :title="collect ? '取消收藏' : '收藏'" @click="handleCollect">
                    <SvgIcon :name="collect ? 'browser-star-full' : 'browser-star'"></SvgIcon>
                </div>
                <!-- absolute之后该元素本身就变成宽度为0的了，需要定义宽度。 -->
                <div
                    class="hidden group-hover:block absolute p-2 -mt-2 pl-0 top-full left-0 max-w-200px w-200px pointer-events-none">
                    <div class="inline-block bg-white p-2 shadow max-w-200px pointer-events-auto">
                        {{ state.websiteInfo?.title }}
                    </div>
                </div>
            </form>
            <div v-if="!hide.includes('clean')"
                class="flex-shrink-0 w-30px h-30px p-5px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer"
                @click="clickClear" title="清除历史">
                <SvgIcon name="browser-clear"></SvgIcon>
            </div>
            <div v-if="!hide.includes('open')"
                class="flex-shrink-0 w-30px h-30px p-5px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer"
                @click="clickOpenBrowser" title="外部浏览器打开">
                <SvgIcon name="browser-browser"></SvgIcon>
            </div>
            <div class="flex-shrink-0 w-30px h-30px p-5px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer"
                @click="clickOpenWindow" title="新窗口打开">
                <SvgIcon name="browser-window"></SvgIcon>
            </div>
            <div v-if="!hide.includes('devtool')"
                class="flex-shrink-0 w-30px h-30px p-5px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer"
                :class="[state.devtoolsIsOpen ? 'bg-red-100' : '']" @click="clickToggleDevTools" title="开发者工具">
                <SvgIcon name="browser-develop"></SvgIcon>
            </div>

            <!-- <div v-if="!hide.includes('menu')" class="relative group">
                <div class="dropdown-trigger">
                    <div class="flex-shrink-0 w-30px h-30px p-5px box-border flex items-center justify-center hover:bg-light-700 rounded-lg cursor-pointer"
                        title="菜单">
                        <SvgIcon name="browser-menu"></SvgIcon>
                    </div>
                </div>
                <div class="absolute p-2 pt-4 right-0 hidden group-hover:block">
                    <div class="bg-white shadow text-truncate rounded">
                        <a href="#" class="block px-4 py-2">
                            收藏
                        </a>
                        <hr class="dropdown-divider">
                        <router-link to="/setting" class="block px-4 py-2">
                            设置
                        </router-link>
                    </div>
                </div>
            </div> -->
        </div>
        <div id="wrapperWebview" class="flex-1 h-0" onselectstart="return false;">
            <webview allowpopups ref="webviewRef" class="h-1/1" :preload="webviewPreloadPath" :src="state.curUrl">
            </webview>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.loading {
    animation: rotate 3s infinite linear;
}

@keyframes rotate {
    100% {
        transform: rotate(360deg);
    }
}
</style>
