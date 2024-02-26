<script setup lang="ts">
import { Splitpanes, Pane } from "splitpanes"
import { panelEl, titleHeightPercent } from "./data"
import { titleWidthPercent, panelWidthSizes } from "./data2"

function handleWidthResize(event: { size: number }[]) {
    panelWidthSizes.value = event.map(({ size }) => size)
}
</script>

<template>
    <Splitpanes ref="panelEl" style="height: 100%" @resized="handleWidthResize">
        <Pane :min-size="titleWidthPercent" :size="panelWidthSizes[0]">
            111
        </Pane>
        <Pane :min-size="titleWidthPercent" :size="panelWidthSizes[1]">
            222
        </Pane>
        <Pane :size="panelWidthSizes[2]">
            <slot></slot>
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
</style>
