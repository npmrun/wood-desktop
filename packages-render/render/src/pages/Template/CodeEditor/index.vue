<script lang="ts" setup>
import CodeEditor from "./_components/CodeEditor/code-editor.vue"

defineOptions({
    url: "/Template/CodeEditor",
    title: "编辑器"
})

const configStore = useConfigStore()
</script>

<template>
    <div class="h-full">
        <CodeEditor name="a.ts" :logo="configStore['editor.bg']" :logo-type="configStore['editor.logoType']"
            :font-family="configStore['editor.fontFamily']">
        </CodeEditor>
    </div>
</template>