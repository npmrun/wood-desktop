import '@unocss/reset/tailwind.css'
import '@unocss/reset/tailwind-compat.css'
import '@unocss/reset/sanitize/sanitize.css'
import '@unocss/reset/sanitize/assets.css'
import 'uno.css'
import 'bulma'
import 'virtual:unocss-devtools'
import '@/assets/style/common.scss'
import i18n from "@/i18n"
import 'virtual:svg-icons-register'

import router from "@/router"
import pinia from "@/store"

import { createApp } from 'vue'
import App from './App.vue'

import Vue3Toasity from "vue3-toastify"
import "vue3-toastify/dist/index.css"

const app = createApp(App)
app.use(Vue3Toasity, {
    hideProgressBar: true,
    autoClose: 3000,
})
app.use(pinia)
app.use(router)
app.use(i18n)
app.mount('#app')
