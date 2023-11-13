<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes'
// import Test from "./test.vue"
import { onMounted } from 'vue';
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
    const muya = new Muya(container, {
        markdown: `## HELOO`,
    })
    muya.locale(zh);

    muya.init();
})
</script>

<template>
    <Splitpanes style="height: 100%;">
        <Pane min-size="20" max-size="30" size="20">
            <div h-full border-r border-r-solid border-red bg-gray>
                <i
                    style='width:16px;height:16px;display:inline-block;background: url("/@fs/D:/@code/@project/electron-template/node_modules/.pnpm/@marktext+muya@0.2.3/node_modules/@marktext/muya/dist/assets/icons/5e68b273687eed0d.png") 0% 0% / 100% no-repeat;'></i>
            </div>
        </Pane>
        <Pane>
            <Splitpanes class="default-theme" horizontal>
                <Pane>2</Pane>
                <Pane>3</Pane>
                <Pane>4</Pane>
            </Splitpanes>
        </Pane>
        <Pane>
            <div class="editor-container">
                <div id="editor"></div>
            </div>
            <!-- <Test></Test> -->
        </Pane>
    </Splitpanes>
</template>

<style lang="scss">
.editor-container {
    height: 100%;
    overflow: auto;
    position: relative;
}

#editor {
    box-sizing: border-box;
    width: 100%;
    font-size: 16px;
    outline: none;
    position: relative;

    .icon {
        box-sizing: content-box !important;
    }
}

.mu-quick-insert .icon-container>i.icon {
    overflow: hidden;
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