import { Settings } from "@rush/main-config"

export async function keys(key) {
    return Settings.values(key)
}