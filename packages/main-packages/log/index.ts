import { ContainerModule } from "inversify";
import { Log } from "./Log";

export default new ContainerModule((bind) => {
    bind(Log).toConstantValue(new Log()) // 单例，立即初始化
})

export {
    Log
}