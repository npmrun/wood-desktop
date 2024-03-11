<script lang="ts" setup>
import params from "./params.json"
import CityJson from "./_data/city.json"

defineOptions({
    name: params.title,
})

const showDialog = ref(false)
console.log(CityJson);

</script>

<template>
    <IPhone>
        <button @click="showDialog = true">大佬</button>
        <Dialog mode="bottom" height="50%" disabled v-model:show="showDialog">
            <div class="bg-white h-full">
                sdsfdsf
            </div>
        </Dialog>
    </IPhone>
</template>

<style lang="scss" scoped></style>
