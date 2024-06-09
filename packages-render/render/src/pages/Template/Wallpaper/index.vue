<script setup lang="ts">
const url = ref("https://www.nayuki.io/res/full-screen-clock-javascript/full-screen-clock-12hr-with-seconds.html")
</script>

<template>
    <div class="flex items-center justify-center h-full">
        <div>
            <input v-model="url" type="text" class="input" />
            <div class="flex gap-x-4">
                <button class="button" @click="_agent.call('wallpaper.attachWindow')">Attach</button>
                <button
                    class="button"
                    @click="
                        _agent.call(
                            'wallpaper.loadWallpaper',
                            url,
                        )
                    "
                >
                    loadWallpaper
                </button>
                <button class="button" @click="_agent.call('wallpaper.detachWindow')">detach</button>
                <button class="button" @click="_agent.call('wallpaper.refreshWindow')">refresh</button>
                <button class="button" @click="_agent.call('wallpaper.closeWallpaper')">close</button>
            </div>
        </div>
    </div>
</template>
