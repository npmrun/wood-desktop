// eslint-disable-next-line no-restricted-imports
import {
    defineConfig,
    presetAttributify,
    presetUno,
    transformerDirectives,
} from 'unocss'

export default defineConfig({
    presets: [
        presetAttributify(),
        presetUno(),
    ],
    transformers: [
        transformerDirectives()
    ]
})
