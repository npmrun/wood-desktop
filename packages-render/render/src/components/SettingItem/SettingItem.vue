<script lang="ts" setup>
withDefaults(defineProps<{
    title: string
    desc?: string
    redBorder?: boolean
}>(), {

})
</script>
<template>
    <div class="mb-35px" :class="[redBorder && 'notsave']">
        <div class="text-size-20px font-bold">{{ title }}</div>
        <div class="text-gray-400 pt-8px">{{ desc }}</div>
        <div class="pt-8px">
            <slot></slot>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.notsave {
    position: relative;

    &::before {
        content: "";
        position: absolute;
        pointer-events: none;
        inset: 0;
        border: 1px solid rgb(255, 176, 176);
        background-color: rgb(248, 248, 248);
        z-index: -1;
        margin: -12px;
        border-radius: 6px;
    }

    &::after {
        content: "未保存";
        position: absolute;
        right: 0;
        top: 0;
        font-size: 12px;
        border-radius: 12px;
        background-color: #e2e2e2;
        padding: 2px 6px;
    }
}
</style>


