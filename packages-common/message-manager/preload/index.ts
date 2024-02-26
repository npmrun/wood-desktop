import { ipcRenderer } from "electron"
import { BIND_WINDOW } from "../common";

class _MessageManager {
    private constructor() { }
    static instance: null | _MessageManager = null
    static getInstance() {
        if (_MessageManager.instance == null) {
            _MessageManager.instance = new _MessageManager()
        }
        return _MessageManager.instance
    }
    init() {
        ipcRenderer.send(BIND_WINDOW)
    }
}

export const MessageManager = _MessageManager.getInstance()