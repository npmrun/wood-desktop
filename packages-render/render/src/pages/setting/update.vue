<template>
    <div class="w-80/100 mx-auto mt-25px p-8px pt-55px pb-80px">
        <div class="mb-35px">
            <div class="text-size-20px font-bold">{{ $t('setting.update.author.title') }}</div>
            <div class="text-gray-400 pt-8px">{{ $t('setting.update.author.desc') }}</div>
            <div class="pt-8px">
                <input spellcheck="false" :value="configStore['update.owner']"
                    @change="(e: any) => configStore.setConfig('update.owner', e.target.value)"
                    class="input input-bordered !max-w-320px !min-w-320px" type="text" :placeholder="$t('setting.update.author.placeholder')">
            </div>
        </div>
        <div class="mb-35px">
            <div class="text-size-20px font-bold">{{ $t('setting.update.repo.title') }}</div>
            <div class="text-gray-400 pt-8px">{{ $t('setting.update.repo.desc') }}</div>
            <div class="pt-8px">
                <input spellcheck="false" :value="configStore['update.repo']"
                    @change="(e: any) => configStore.setConfig('update.repo', e.target.value)"
                    class="input input-bordered !max-w-320px !min-w-320px" type="text" :placeholder="$t('setting.update.repo.placeholder')">
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

</script>
