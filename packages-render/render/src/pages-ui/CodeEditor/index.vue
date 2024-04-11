<script lang="ts" setup>
import CodeEditor from "@/components/CodeEditor/code-editor.vue"

const codeEditorRef = ref<InstanceType<typeof CodeEditor>>()
const configStore = useConfigStore()

defineExpose({
    scrollTop(){
        codeEditorRef.value?.scrollTop()
    }
})
</script>

<template>
    <CodeEditor ref="codeEditorRef" :logo="configStore['editor.bg']" :logo-type="configStore['editor.logoType']"
        :font-family="configStore['editor.fontFamily']">
    </CodeEditor>
</template>