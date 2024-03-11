<script lang="ts" setup>
import MdEditor from './_components/MdEditor/MdEditor.vue'
import params from "./params.json"

defineOptions(params)

const value = ref(`![](rush-file://asset/image/1_T_D125D5047E0DF07D178DAADB4EE599C3.png)
[Yozai-Regular.ttf.br](rush-file://asset/file/2_T_852D75B99AF21E2E619A6EC3176080D0Yozai-Regular.ttf.br.br)
`)
</script>

<template>
    <div class="h-full">
        <MdEditor v-model="value"></MdEditor>
    </div>
</template>