

import { Plugin } from "vite"
import Icons from "unplugin-icons/vite"

// https://www.npmjs.com/package/unplugin-icons
// 为vite项目提供图标

export default function IconsPlugin(): Plugin | Plugin[] {
    return Icons({
        compiler: "vue3",
    })
}