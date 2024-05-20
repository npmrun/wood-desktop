import { defineStore } from "pinia"

interface IPage {
    key: number | string,
    title: string,
    url: string
}

let id = 0
function getID() {
    return ++id
}

let topMenu = [
    { key: getID(), title: "首页", url: "/home" },
    { key: getID(), title: "工具", url: "/tools" },
    { key: getID(), title: "代码片段", url: "/snippet/snippet" },
    { key: getID(), title: "模板", url: "/Template" },
]

if (import.meta.env.DEV) {
    topMenu = topMenu.concat([])
}

export const useGlobalStore = defineStore("global", {
    state: (): { topMenu: IPage[], bottomMenu: IPage[] } => ({
        topMenu: topMenu,
        bottomMenu: [
            { key: getID(), title: "设置", url: "/setting" },
        ]
    }),
    actions: {

    },
})
