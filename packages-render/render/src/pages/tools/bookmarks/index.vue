<script lang="ts" setup>
import { toast } from 'vue3-toastify';
import { bookmarksToJSON } from './bookmarksToJSON';

const result = shallowRef()

function handleFileChange(ev: Event) {
    function handleFile(file: File) {
        if (file.type !== "text/html") {
            toast.error("请选择导出的书签文件，是一个html文件")
            return
        }
        const reader = new FileReader()
        reader.readAsText(file)
        reader.onerror = () => {
            toast.error("加载出错")
        }
        reader.onload = () => {
            const html = reader.result
            Promise.resolve().then(() => {
                // 放在微队列执行
                result.value = bookmarksToJSON(html, { spaces: 2, stringify: true, formatJSON: true })
                toast.success("加载完成")
                codeEditorRef.value?.scrollTop()
            })
        }
    }
    if (ev instanceof DragEvent) {
        ev.preventDefault()
        isDraging.value = false;
        if (ev.dataTransfer?.files && ev.dataTransfer.files[0]) {
            const [file] = ev.dataTransfer.files
            handleFile(file)
        }
    } else {
        const inputElement = ev.target as HTMLInputElement
        if (inputElement.files && inputElement.files[0]) {
            const [file] = inputElement.files
            handleFile(file)
            // https://www.jianshu.com/p/937413aff920
            inputElement.value = '';
        }
    }
}

const isDraging = ref(false)

function handleDragenter() {
    isDraging.value = true
}

function handleDragleave() {
    isDraging.value = false
}

const isReadonly = ref(true)

const codeEditorRef = ref()

</script>

<template>
    <div class="h-1/1 flex flex-col">
        <div :class="[isDraging ? 'border border-red' : '']"
            class="h-300px flex-shrink-0 flex items-center justify-center border border-separate m-2 sticky top-0 bg-white"
            @dragleave="handleDragleave" @dragenter="handleDragenter" @dragover.prevent
            @drop.prevent="handleFileChange">
            <!-- 拖拽时不能点击，也不能拖入按钮 -->
            <button :class="[isDraging ? 'pointer-events-none' : '']" class="relative button cursor-pointer is-info">
                选择文件
                <input @change="handleFileChange" type="file" class="absolute inset-0 opacity-0 text-[0px]">
            </button>
        </div>
        <div class="flex-grow-1 flex flex-col h-0 relative mx-2">
            <form action="#" @submit.prevent>
                <label class="checkbox">
                    <input type="checkbox" v-model="isReadonly">
                    是否只读
                </label>
            </form>
            <CodeEditor ref="codeEditorRef" class="flex-1 h-0" :readonly="isReadonly" placeholder="请选择文件进行解析" v-model="result" name=".json">
            </CodeEditor>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
