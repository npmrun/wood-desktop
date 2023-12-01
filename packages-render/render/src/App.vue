<script setup lang="ts">
import { Splitpanes, Pane } from "splitpanes"
import muyaEditor from "./components/muya-editor.vue"
import { panelEl, titleHeightPercent, panelSizes, isCollapsed } from "./data"
import { titleWidthPercent, panelWidthSizes } from "./data2"

function handleResize(event: { size: number }[]) {
    panelSizes.value = event.map(({ size }) => size)
}

function handleWidthResize(event: { size: number }[]) {
    panelWidthSizes.value = event.map(({ size }) => size)
}
</script>

<template>
    <Splitpanes ref="panelEl" style="height: 100%" @resized="handleWidthResize">
        <Pane :min-size="titleWidthPercent" :size="panelWidthSizes[0]">
            <div h-full>
                {{ titleWidthPercent }}
                {{ panelWidthSizes }}
            </div>
        </Pane>
        <Pane :min-size="titleWidthPercent" :size="panelWidthSizes[1]">
            <Splitpanes horizontal @resized="handleResize">
                <Pane :min-size="titleHeightPercent" :size="panelSizes[0]">
                    <div
                        style="line-height: 1em"
                        border="l y gray/20 solid"
                        text="gray/80"
                        min-h-30px
                        max-h-30px
                        select-none
                        flex
                        all:my-auto
                    >
                        <div p1 flex>
                            <div>
                                sad
                            </div>
                            <div mr-2 op-60 shrink-0>asdadsa</div>
                        </div>
                        <div px1 flex gap-2 flex-auto h-full>
                            <div
                                flex
                                justify-end
                                items-center
                                w-full
                                h-full
                                gap2
                                transition
                                duration-400
                                class
                                un-children="inline-flex items-center cursor-pointer gap-1"
                            >
                                <label>
                                    <input type="checkbox" />
                                    <span text-sm>Transform</span>
                                </label>
                                <div w-1px h-full bg-gray:20></div>
                                <button i-ri-mist-line icon-btn title="Format"></button>
                            </div>
                        </div>
                    </div>
                </Pane>
                <Pane :min-size="titleHeightPercent" :size="panelSizes[1]">
                    <div
                        style="line-height: 1em"
                        border="l y gray/20 solid"
                        text="gray/80"
                        min-h-30px
                        max-h-30px
                        select-none
                        flex
                        all:my-auto
                    >
                        <div p1 flex>
                            <div>图表</div>
                            <div mr-2 op-60 shrink-0>asdadsa</div>
                        </div>
                        <div px1 flex gap-2 flex-auto h-full>
                            <div
                                flex
                                justify-end
                                items-center
                                w-full
                                h-full
                                gap2
                                transition
                                duration-400
                                class
                                un-children="inline-flex items-center cursor-pointer gap-1"
                            >
                                <label>
                                    <input type="checkbox" />
                                    <span text-sm>Transform</span>
                                </label>
                                <div w-1px h-full bg-gray:20></div>
                                <button i-ri-mist-line icon-btn title="Format"></button>
                            </div>
                        </div>
                    </div>
                </Pane>
                <Pane :min-size="titleHeightPercent" :size="panelSizes[2]">
                    <div
                        style="line-height: 1em"
                        border="l y gray/20 solid"
                        text="gray/80"
                        min-h-30px
                        max-h-30px
                        select-none
                        flex
                        all:my-auto
                    >
                        <div p1 flex>
                            <div>图表</div>
                            <div mr-2 op-60 shrink-0>asdadsa</div>
                        </div>
                        <div px1 flex gap-2 flex-auto h-full>
                            <div
                                flex
                                justify-end
                                items-center
                                w-full
                                h-full
                                gap2
                                transition
                                duration-400
                                class
                                un-children="inline-flex items-center cursor-pointer gap-1"
                            >
                                <label>
                                    <input type="checkbox" />
                                    <span text-sm>Transform</span>
                                </label>
                                <div w-1px h-full bg-gray:20></div>
                                <button i-ri-mist-line icon-btn title="Format"></button>
                            </div>
                        </div>
                    </div>
                </Pane>
                <Pane :min-size="titleHeightPercent" :size="panelSizes[3]">
                    <div
                        style="line-height: 1em"
                        border="l y gray/20 solid"
                        text="gray/80"
                        min-h-30px
                        max-h-30px
                        select-none
                        flex
                        all:my-auto
                    >
                        <div p1 flex>
                            <div>图表</div>
                            <div mr-2 op-60 shrink-0>asdadsa</div>
                        </div>
                        <div px1 flex gap-2 flex-auto h-full>
                            <div
                                flex
                                justify-end
                                items-center
                                w-full
                                h-full
                                gap2
                                transition
                                duration-400
                                class
                                un-children="inline-flex items-center cursor-pointer gap-1"
                            >
                                <label>
                                    <input type="checkbox" />
                                    <span text-sm>Transform</span>
                                </label>
                                <div w-1px h-full bg-gray:20></div>
                                <button i-ri-mist-line icon-btn title="Format"></button>
                            </div>
                        </div>
                    </div>
                </Pane>
            </Splitpanes>
        </Pane>
        <Pane :size="panelWidthSizes[2]">
            <muyaEditor></muyaEditor>
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

.icon-container > i.icon {
    overflow: hidden !important;
}
.icon-wrapper > i.icon {
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
// }
</style>
