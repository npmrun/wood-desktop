<script setup lang="ts">
import { ref } from "vue"
import IconAccessibility from "~icons/carbon/accessibility"
import IconAccountBox from "~icons/mdi/account-box"

const cpus = ref<any>([])
_agent.on("process-report", (_, data) => {
    cpus.value = data
    console.log(data)
})
</script>
<template>
    <div>
        啊
        <IconAccessibility />
        <IconAccountBox />
        <div class="flex gap-2">
            <div v-for="item in cpus">
                <div v-for="(value, key) in item">{{ key }} : {{ value }}</div>
            </div>
        </div>
    </div>
</template>
