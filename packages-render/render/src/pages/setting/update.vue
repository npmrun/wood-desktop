<template>
    <div class="w-80/100 mx-auto mt-25px p-8px pt-55px pb-80px">
        <div class="mb-35px">
            <div class="text-size-20px font-bold">{{ $t('setting.update.author.title') }}</div>
            <div class="text-gray-400 pt-8px">{{ $t('setting.update.author.desc') }}</div>
            <div class="pt-8px">
                <input disabled spellcheck="false" :value="configStore['update.owner']"
                    @change="(e: any) => configStore.setConfig('update.owner', e.target.value)"
                    class="input input-bordered !max-w-320px !min-w-320px" type="text" :placeholder="$t('setting.update.author.placeholder')">
            </div>
        </div>
        <div class="mb-35px">
            <div class="text-size-20px font-bold">{{ $t('setting.update.repo.title') }}</div>
            <div class="text-gray-400 pt-8px">{{ $t('setting.update.repo.desc') }}</div>
            <div class="pt-8px">
                <input disabled spellcheck="false" :value="configStore['update.repo']"
                    @change="(e: any) => configStore.setConfig('update.repo', e.target.value)"
                    class="input input-bordered !max-w-320px !min-w-320px" type="text" :placeholder="$t('setting.update.repo.placeholder')">
            </div>
        </div>
        <div class="mb-35px">
            <div class="text-size-20px font-bold">升级</div>
            <div class="text-gray-400 pt-8px">是否不同架构的升级</div>
            <div v-if="isDev" class="text-red text-size-12px">开发时可以设置为True</div>
            <div class="pt-8px">
                <label class="checkbox">
                    <input type="checkbox" v-model="configStore['update.allowDowngrade']" 
                    @change="(e: any) => configStore.setConfig('update.allowDowngrade', configStore['update.allowDowngrade'])"/>
                </label>
            </div>
        </div>
        <div class="mb-35px">
            <div class="text-size-20px font-bold">升级</div>
            <div class="text-gray-400 pt-8px">是否能够升级到预构建版本</div>
            <div class="pt-8px">
                <label class="checkbox">
                    <input type="checkbox" v-model="configStore['update.allowPrerelease']" 
                    @change="(e: any) => configStore.setConfig('update.allowPrerelease', configStore['update.allowPrerelease'])"/>
                </label>
            </div>
        </div>
        <div class="mb-35px">
            <div class="text-size-20px font-bold">{{ $t('setting.update.version.title') }}</div>
            <div class="text-gray-400 pt-8px">
                {{ $t('setting.update.version.desc') }}{{ version }}
            </div>
            <div class="pt-16px">
                <UpdateButton></UpdateButton>
            </div>
        </div>
    </div>
</template>


<script lang="ts" setup>
import UpdateButton from "@/components/UpdateButton.vue"

const configStore = useConfigStore()
const version = _agent.info.version
const isDev = import.meta.env.DEV
</script>
