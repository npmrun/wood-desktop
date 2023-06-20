import "virtual:windi.css"
import "virtual:windi-devtools"

import "virtual:svg-icons-register"
import "@/assets/style/common.less"
import "@/assets/style/common.scss"
import 'animate.css';

import { createApp } from "vue"
import App from "./App.vue"

const app = createApp(App)

app.mount("#app")
