<script setup lang="ts">
import { onMounted, watch } from "vue"
import Muya from "@marktext/muya"
// import MD2Html from '@marktext/muya/dist/state/markdownToHtml'
import zh from "@marktext/muya/dist/locales/zh"
import "@marktext/muya/dist/assets/style.css"
import { useMagicKeys } from "@vueuse/core"
import {
    CodeBlockLanguageSelector,
    EmojiSelector,
    ImageEditTool,
    ImageResizeBar,
    ImageToolBar,
    InlineFormatToolbar,
    ParagraphFrontButton,
    ParagraphFrontMenu,
    ParagraphQuickInsertMenu,
    PreviewToolBar,
    TableColumnToolbar,
    TableDragBar,
    TableRowColumMenu,
} from "@marktext/muya/dist/ui/index"

let muya: Muya

const keys = useMagicKeys()
const shiftCtrlA = keys["Ctrl+Z"]

watch(shiftCtrlA, v => {   
    if (v && muya) {
        muya.undo()
    }
})

onMounted(() => {
    const imagePathPicker = async () => {
        return "https://pics.ettoday.net/images/2253/d2253152.jpg"
    }

    const imageAction = async () => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve("https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg")
            }, 3000)
        })
    }
    Muya.use(EmojiSelector)
    Muya.use(InlineFormatToolbar)
    Muya.use(ImageEditTool, {
        imagePathPicker,
        imageAction,
    })
    Muya.use(ImageToolBar)
    Muya.use(ImageResizeBar)
    Muya.use(CodeBlockLanguageSelector)

    Muya.use(ParagraphFrontButton)
    Muya.use(ParagraphFrontMenu)
    Muya.use(TableColumnToolbar)
    Muya.use(ParagraphQuickInsertMenu)
    Muya.use(TableDragBar)
    Muya.use(TableRowColumMenu)
    Muya.use(PreviewToolBar)
    const container = document.querySelector("#editor")
    if (container) {
        setTimeout(() => {
            muya = new Muya(container as HTMLElement, {
                markdown: `## HELOO`,
            })
            muya.locale(zh)

            muya.init()
            console.log(muya)
        }, 0)
    }
})
</script>

<template>
    <div class="editor-container">
        <div id="editor" style="height: 100%"></div>
    </div>
</template>

<style scoped></style>
