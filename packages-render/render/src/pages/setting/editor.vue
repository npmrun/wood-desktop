<script lang="ts" setup>
import SettingItem from "@/components/SettingItem/SettingItem.vue";

const configStore = useConfigStore()


</script>

<template>
    <div class="w-80/100 mx-auto mt-25px p-8px pt-55px pb-80px">
        <SettingItem :title="$t('setting.editor.bg.title')" :desc="$t('setting.editor.bg.desc')"
            :red-border="!configStore.isSameOne('editor.bg') || !configStore.isSameOne('editor.logoType')">
            <div class="whitespace-nowrap flex mb-2">
                <div class="!min-w-320px !max-w-550px hover:flex-1 hover:w-0" style="transition: flex .5s linear;">
                    <div class="control">
                        <label class="radio">
                            <input type="radio" name="logo"
                                :checked="configStore['editor.logoType'] === 'logo' ? true : false"
                                @change="(e: any) => configStore.setConfig('editor.logoType', 'logo')">
                            LOGO
                        </label>
                        <label class="radio">
                            <input type="radio" name="bg"
                                :checked="configStore['editor.logoType'] === 'bg' ? true : false"
                                @change="(e: any) => configStore.setConfig('editor.logoType', 'bg')">
                            BG
                        </label>
                    </div>
                </div>
            </div>
            <div class="whitespace-nowrap flex">
                <div class="!min-w-320px !max-w-550px hover:flex-1 hover:w-0" style="transition: flex .5s linear;">
                    <input spellcheck="false" :value="configStore['editor.bg']" :title="configStore['editor.bg']"
                        @change="(e: any) => configStore.setConfig('editor.bg', e.target.value)"
                        class="input input-bordered w-full" type="text" :placeholder="$t('setting.editor.bg.placeholder')">
                </div>
            </div>
        </SettingItem>
        <SettingItem :title="$t('setting.editor.bg.title')" :desc="$t('setting.editor.bg.desc')" :red-border="!configStore.isSameOne('editor.fontFamily')">
            <div class="whitespace-nowrap flex">
                <div class="!min-w-320px !max-w-550px hover:flex-1 hover:w-0" style="transition: flex .5s linear;">
                    <input spellcheck="false" :value="configStore['editor.fontFamily']"
                        :title="configStore['editor.fontFamily']"
                        @change="(e: any) => configStore.setConfig('editor.fontFamily', e.target.value)"
                        class="input input-bordered w-full" type="text" :placeholder="$t('setting.editor.bg.placeholder')">
                </div>
            </div>
        </SettingItem>
    </div>
</template>