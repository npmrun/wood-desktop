<script lang="ts" setup>
import params from "./params.json"

defineOptions(params)

const command = ref("")
const pid = ref("")
const logs = ref<string>("")

_agent.on("process-start", (_0, _pid) => {
    pid.value = _pid
})

_agent.on("process-list", (_0, list) => {
    console.log(list);
})

_agent.on("process-msg", (_0, _1, data: string, exitCode) => {
    if (exitCode === undefined) {
        logs.value += data
    }
    if (exitCode !== undefined) {
        logs.value += `\n退出码: ${exitCode}\n`
        pid.value = ""
    }
})

function handleKill() {
    if (pid.value) {
        _agent.send("killByPid", pid.value)
    }
}

function handleForceKill() {
    if (pid.value) {
        _agent.send("forceKillByPid", pid.value)
    }
}

function handleSend() {
    if (command.value) {
        _agent.send("runCommand", command.value)
        logs.value += `${command.value}: \n`
        command.value = ""
    }
}
</script>

<template>
    <div>
        <input class="input" type="text" v-model="command" />
        <!-- <HelloWorld msg="Vite + Vue" /> -->
        <div class="buttons" flex justify-center>
            <button class="button" @click="handleSend">发送消息</button>
            <button class="button" @click="handleKill">杀死进程</button>
            <button class="button" @click="handleForceKill">强制杀死进程</button>
        </div>
        pid:<input class="input" type="text" v-model="pid">
        <div>
            <textarea class="textarea" style="width: 500px; height: 300px" readonly v-model="logs"></textarea>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
