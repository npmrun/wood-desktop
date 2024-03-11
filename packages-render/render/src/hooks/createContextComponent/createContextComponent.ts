import { defineComponent, provide, computed, inject, type PropType, type ComputedRef } from "vue"

export function createContextComponent<T>(defaultValue: T) {
    const KEY = Symbol("CREATE_CONTEXT_KEY")
    const Provider = defineComponent({
        props: {
            value: {
                type: [Object, Number, String, Boolean, null, undefined, Function] as PropType<T>,
                required: true,
            },
        },
        setup(props, ctx) {
            provide(
                KEY,
                computed(() => props.value || defaultValue),
            )
            return () => ctx.slots.default?.()
        },
    })

    const useContext = () => inject<ComputedRef<T>>(KEY) || computed(() => defaultValue)

    const Consumer = defineComponent({
        setup(props, ctx) {
            const value = useContext()
            return () => ctx.slots.default?.(value.value)
        },
    })

    return {
        Provider,
        Consumer,
        useContext,
    }
}
