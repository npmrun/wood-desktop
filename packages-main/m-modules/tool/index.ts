import { broadcast } from "./broadcast"

export { broadcast }

export const isDev = process.env.NODE_ENV === "development"
export const isProd = !isDev

export function getFileUrl(app: string = "", route: string = "") {
    const winURL =
        process.env.NODE_ENV === "development"
            ? `http://localhost:${process.env.PORT}/${app}#/${route}`
            : `file://${__dirname}/${app}#/${route}`
    return winURL
}


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