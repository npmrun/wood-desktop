<script setup lang="ts">
import { toast } from "vue3-toastify"
import Image from "../_ui/Image.vue"
// https://github.com/hellohyb/WallPaper-electron
// https://github.com/hellohyb/Wallpaper-electron2.0?tab=readme-ov-files
const active = ref(0)
const activeImg = ref<{
    category: string
    class_id: string
    id: string
    live_open: boolean
    status: string
    tag: string
    url: string
}>()
const showPreview = ref(false)
const cateList = ref<
    Array<{
        category: string
        hot_tag: Array<{
            icon: string
            show_tag: string
            tag: string
        }>
        icon: string
        old_id: string
        position: string
        show_name: string
    }>
>([])
const picList = ref<
    Array<{
        category: string
        class_id: string
        id: string
        live_open: boolean
        status: string
        tag: string
        url: string
    }>
>([])
const state = reactive({
    total: 0,
})
const searchParams = reactive({
    pageno: 1,
    count: 28,
})
const fenNum = computed(() => {
    return Math.ceil(state.total / searchParams.count)
})
const showNum = computed(() => {
    const num: number[] = []
    searchParams.pageno - 2 > 0 && num.push(searchParams.pageno - 2);
    searchParams.pageno - 1 > 0 && num.push(searchParams.pageno - 1);
    searchParams.pageno > 0 && num.push(searchParams.pageno);
    (searchParams.pageno + 1 <= fenNum.value) && num.push(searchParams.pageno + 1);
    (searchParams.pageno + 2 <= fenNum.value) && num.push(searchParams.pageno + 2);
    return num
})
function handleClickPre() {
    if (searchParams.pageno > 1) {
        searchParams.pageno--
    }
}
function handleClickPost() {
    if (searchParams.pageno < fenNum.value) {
        searchParams.pageno++
    }
}

function handlePreview(item: any) {
    activeImg.value = item
    showPreview.value = true
}

const isLoadingCate = ref(false)
onBeforeMount(async () => {
    try {
        isLoadingCate.value = true
        const res = await (await fetch("http://wp.birdpaper.com.cn/intf/getCategory")).json()
        console.log(res)
        isLoadingCate.value = false
        if (res.errno === 0) {
            cateList.value = res.data
        } else {
            toast.error(res.msg)
        }
    } catch (error) {
        toast.error((error && (error as any).message) as string)
        isLoadingCate.value = false
    }
})

const isLoading = ref(false)
const contentWrapper = ref<HTMLDivElement>()

let controller: AbortController
watchEffect(() => {
    ;(async () => {
        const data = cateList.value[active.value]
        if (data) {
            try {
                isLoading.value = true
                if (controller) {
                    controller.abort()
                }
                controller = new AbortController()
                const res = await (
                    await fetch(
                        `http://wp.birdpaper.com.cn/intf/GetListByCategory?cids=${data.old_id}&pageno=${searchParams.pageno}&count=${searchParams.count}`,
                        {
                            signal: controller.signal,
                        },
                    )
                ).json()
                nextTick(() => {
                    contentWrapper.value && (contentWrapper.value.scrollTop = 0)
                })
                isLoading.value = false
                console.log(res)
                if (res.errno === 0 && res.data) {
                    picList.value = res.data.list
                    state.total = res.data.total_count
                } else {
                    toast.error(res.msg)
                }
            } catch (error) {
                toast.error((error && (error as any).message) as string)
                isLoading.value = false
            }
        }
    })()
})
async function setStaticWallpaper() {
    if (activeImg.value) {
        const item = activeImg.value
        try {
            const filePath = await _agent.call("utils.getdownloadFilePath", `${item.id}`, "jpg")
            const isExist = await _agent.call("utils.checkFileExist", filePath)
            if (isExist) {
                await _agent.call("wallpaper.setStaticWallpaper", filePath)
                toast.success("设置成功")
            } else {
                toast.error("请先下载图片")
            }
        } catch (error) {
            toast.error((error && (error as any).message) as string)
        }
    }
}
async function download() {
    if (activeImg.value) {
        const item = activeImg.value
        const id = toast.loading("下载中")
        try {
            const filePath = await _agent.call("utils.downloadFileToFolder", item.url, `${item.id}`, "jpg")
            toast.update(id, {
                type: "success",
                isLoading: false,
                render: "下载成功, 点击查看",
                autoClose: 3000,
                onClick() {
                    _agent.call("utils.showItemInFolder", filePath)
                },
            })
        } catch (error) {
            console.log(error)

            toast.update(id, {
                type: "error",
                isLoading: false,
                render: (error && (error as any).message) as string,
                autoClose: 3000,
                onClick() {
                    if ((error as any).data) {
                        _agent.call("utils.showItemInFolder", (error as any).data)
                    }
                },
            })
        }
    }
}
</script>

<template>
    <div class="flex h-full relative">
        <div class="w-200px border-r h-full" v-loading="isLoadingCate">
            <div class="h-full scrollbar">
                <template v-for="(item, index) in cateList">
                    <div
                        class="my-10px mx-2 cursor-pointer"
                        @click="active = index"
                        :class="[active === index ? '' : 'filter-grayscale-100 text-gray-400']"
                    >
                        <img :src="item.icon" :alt="item.show_name" />
                    </div>
                </template>
            </div>
        </div>
        <div ref="contentWrapper" class="flex-1 w-0 scrollbar" v-loading="isLoading">
            <div class="h-full scrollbar">
                <div class="sticky top-0 z-10 flex justify-center items-center gap-x-2 p-5" v-if="state.total">
                    <button class="button" v-if="searchParams.pageno > 1" @click="handleClickPre">上一页</button>
                    <div class="flex gap-x-2">
                        <button class="button" @click="searchParams.pageno = 1" v-if="searchParams.pageno > 3">
                            首页
                        </button>
                        <button
                            class="button"
                            @click="searchParams.pageno = (searchParams.pageno - 5<1)?1:searchParams.pageno - 5"
                            v-if="searchParams.pageno > 3"
                        >
                            ...
                        </button>
                        <button
                            v-for="num in showNum"
                            :key="num"
                            class="button"
                            :class="[searchParams.pageno === num ? 'is-primary' : '']"
                            @click="searchParams.pageno = num"
                        >
                            {{ num }}
                        </button>
                        <button
                            class="button"
                            @click="searchParams.pageno = (searchParams.pageno + 5>fenNum)?fenNum:searchParams.pageno + 5"
                            v-if="searchParams.pageno < fenNum - 2"
                        >
                            ...
                        </button>
                        <button
                            class="button"
                            @click="searchParams.pageno = fenNum"
                            v-if="searchParams.pageno < fenNum - 2"
                        >
                            末页
                        </button>
                    </div>
                    前往：<input class="input !w-80px" type="number" :value="searchParams.pageno" @blur="(e: Event) => searchParams.pageno = (e.target as any)!.value" />
                    <button class="button" v-if="searchParams.pageno < fenNum" @click="handleClickPost">下一页</button>
                </div>
                <ul class="list-wrapper">
                    <template :key="item.id" v-for="item in picList">
                        <li class="list" @click="handlePreview(item)">
                            <div class="cover">
                                <Image :src="item.url" :alt="item.tag" />
                            </div>
                        </li>
                    </template>
                </ul>
            </div>
        </div>
        <Dialog v-model:show="showPreview" style="width: 70%" :stopPropagation="false">
            <div class="my-2">
                <img @click.stop :src="activeImg?.url" alt="" />
                <div class="mt-5 flex justify-center gap-x-10">
                    <button @click.stop="download()" class="button">下载</button>
                    <button @click.stop="setStaticWallpaper()" class="button">设置为壁纸</button>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<style lang="scss" scoped>
.list-wrapper {
    margin: calc(1.5rem / 4);
    @media (max-width: 919.9999px) {
        margin: calc(1rem / 3);
    }
    @media (min-width: 920px) and (max-width: 1280px) {
        margin: calc(1.5rem / 4);
    }
    @media (min-width: 1600px) {
        margin: calc(2rem / 5);
    }
    &::after {
        content: "";
        display: table;
        clear: both;
    }
}
.list {
    width: calc(25% - 1.5rem / 4);
    @media (max-width: 919.9999px) {
        width: calc(33.333% - 1rem / 3);
    }
    @media (min-width: 920px) and (max-width: 1280px) {
        width: calc(25% - 1.5rem / 4);
    }
    @media (min-width: 1600px) {
        width: calc(20% - 2rem / 5);
    }
    float: left;
    margin-bottom: 0.5rem;
    cursor: pointer;
}

@media (max-width: 920px) {
    .list:not(:nth-child(3n + 1)) {
        margin-left: 0.5rem;
    }
}
@media (min-width: 920px) and (max-width: 1280px) {
    .list:not(:nth-child(4n + 1)) {
        margin-left: 0.5rem;
    }
}
@media (min-width: 1600px) {
    .list:not(:nth-child(5n + 1)) {
        margin-left: 0.5rem;
    }
}
.cover {
    padding: 50% 100% 0 0;
    position: relative;
    // https://blog.csdn.net/weixin_57526694/article/details/125525352
    transform: translate3d(0, 0, 0);
}
// .cover img {
//     position: absolute;
//     left: 0;
//     top: 0;
//     width: 100%;
//     height: 100%;
//     object-fit: cover;
// }
</style>
