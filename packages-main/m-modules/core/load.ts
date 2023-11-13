import { Container } from "inversify"
// import SettingsModule, { Settings } from "@rush/main-config"

const container = new Container()

const containerMap = {
    // get Settings() {
    //     return container.get(Settings)
    // },
}
// container.load(SettingsModule)

export {
    container,
    containerMap
}

