import path from "path"

export { default as setting } from "../../setting"

declare const __buildAssets: string
export const appIconPath = path.join(__buildAssets, "/icons/180x180.png")
export const appTrayPath = path.join(__buildAssets, "/icons/120x120.png")

export const isDev = process.env.NODE_ENV === "development"
export const isProd = !isDev

function whichPlatform() {
    var platform = process.platform
    switch (platform) {
        case "aix":
            return "IBM AIX"
        case "darwin":
            return "MacOS"
        case "freebsd":
            return "FreeBSD"
        case "linux":
            return "Linux"
        case "openbsd":
            return "OpenBSD"
        case "sunos":
            return "SunOS"
        case "win32":
            return "windows"
        default:
            return "unknown"
    }
}
export const platform = whichPlatform()

export function isPromise(value: Function) {
    return value && Object.prototype.toString.call(value) === "[object Promise]"
}
