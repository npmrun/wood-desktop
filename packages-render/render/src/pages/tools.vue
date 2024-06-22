<template>
    <div class="flex h-1/1">
        <div class="border-r w-1/3 md: px-8px py-20px">
            <h2 class="text-size-25px font-bold">个人工具</h2>
            <div class="mt-25px flex flex-wrap gap-x-[8px] gap-y-[8px]">
                <router-link v-for="item in app" :key="item.path" custom v-slot="{ navigate, isActive }" :to="item.path">
                    <div @click="navigate" class="border rounded-8px inline-block p-12px cursor-pointer"
                        :style="{ color: isActive ? item.activeColor : item.color, borderColor: isActive ? item.activeColor : item.color }">
                        <span>{{ item.title }}</span>
                    </div>
                </router-link>
            </div>
        </div>
        <div class="flex-1 w-0">
            <router-view v-slot="{ Component }">
                <component :is="Component" />
            </router-view>
        </div>
    </div>
</template>

<route lang="yaml">
name: tools
meta:
    cache: true
</route>

<script lang="ts" setup>
import { onBeforeRouteLeave, useRouter } from 'vue-router';

defineOptions({
    name: "tools"
})

const app = reactive([
    { title: "图标生成器", path: "/tools/icons", color: "#a9c0ff", activeColor: "#2F66FF" },
    { title: "解析Chrome/Edge书签", path: "/tools/bookmarks", color: "#a9c0ff", activeColor: "#2F66FF" },
    { title: "二维码美化", path: "/tools/qrcode", color: "#a9c0ff", activeColor: "#2F66FF" },
    // { title: "test", path: "/tools/test", color: "#dfaaca", activeColor: "#ea4aaa" },
])

const lastRoute = ref()
const router = useRouter()
onBeforeRouteLeave((_, from, next) => {
    lastRoute.value = from.fullPath
    next()
})
onActivated(() => {
    if (lastRoute.value) {
        router.replace(lastRoute.value)
        lastRoute.value = undefined
    }
})

</script>

<style lang="less" scoped></style>
