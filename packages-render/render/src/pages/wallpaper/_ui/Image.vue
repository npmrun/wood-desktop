<script lang="ts" setup>
defineOptions({
    inheritAttrs: false,
})

const props = defineProps<{
    src: string
}>()

const isLoading = ref(true)
const realUrl = ref("")
const image = new Image()
image.onload = () => {
    isLoading.value = false
    realUrl.value = props.src
}
image.onerror = () => {
    isLoading.value = false
    realUrl.value = props.src
}
image.src = props.src
</script>

<template>
    <div class="img-wrapper" :class="[isLoading ? '' : 'show']" v-loading="isLoading">
        <img :src="realUrl" v-bind="$attrs" />
    </div>
</template>

<style lang="scss" scoped>
.img-wrapper {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    // border: 1px solid black;
    transform: translate3d(0, 0, 0);
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    &.show {
        border: 0;
        img {
            opacity: 1;
        }
    }
}
</style>
