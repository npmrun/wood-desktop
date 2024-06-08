<template>
    <div class="h-1/1 flex flex-col">
        <div class="flex-1 flex h-0">
            <div class="w-120px border-r shadow text-size-14px">
                <Menu v-model="activeTab" :top-list="TopMenu" :sys-list="SysMenu"></Menu>
            </div>
            <div class="flex-1 w-0 relative overflow-auto">
                <router-view v-slot="{ Component, route: route }">
                    <transition :name="getTransitionName(route)" mode="out-in" appear>
                        <keep-alive :include="cacheList">
                            <component :is="Component" />
                        </keep-alive>
                    </transition>
                </router-view>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.app-footer {
    overflow: hidden;

    :deep(.tip) {
        color: rgba(156, 163, 175, 1);
    }

    :deep(.error) {
        color: red;
    }
}
</style>

<script lang="ts" setup>
import Menu from '@/components/menu.vue';
import { useGlobalStore } from '@/store/module/global';
import pageStore from '@/store/module/page'
import type { RouteLocationNormalizedLoaded } from 'vue-router'



const route = useRoute()
const store = pageStore()
const globalStore = useGlobalStore()

// const isDev = import.meta.env.DEV

const cacheList = store.cache
watch(
    () => route.fullPath,
    () => {
        if (route.meta.cache && route.name) {
            store.addCacheView(route.name as string)
        }
        route.meta.title && useTitle(route.meta.title as string)
    },
    {
        immediate: true,
    }
)

function getTransitionName(route: RouteLocationNormalizedLoaded) {
    if (route.meta.anim === false) {
        return ''
    }
    return (route.meta.anim ?? "fade") as string
}

const router = useRouter()
const activeTab = ref<string | number>(-1)
const TopMenu = globalStore.topMenu
const SysMenu = globalStore.bottomMenu
watch(() => router.currentRoute.value, (route) => {

    for (let i = 0; i < TopMenu.length; i++) {
        const element = TopMenu[i];
        if (route.path.startsWith(element.url)) {
            activeTab.value = element.key
        }
    }
    for (let i = 0; i < SysMenu.length; i++) {
        const element = SysMenu[i];
        if (route.path.startsWith(element.url)) {
            activeTab.value = element.key
        }
    }
}, { immediate: true })

</script>
<script lang="ts">
export default defineComponent({
    name: 'BaseLayout',
})
</script>

