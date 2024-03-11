<template>
    <teleport :to="to" :disabled="disabled">
        <transition :name="maskAnimComputed">
            <Mask is-render v-model:show="isShow"></Mask>
        </transition>
        <div class="dialog__wrapper" :class="[mode]" v-if="isShowWraper" @click.stop="isShow = false">
            <transition :name="dialogAnimComputed" @after-leave="close()">
                <div class="dialog__content"
                    :style="{ width: width, height: height, minWidth: minWidth, maxWidth: maxWidth, minHeight: minHeight, maxHeight: maxHeight }"
                    v-if="isShow" @click.stop>
                    <slot></slot>
                </div>
            </transition>
        </div>
    </teleport>
</template>
 
<script lang="ts" setup>
import { onMounted, watch, ref, nextTick } from 'vue'
import Mask from './Mask.vue'

function setStyle(el: HTMLElement, css: Partial<CSSStyleDeclaration>) {
    for (const key in css) {
        if (Object.prototype.hasOwnProperty.call(css, key)) {
            const prop = css[key]
            el.style[key] = prop as string
        }
    }
}

// https://github.com/microsoft/TypeScript/issues/42873

const props = withDefaults(defineProps<{
    to?: string
    disabled?: boolean
    show?: boolean
    minWidth?: string
    maxWidth?: string
    width?: string
    minHeight?: string
    maxHeight?: string
    height?: string
    animation?: boolean
    mode?: "center" | "bottom"
}>(), {
    to: 'body',
    disabled: false,
    show: false,
    animation: true,
    mode: "center",
})
const emits = defineEmits<{
    (e: "update:show", isShow: boolean): void
}>()

const maskAnimComputed = computed(() => {
    return props.animation ? "mask-fade" : undefined
})

const dialogAnimComputed = computed(() => {
    return props.animation ? `dialog-${getDialogAnimType()}` : undefined
})

const getDialogAnimType = () => {
    if (props.mode === "bottom") return "bottom"
    return "slide-fade"
}

onMounted(() => {
    watch(() => props.show, (isShow) => {
        if (isShow) {
            show()
        } else {
            hide()
        }
    }, {
        immediate: true
    })
})

const isShow = ref(false)
const isShowWraper = ref(false)

function show() {
    isShowWraper.value = true
    setStyle(document.body, {
        overflow: "hidden"
    })
    nextTick(() => {
        isShow.value = true
    })
}

function hide() {
    isShow.value = false
    setStyle(document.body, {
        overflow: ""
    })
}

function close() {
    isShowWraper.value = false
    emits("update:show", false)
}
</script>


<style lang="scss" scoped>
$masktime: 0.3s;
$dialogtime: 0.2s;

.mask-fade-enter-active,
.mask-fade-leave-active {
    transition: opacity $masktime ease;
}

.mask-fade-enter-from,
.mask-fade-leave-to {
    opacity: 0;
}

/* 可以为进入和离开动画设置不同的持续时间和动画函数 */
.dialog-slide-fade-enter-active {
    transition: opacity $dialogtime ease-out, transform $dialogtime ease-out;
}

.dialog-slide-fade-leave-active {
    transition: opacity $dialogtime cubic-bezier(1, 0.5, 0.8, 1), transform $dialogtime cubic-bezier(1, 0.5, 0.8, 1);
}

.dialog-slide-fade-enter-from,
.dialog-slide-fade-leave-to {
    transform: translateY(30px);
    opacity: 0;
}

.dialog-bottom-enter-active {
    transition: transform $dialogtime ease-in;
}

.dialog-bottom-leave-active {
    transition: transform $dialogtime ease-out;
}

.dialog-bottom-enter-from,
.dialog-bottom-leave-to {
    transform: translateY(100%);
}

.dialog__wrapper {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    z-index: 999;

    // 用定位方便一点但是无法用transform动画
    &.center {
        display: flex;
        align-items: flex-end;
        justify-content: center;
        overflow: auto;

        // .dialog__content {
        //     margin: auto;
        // }
    }

    &.bottom {
        display: flex;
        align-items: flex-end;
        overflow: hidden;
        .dialog__content {
            width: 100%;
        }
    }
}
</style>