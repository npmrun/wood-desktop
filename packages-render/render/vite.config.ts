import { defineConfig, ConfigEnv, UserConfigExport } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path"
import UnoCSS from 'unocss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { createHtmlPlugin } from "vite-plugin-html"
import Pages from "vite-plugin-pages"
import Layouts from "vite-plugin-vue-layouts"
import AutoImport from "unplugin-auto-import/vite"
import { createSvgIconsPlugin } from "vite-plugin-svg-icons"
import setting from "@buildin/config"
import vueI18n from "@intlify/unplugin-vue-i18n/vite"
import monacoEditorPlugin from "vite-plugin-monaco-editor"
import Components from 'unplugin-vue-components/vite'

const port = process.env.PORT ?? 3344

import PrincessResolver from "princess-ui/PrincessResolver"

// https://vitejs.dev/config/
export default ({ command, mode }: ConfigEnv): UserConfigExport => {
  let isProd = mode === "production"
  let isDev = mode === "development"

  return defineConfig({
    root: __dirname,
    base: "./",
    server: {
      port: +port
    },
    build: {
      outDir: path.resolve(__dirname, "../../dist/electron"),
      sourcemap: false, // 为true时会导致v8内存溢出
      chunkSizeWarningLimit: 1024,
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: isProd,
          drop_debugger: isProd,
        },
      },
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: tag => ["webview"].includes(tag),
          },
        },
      }),
      vueI18n({
        compositionOnly: false,
        include: path.resolve(__dirname, "../../packages-common/common/languages/**"),
      }),
      UnoCSS(),
      tsconfigPaths({
        loose: true
      }),
      AutoImport({
        include: [/\.[tj]sx?$/, /\.vue\??/],
        exclude: [/node_modules/, /\.git/, /muya/], // muya会被自动插入h导致报错 /^_/, 
        imports: ["vue", "vue-router", "pinia", "@vueuse/core", "vue-i18n"],
        dts: "auto-import.d.ts",
        dirs: ["src/hooks", "src/store/module"],
      }),
      Components({
        dirs: ['src/componentsAuto','src/pages-ui'],
        resolvers: [PrincessResolver()],
      }),
      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [path.resolve(__dirname, "src/assets/icons")],
        // 指定symbolId格式
        symbolId: "icon-[dir]-[name]",
      }),
      monacoEditorPlugin({
        publicPath: "monacoeditorwork",
        customDistPath() {
          return path.resolve(__dirname, "../../dist/electron/monacoeditorwork")
        },
      }),
      Pages({
        dirs: [{ dir: path.resolve(__dirname, "src/pages"), baseRoute: "" }],
        exclude: ["**/_components/*.vue", "**/_ui/*.vue", "**/*copy.vue"],
        onRoutesGenerated(routes) {
          routes.push({
            path: "",
            redirect: "/home",
          })
          return routes
        },
      }),
      Layouts({
        layoutsDirs: path.resolve(__dirname, "src/layouts"),
        defaultLayout: "base",
      }),
      createHtmlPlugin({
        minify: isProd,
        pages: [
          {
            entry: "src/main.ts",
            filename: "index.html",
            template: "index.html",
            injectOptions: {
              data: {
                title: setting.app_title,
                scheme_file: setting.app_scheme + "-file",
              },
            },
          },
          {
            filename: "about.html",
            template: "about.html",
            injectOptions: {
              data: {
                title: setting.app_title,
                scheme_file: setting.app_scheme + "-file",
              },
            },
          },
        ]
      })
    ],
  })

}
