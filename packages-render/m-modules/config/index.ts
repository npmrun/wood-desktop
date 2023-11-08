import { UserConfig, ConfigEnv, Plugin } from "vite"
import Icons from "./plugins/icons"


export default function getConfig({ command, mode }: ConfigEnv): UserConfig {

    const plugins: (Plugin | Plugin[])[] = []

    plugins.push(Icons())

    return {
        plugins
    }
}