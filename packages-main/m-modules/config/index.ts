import { ContainerModule } from "inversify";
import { Settings } from "./Settings";

export default new ContainerModule((bind) => {
    // bind(Settings).toConstantValue(new Settings()) // 单例，立即初始化
})

export {
    Settings
}