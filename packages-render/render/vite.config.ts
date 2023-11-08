import { defineConfig, ConfigEnv, UserConfigExport } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

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
    plugins: [vue()],
  })

}
