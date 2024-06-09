// import "inversify"

// declare module "inversify" {
//     interface ContainerModule {
//         $name: any
//     }
// }

/// <reference types="@types/webpack-env" />

// declare const __static: string
// declare const __public: string
/**
 * 只在开发时有用，表示根目录，仅用于开发时测试
 * 注意在生产环境不要使用
 */
declare const __root: string
declare const __appAsarDir: string
declare const __appStatic: string
declare const __extra: string
declare const __buildAssets: string
// declare const logger: import("electron-log").LogFunctions;

// declare interface global {
//     logger: import("electron-log").LogFunctions;
// }

// declare var logger: import("electron-log").LogFunctions;
declare var logger: import("electron-log").Logger;

declare namespace Electron {
    interface WebContents {
        /**
         * 来源窗口名字
         */
        $$senderName: string
    }

    interface BrowserWindow {
        $$opts: any
        $$lastChoice: number
        $$forceClose: boolean
    }
}
