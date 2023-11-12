import '@unocss/reset/sanitize/sanitize.css'
import '@unocss/reset/sanitize/assets.css'
import 'uno.css'
import 'virtual:unocss-devtools'
import '@/assets/style/common.scss'
import 'splitpanes/dist/splitpanes.css'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
logger