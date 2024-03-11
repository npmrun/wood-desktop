import { reactive } from "vue"

export default function useFormData<M extends object extends infer U ? U : M>(initFormData: M) {
    let formData = reactive<M>(Object.assign({}, initFormData))
    function reset() {
        formData = Object.assign(formData, initFormData)
    }
    return {
        formData,
        reset,
    }
}
