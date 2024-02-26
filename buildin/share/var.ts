import { resolve } from "path"

export const rootPath = resolve(__dirname, "../../")
export const commonPkgPath = resolve(__dirname, "../../packages-common")
export const mainPkgPath = resolve(__dirname, "../../packages-main")
export const preloadPkgPath = resolve(__dirname, "../../packages-preload")
export const renderPkgPath = resolve(__dirname, "../../packages-render")

export const distPath = resolve(rootPath, "dist")
export const outPath = resolve(rootPath, "dist/electron")

export const isVite = true
export const viteCMD = resolve(renderPkgPath, "render/node_modules/vite/bin/vite.js")
export const clientCMD = resolve(renderPkgPath, "render")
export const viteConfig = resolve(renderPkgPath, "render/vite.config.ts")

export const electronEntry = resolve(rootPath, "dist/electron/entry.js")

export const mainWebpackDevEntry = resolve(mainPkgPath, "main/index.dev.ts")
export const mainWebpackBuildEntry = resolve(mainPkgPath, "main/index.ts")
export const mainWebpackName = "entry.js"
export const mainWebpackOutput = resolve(rootPath, "dist/electron")
export const mainTsConfig = resolve(mainPkgPath, "main/tsconfig.json")

export const preloadWebpackEntry = {
    preload: resolve(preloadPkgPath, "preload/preload.ts"),
    webview: resolve(preloadPkgPath, "preload/webview.ts"),
}
export const preloadWebpackName = "[name].js"
export const preloadWebpackOutput = resolve(rootPath, "dist/electron")
export const preloadTsConfig = resolve(preloadPkgPath, "preload/tsconfig.json")

export const buildExternals = resolve(rootPath, "dist/package.json")


export function genPathRoot(...argu: string[]): string {
    return resolve(rootPath, ...argu)
}