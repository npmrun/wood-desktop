import WindowManager from "@rush/main-window-manager"

export const createWindow = (opts)=>{
    WindowManager.showWindow("_blank", opts)
}
