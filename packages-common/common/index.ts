import zh from "./languages/zh.json"
import en from "./languages/en.json"

// https://vue-i18n.intlify.dev/guide/essentials/datetime.html
const datetimeFormats = {
    'en': {
        short: {
            year: 'numeric', month: 'short', day: 'numeric'
        },
        long: {
            year: 'numeric', month: 'short', day: 'numeric',
            weekday: 'short', hour: 'numeric', minute: 'numeric'
        }
    },
    'zh': {
        short: {
            year: 'numeric', month: 'short', day: 'numeric'
        },
        long: {
            year: 'numeric', month: 'short', day: 'numeric',
            weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: true
        }
    }
}

export {
    zh,
    en,
    datetimeFormats
}
