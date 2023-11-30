import '@unocss/reset/tailwind.css'
import '@unocss/reset/sanitize/sanitize.css'
import '@unocss/reset/sanitize/assets.css'
import 'uno.css'
import 'virtual:unocss-devtools'
import 'splitpanes/dist/splitpanes.css'
import '@/assets/style/common.scss'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
