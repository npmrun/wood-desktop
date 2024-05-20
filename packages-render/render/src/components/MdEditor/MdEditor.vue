<template>
    <div id="editor"></div>
</template>

<script lang="ts" setup>
import MD5 from 'md5';
import { uniqueId } from 'lodash';
import Vditor from 'vditor'
import config from '@buildin/config'
import "vditor/dist/index.css"

const props = defineProps<{
    modelValue: string,
}>()

const emits = defineEmits<{
    (ev: "update:modelValue", value: string): void
}>()

let contextEditor: Vditor | null = null
onMounted(() => {
    contextEditor = new Vditor("editor", {
        height: '100%',
        preview: {
            markdown: {
                // codeBlockPreview: false
            }
        },
        mode: "wysiwyg",
        toolbarConfig: {
            pin: true,
        },
        input(value) {
            emits("update:modelValue", value)
        },
        cache: {
            enable: false,
        },
        after: () => {
            contextEditor?.setValue(props.modelValue)
        },
        link: {
            async click(bom) {
                const url = bom.getAttribute("href")
                const path = await _agent.call("api.config.keys", "storagePath")
                const targetPath = "file:\\\\" + path + `/file/` + url!.replace(new RegExp(`${config.app_scheme}-file\:\/\/`), "")
                _agent.call("utils.showItemInFolder", targetPath)
            }
        },
        upload: {
            handler(files) {
                const uploadPromise = []
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    uploadPromise.push(new Promise((resolve) => {
                        var reader = new FileReader();
                        reader.readAsArrayBuffer(file)
                        reader.onload = async function () {
                            var buf = new Uint8Array(reader.result as ArrayBuffer);
                            const path = await _agent.call("api.config.keys", "storagePath")
                            const t = new Date().getTime() as unknown as string
                            // @ts-ignore
                            const fileName = file.name as string
                            let ext = fileName.split(".")[fileName.split(".").length - 1]
                            const name = uniqueId() + "_T_" + MD5(t).toString().toUpperCase() + "_" + encodeURIComponent(fileName)
                            if (ext.toLowerCase() === "jpg" || ext.toLowerCase() === "png" || ext.toLowerCase() === "jpeg") {
                                const targetPath = path + `/file/asset/image/${name}`
                                await _agent.file.savaFileByData(targetPath, buf)
                                contextEditor?.insertValue(`![](${config.app_scheme}-file://asset/image/${name})`)
                            } else {
                                const targetPath = path + `/file/asset/file/${name}`
                                await _agent.file.savaFileByData(targetPath, buf)
                                contextEditor?.insertValue(`[${fileName}](${config.app_scheme}-file://asset/file/${name})`)
                            }
                            resolve(null);
                        }
                    }))
                }
                Promise.allSettled(uploadPromise)
                return null
            }
        }
    })
})
onBeforeUnmount(() => {
    contextEditor?.destroy()
})
</script>