import WindowManager from "@rush/main-window-manager"

export const createWindow = (opts)=>{
    console.log(opts);
    
    WindowManager.showWindow("_blank", opts)
}
