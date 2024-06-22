<template>
    <div class="flex flex-col">
        <div class="m-5 !mb-2 flex">
            <input class="input" type="text" :value="modelValue" @input="e => handleInput(e)" />
            <button class="button ml-2" @click="load">加载</button>
        </div>
        <Browser copyAll class="flex-1 h-0" ref="browserRef" :hide="['collect', 'clean', 'open', 'devtool', 'menu', 'left-menu']"></Browser>
    </div>
</template>

<script setup lang="ts">
import Browser from "@/components/Browser/browser.vue"
const props = defineProps<{
    modelValue: string
}>()
const emits = defineEmits<{
    (ev: "update:modelValue", v: string): void
}>()
const browserRef = ref<InstanceType<typeof Browser>>()

onMounted(() => {
    if (props.modelValue.startsWith("http")) {
        nextTick(() => {
            browserRef.value?.loadURL(props.modelValue)
        })
    }
})

function load() {
    browserRef.value?.loadURL(props.modelValue)
}

function handleInput(e: any) {
    const url = (e as any).target.value
    emits("update:modelValue", url)
}
</script>
