type IConfig = typeof import("./config.json")['default_config'] & {
    language: "zh" | "en" // i18n
    "common.theme": "light" | "dark" | "auto" // 主题
    "desktop:wallpaper": string
    "update.repo"?: string // 更新地址
    "update.owner"?: string // 更新通道
    "update.allowDowngrade": boolean,
    "update.allowPrerelease": boolean
    "editor.bg": string // 更新通道
    "editor.logoType": "logo" | "bg" // 更新通道
    "editor.fontFamily": string // 更新通道
    // "snippet.storagePath": string // 代码片段保存位置
    // "bookmark.storagePath": string // 书签保存位置
    // backup_rule: string // 备份规则
    storagePath: string // 存储地址
}