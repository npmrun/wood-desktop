<template>
    <div class="h-1/1 flex">
        <Htab class="w-220px border-r pt-60px" v-model="activeTab" :list="TopMenu"></Htab>
        <div class="flex-1 w-0 overflow-auto scrollbar">
            <!-- <button @click="sendTip('assa')">aaaa</button> -->
            <router-view v-slot="{ Component }">
                <keep-alive>
                    <component :is="Component" />
                </keep-alive>
            </router-view>
        </div>
        <div class="flex gap-6px absolute right-1/10 bottom-1/10">
            <button v-if="!isSame" class="button is-info" @click="restore">重置所有</button>
            <button v-if="!isSame" class="button is-error" :class="[isSame ? '' : 'is-danger']" @click="save">点击保存</button>
        </div>
        <Dialog v-model:show="showDialog">
            <div class="bg-light-50 rounded-4px min-w-350px">
                <div class="text-size-20px font-bold p-12px border-b flex items-center">
                    <div class="flex-1 w-0">
                        提示
                    </div>
                    <button class="delete" @click="showDialog = false"></button>
                </div>
                <div class="text-size-16px p-12px min-h-80px">
                    您的设置尚未保存，请先确认
                </div>
                <div class="buttons border-t flex !justify-end p-12px">
                    <button class="button is-danger !mb-0" @click="restore">重置</button>
                    <button class="button is-info !mb-0" @click="save">保存并跳转</button>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<route lang="yaml">
name: setting
meta:
    anim: false
</route>

<script lang="ts" setup>
import Htab from '@/components/htab.vue';
import { onBeforeRouteLeave, RouteLocationNormalized } from 'vue-router';

const router = useRouter()
const configStore = useConfigStore()

const showDialog = ref(false)
const toWhere = ref()
onBeforeRouteLeave((to: RouteLocationNormalized) => {
    if (isSame.value) {
        return true
    }
    showDialog.value = true
    toWhere.value = to.fullPath
    return false
})

const isSame = computed(() => configStore.isSame)

async function restore() {
    try {
        await configStore.restoreConfig()
        showDialog.value = false
        toWhere.value = undefined
    } catch (error) {
        console.error(error)
    }
}
async function save() {
    try {
        await configStore.saveConfig()
        showDialog.value = false
        if (toWhere.value) {
            setTimeout(() => {
                router.replace(toWhere.value)
                toWhere.value = undefined
            }, 200);
        }
        // toast.success("保存成功")
    } catch (error) {
        // toast.error(`${error}`)
        console.error(error)
    }
}

const activeTab = ref(0)

const { t } = useI18n()

const TopMenu = computed<any[]>(() => {
    return [
        { key: 0, title: t('setting.tabs.common'), url: "/setting" },
        { key: 1, title: t('setting.tabs.editor'), url: "/setting/editor" },
        { key: 2, title: t('setting.tabs.update'), url: "/setting/update" },
    ]
})

const route = useRoute()
watch(() => route, (route) => {
    for (let i = 0; i < TopMenu.value.length; i++) {
        const element = TopMenu.value[i];
        if (route.path.startsWith(element.url)) {
            activeTab.value = element.key
        }
    }
}, { immediate: true })
</script>
