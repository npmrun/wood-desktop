// import "inversify"

// declare module "inversify" {
//     interface ContainerModule {
//         $name: any
//     }
// }

/// <reference types="@types/webpack-env" />

// declare const __static: string
// declare const __public: string
declare const __appStatic: string
declare const __extra: string
declare const __buildAssets: string

declare namespace Electron {
    interface WebContents{
        /**
         * 来源窗口名字
         */
        $senderName: string
    }
}