<template>
    <teleport :to="to" :disabled="computedDisabled">
        <transition :name="maskAnimComputed">
            <Mask is-render :inBox="inBox" v-model:show="isShow"></Mask>
        </transition>
        <div class="dialog__wrapper" v-bind="attrs" :class="[mode, inBox?'inbox':'']" v-if="isShowWraper" @click.stop="isShow = false">
            <transition :name="dialogAnimComputed" @after-leave="close()">
                <div class="dialog__content"
                    :style="style"
                    v-if="isShow" @click.stop>
                    <slot></slot>
                </div>
            </transition>
        </div>
    </teleport>
</template>

<script lang="ts" setup>
import { onMounted, watch, ref, nextTick, provide, inject, computed } from 'vue'
import Mask from './Mask.vue'
import { DialogToken } from './Token';

defineOptions({
    inheritAttrs: false
})

const attrs= useAttrs()

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
    style?: Record<string, string> | string
    inBox?: boolean
    animation?: boolean
    mode?: "center" | "bottom"
}>(), {
    to: 'body',
    disabled: false,
    show: false,
    animation: true,
    inBox: false, // 对话框不全屏
    mode: "center",
})
const emits = defineEmits<{
    (e: "update:show", isShow: boolean): void
}>()

const isInDialog = inject(DialogToken, false)

const computedDisabled = computed(() => {
    return isInDialog ? true : props.disabled
})
if (!isInDialog) {
    provide(DialogToken, true)
}

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
    position: fixed;
    &.inbox{
        position: absolute;
        transform: scale(1); // 将内部的fixed降级为absolute
    }
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    z-index: 999;

    .dialog__content {
        height: fit-content;
    }

    // 用定位方便一点但是无法用transform动画
    &.center {
        display: flex;
        // align-items: flex-end;
        // align-items: center; // align-items 为center溢出 后无法滚动到顶部
        // justify-content: center;
        overflow: auto;

        .dialog__content {
            margin: auto;
            width: 30%;
            // margin-top: 20vh;
        }
    }

    &.bottom {
        display: flex;
        align-items: flex-end;
        overflow: hidden;

        > .dialog__content {
            width: 100%;
        }
    }
}
</style>