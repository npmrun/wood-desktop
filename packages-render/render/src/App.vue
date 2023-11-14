<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes'
// import Test from "./test.vue"
import { onMounted, ref } from 'vue';
import Muya from '@marktext/muya'
// import MD2Html from '@marktext/muya/dist/state/markdownToHtml'
import zh from '@marktext/muya/dist/locales/zh'
import '@marktext/muya/dist/assets/style.css'
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
} from "@marktext/muya/dist/ui/index";

let muya: Muya
onMounted(() => {
    const imagePathPicker = async () => {
        return "https://pics.ettoday.net/images/2253/d2253152.jpg";
    };

    const imageAction = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve("https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg");
            }, 3000);
        });
    };
    Muya.use(EmojiSelector);
    Muya.use(InlineFormatToolbar);
    Muya.use(ImageEditTool, {
        imagePathPicker,
        imageAction,
    });
    Muya.use(ImageToolBar);
    Muya.use(ImageResizeBar);
    Muya.use(CodeBlockLanguageSelector);

    Muya.use(ParagraphFrontButton);
    Muya.use(ParagraphFrontMenu);
    Muya.use(TableColumnToolbar);
    Muya.use(ParagraphQuickInsertMenu);
    Muya.use(TableDragBar);
    Muya.use(TableRowColumMenu);
    Muya.use(PreviewToolBar);
    const container = document.querySelector('#editor')
    if(container){
        setTimeout(() => {
            muya = new Muya(container as HTMLElement, {
                markdown: `## HELOO`,
            })
            muya.locale(zh);

            muya.init();
            console.log(muya);
        }, 0);
    }
    
})

function handleUndo() {
    muya?.undo()
}

const res = ref()
function getMdText() {
    if(muya){
        res.value = muya.getMarkdown()
    }
}
</script>

<template>
    <Splitpanes style="height: 100%;">
        <Pane min-size="20" max-size="30" size="20">
            <div h-full>
                1231
            </div>
        </Pane>
        <Pane>
            <Splitpanes horizontal>
                <Pane>
                    <button @click="handleUndo">撤销</button>
                    <button @click="getMdText">获取Md</button>
                </Pane>
                <Pane>{{ res }}</Pane>
                <Pane>4</Pane>
            </Splitpanes>
        </Pane>
        <Pane>
            <div class="editor-container">
                <div id="editor"></div>
            </div>
        </Pane>
    </Splitpanes>
</template>

<style lang="scss">
.editor-container {
    width: 100%;
    height: 100%;
    overflow: auto;
    position: relative;
}

#editor {
    box-sizing: border-box;
    width: 100%;
    font-size: 16px;
    outline: none;

    .icon {
        box-sizing: content-box !important;
    }
}

.icon-container>i.icon {
    overflow: hidden !important;
}
.icon-wrapper>i.icon {
    overflow: hidden !important;
}
// .splitpanes__pane {
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   position: relative;
//   box-shadow: 0 0 3px rgba(0, 0, 0, .2) inset;
// }

// em.specs {
//   font-size: 0.2em;
//   line-height: 1;
//   position: absolute;
//   color: #bbb;
//   bottom: 0.5em;
//   left: 0;
//   right: 0;
//   text-align: center;
// }


// // GENERAL STYLES.
// html, body, #app {height: 100%;margin: 0;}
// body {
//   font-family: Helvetica, Arial, sans-serif;
//   color: rgba(255, 255, 255, 0.6);
//   font-size: 5em;
// }

// // documentation link.
// p {
//   position: absolute;
//   bottom: 5px;
//   right: 5px;
//   color: #666;
//   z-index: 10;
//   font-size: 12px;

//   a {color: inherit;}
// }</style>