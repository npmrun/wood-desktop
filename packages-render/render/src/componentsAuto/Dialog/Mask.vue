<template>
    <div :class="['mask', inBox?'inbox':'']" v-if="isRenderShow" v-show="isDisplayShow" @click.stop="clickMask"></div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
const props = withDefaults(defineProps<{
    show?: boolean
    isRender?: boolean
    inBox?: boolean
}>(), {
    show: false,
    isRender: false,
    inBox: false,
})
const isDisplayShow = computed(() => {
    return !props.isRender ? props.show : true
})
const isRenderShow = computed(() => {
    return props.isRender ? props.show && props.isRender : true
})

const emits = defineEmits<{
    (e: "update:show", isShow: boolean): void
}>()

function clickMask() {
    emits("update:show", false)
}
</script>

<style lang="scss" scoped>
.mask {
    position: fixed;
    &.inbox{
        position: absolute;
        transform: scale(1);
    }
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: #00000062;
    z-index: 998;
}
</style>