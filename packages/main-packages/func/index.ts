import { ContainerModule } from "inversify";
import { Func } from "./Func";

export default new ContainerModule((bind) => {
    bind(Func).toConstantValue(new Func()) // 单例，立即初始化
})

export {
    Func
}