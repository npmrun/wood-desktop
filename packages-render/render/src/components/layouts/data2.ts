import { computed, ref, watch } from "vue"
import { useElementSize, useLocalStorage } from "@vueuse/core"
import { panelEl } from "./data"

const TITLE_WIDTH = 300
const { width: vw } = useElementSize(panelEl)
const collapsedPanels = ref(new Set())

/**
 * 最小标题的百分比高度
 */
export const titleWidthPercent = computed(() => {
    if (!vw.value)
        return 0
    return TITLE_WIDTH / vw.value * 100
})

/**
 * 最小标题百分比高度的计算
 */
export const panelWidthSizes = useLocalStorage<number[]>(
    'unocss-panel-width',
    getInitialPanelSizes(titleWidthPercent.value),
    { listenToStorageChanges: false },
)

export function getInitialPanelSizes(percent: number): number[] {
    return [
        percent,
        percent,
        100 - percent * 2,
    ]
}

watch(
    panelWidthSizes,
    (value: number[]) => {
        value.forEach((width, idx) => {
            if (width > titleWidthPercent.value)
                collapsedPanels.value.delete(idx)
            else
                collapsedPanels.value.add(idx)
        })
    },
)

watch(
    titleWidthPercent,
    (value: number) => {
        const spareSpace = (100 - collapsedPanels.value.size * value - panelWidthSizes.value.reduce((uncollapsed, width, idx) => collapsedPanels.value.has(idx) ? uncollapsed : uncollapsed + width, 0)) / (panelWidthSizes.value.length - collapsedPanels.value.size)
        panelWidthSizes.value = panelWidthSizes.value.map((width, idx) => (width <= value || collapsedPanels.value.has(idx)) ? value : width + spareSpace)
    },
)