<script setup lang="ts">
import Dialog from "@/components/Dialog/Dialog.vue"

const props = defineProps<{
    visible: boolean
}>()
const emits = defineEmits<{
    (event: 'update:visible', visible: boolean): void;
    (event: 'close'): void;
}>()
</script>

<template>
    <Dialog v-model:show="visible">
        <div class="bg-light-50 rounded-4px min-w-350px max-w-550px">
            <div>
                asdsa
            </div>
        </div>
    </Dialog>
</template>