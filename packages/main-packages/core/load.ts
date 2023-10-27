import { Container } from "inversify"
import SettingsModule, { Settings } from "@rush/main-config"
import LogModule, { Log } from "@rush/main-log"

const container = new Container()

const containerMap = {
    get Settings() {
        return container.get(Settings)
    },
    get Log() {
        return container.get(Log)
    },
}
container.load(SettingsModule)
container.load(LogModule)

export {
    container,
    containerMap
}

