import { createI18n } from 'vue-i18n'
import messages from '@intlify/unplugin-vue-i18n/messages'
import { datetimeFormats } from "@rush/common" // 引入以便热更新同时提供datetimeFormats

// https://vue-i18n.intlify.dev/guide/essentials/syntax.html

let locale = 'zh'

const curConfig = useGetConfig()
if (curConfig.value.language) {
    locale = curConfig.value.language
}

console.log(locale);
console.log(messages);

const i18n = createI18n({
    legacy: true,
    allowComposition: true,
    locale: locale,
    messages: messages,
    // @ts-ignore
    datetimeFormats,
})

export { i18n }
export default i18n