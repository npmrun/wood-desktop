<script lang="ts" setup>
import params from "./params.json"
import CityJson from "./_data/city.json"

defineOptions({
    name: params.title,
})

const showDialog = ref(false)
const showDialog2 = ref(false)
console.log(CityJson);

</script>

<template>
    <IPhone>
        <button @click="showDialog = true">压窗屏</button>
        <Dialog mode="bottom" height="80%" disabled v-model:show="showDialog">
            <div class="bg-white h-full">
                <div  @click="showDialog = false">
                    关闭压窗屏
                </div>
                <button @click="showDialog2 = true">弹窗</button>
            </div>
            <Dialog mode="bottom" height="50%" v-model:show="showDialog2">
                <div class="bg-white h-full" @click="showDialog2 = false">
                    关闭
                </div>
            </Dialog>
        </Dialog>
    </IPhone>
</template>

<style lang="scss" scoped></style>
