import { UserConfig, ConfigEnv } from "vite"
import Icons from "unplugin-icons/vite"

export default function getConfig({ command, mode }: ConfigEnv): UserConfig {
    return {
        plugins: [
            Icons({
                compiler: "vue3",
            }),
        ]
    }
}