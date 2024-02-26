import { Settings } from "@rush/main-config"

/**
 * 获取配置项的值
 * @param value 配置项Key
 * @returns 配置项Key的值
 */
export function get(value?: keyof IConfig) {
    if (value) {
        return Settings.values(value)
    }
    return Settings.config()
}

/**
 * 保存配置项
 * @param key 配置项Key或者配置对象
 * @param value 可选：为配置对象时可不填
 */
export function save(key: keyof IConfig | Partial<IConfig>, value?: any) {
    Settings.set(key, value)
}
