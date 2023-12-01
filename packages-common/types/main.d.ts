// import "inversify"

// declare module "inversify" {
//     interface ContainerModule {
//         $name: any
//     }
// }

/// <reference types="@types/webpack-env" />

// declare const __static: string
// declare const __public: string
declare const __appAsarDir: string
declare const __appStatic: string
declare const __extra: string
declare const __buildAssets: string
// declare const logger: import("electron-log").LogFunctions;
// declare const loggerMain: import("electron-log").LogFunctions;

// declare interface global {
//     logger: import("electron-log").LogFunctions;
//     loggerMain: import("electron-log").LogFunctions;
// }

declare var logger: import("electron-log").LogFunctions;
declare var loggerMain: import("electron-log").LogFunctions;

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
