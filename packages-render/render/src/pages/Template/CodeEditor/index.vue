<script lang="ts" setup>
import CodeEditor from "@/components/CodeEditor/code-editor.vue"
import params from "./params.json"

defineOptions(params)

const configStore = useConfigStore()
</script>

<template>
    <div class="h-full">
        <CodeEditor placeholder="请输入一些内容" name="a.ts" :logo="configStore['editor.bg']" :logo-type="configStore['editor.logoType']"
            :font-family="configStore['editor.fontFamily']">
        </CodeEditor>
    </div>
</template>