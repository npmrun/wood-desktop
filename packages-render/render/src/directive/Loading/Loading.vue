<template>
    <div class="loading">
        <div class="loading__mask"></div>
        <div class="loading__wrapper">
            <div class="loading__icon">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
            <div class="loading__text" v-if="text">{{ text }}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
const porps = withDefaults(
    defineProps<{
        text?: string
    }>(),
    {
        text: "",
    },
)
</script>

<style lang="scss" scoped>
.loading {
    .loading__mask {
        background-color: rgba(255, 255, 255, 0.699);
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
    }
    .loading__wrapper {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate3d(-50%, -50%, 0);
        text-align: center;
        .loading__icon {
            width: 50px;
            height: 50px;
            border-radius: 100%;
            background-color: #000;
            margin: 0 auto;
            animation: ball-scale infinite linear 0.75s;
        }

        @keyframes ball-scale {
            0% {
                transform: scale(0.1);
                opacity: 1;
            }
            100% {
                transform: scale(1);
                opacity: 0;
            }
        }

        .loading__text {
            margin-top: 20px;
            color: #333;
        }
    }
}
</style>