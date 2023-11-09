<script setup lang="ts">
import { ref } from "vue"

// import HelloWorld from './components/HelloWorld.vue'

const command = ref("")
const pid = ref("")
const logs = ref<string>("")

_agent.on("process-start", (_0, _pid) => {
    pid.value = _pid
})

_agent.on("process-msg", (_0, _1, data: string, exitCode) => {
    if (exitCode === undefined) {
        logs.value += data
    }
    console.log(exitCode)

    if (exitCode !== undefined) {
        logs.value += `\n退出码: ${exitCode}\n`
    }
})

function handleSend() {
    if (command.value) {
        _agent.send("runCommand", command.value)
        logs.value += `${command.value}: \n`
        command.value = ""
    }
}
</script>

<template>
    <input type="text" v-model="command" />
    <!-- <HelloWorld msg="Vite + Vue" /> -->
    <button @click="handleSend">发送消息</button>
    pid: {{ pid }}
    <div>
        <textarea style="width: 500px; height: 500px" readonly v-model="logs"></textarea>
    </div>
</template>

<style scoped>
.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
}
.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
