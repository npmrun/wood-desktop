import { defineConfig, ConfigEnv, UserConfigExport } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import UnoCSS from 'unocss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { createHtmlPlugin } from "vite-plugin-html"

const port = process.env.PORT ?? 3344

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
      vue(),
      UnoCSS(),
      tsconfigPaths(),
      createHtmlPlugin({
        minify: isProd,
        pages: [
          {
            entry: "src/main.ts",
            filename: "index.html",
            template: "index.html",
            injectOptions: {
              data: {
                // title: setting.app_title,
                // scheme_file: setting.app_scheme + "-file",
              },
            },
          },
          {
            filename: "about.html",
            template: "about.html",
            injectOptions: {
              data: {
                // title: setting.app_title,
                // scheme_file: setting.app_scheme + "-file",
              },
            },
          },
        ]
      })
    ],
  })

}
