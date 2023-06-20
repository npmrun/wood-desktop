export abstract class Base {
    constructor() {}
    abstract windowAllClosed(): void
    abstract activate(event: Electron.Event, hasVisibleWindows: boolean): void
    abstract beforeQuit(event: Electron.Event): void
    abstract whenReady(event: Electron.Event, launchInfo: Record<string, any> | Electron.NotificationResponse): void
    abstract secondInstance(
        event: Electron.Event,
        argv: string[],
        workingDirectory: string,
        additionalData: unknown,
    ): void
}
