<template>
    <div class="w-80/100 mx-auto mt-25px p-8px pt-55px pb-80px">
        <div class="mb-35px">
            <div class="text-size-20px font-bold">作者</div>
            <div class="text-gray-400 pt-8px">更新的仓库作者</div>
            <div class="pt-8px">
                <input disabled spellcheck="false" :value="configStore['update.owner']"
                    @change="(e: any) => configStore.setConfig('update.owner', e.target.value)"
                    class="input input-bordered !max-w-320px !min-w-320px" type="text" placeholder="请输入作者">
            </div>
        </div>
        <div class="mb-35px">
            <div class="text-size-20px font-bold">仓库</div>
            <div class="text-gray-400 pt-8px">更新的仓库</div>
            <div class="pt-8px">
                <input disabled spellcheck="false" :value="configStore['update.repo']"
                    @change="(e: any) => configStore.setConfig('update.repo', e.target.value)"
                    class="input input-bordered !max-w-320px !min-w-320px" type="text" placeholder="请输入仓库">
            </div>
        </div>
        <div class="mb-35px">
            <div class="text-size-20px font-bold">检查更新</div>
            <div class="text-gray-400 pt-8px">
                当前版本：{{ version }}
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
