import { createContextComponent } from "@/hooks/createContextComponent"
import { createContext, useContext } from "@/hooks/useContext"
import { INiuTreeData, INiuTreeKey } from "princess-ui"
import { InjectionKey } from "vue"

export const DataContext = createContextComponent({})

export interface IHomeData {
    state: IHomeState
    dialogState: IHomeDialogState
}
interface IHomeDialogState<T = any> {
    show: boolean
    isEdit: boolean
    tempData?: INiuTreeData<T>
    formData: {
        title: string
        url: string
        favicon: string
    }
    resetFormData: () => void
}
interface IHomeState {
    filetree: any[]
    openKey?: INiuTreeKey
    focusKey?: INiuTreeKey
    activeKeys: INiuTreeKey[]
    isFocus?: boolean
    filetreeMap: Record<INiuTreeKey, any>
}

const Token: InjectionKey<IHomeData> = Symbol()
const [createHomeContext, useHomeContext] = createInjectionState<[IHomeData], IHomeData>(
    initialValue => {
        return isReactive(initialValue) ? initialValue : reactive(initialValue)
    },
    {
        injectionKey: Token,
    },
)
export { createHomeContext, useHomeContext }
// export function createHomeContext(data: IHomeData) {
//     return createContext(data, Token, { native: true, readonly: false })
// }

// export function useHomeContext() {
//     return useContext(Token)
// }
