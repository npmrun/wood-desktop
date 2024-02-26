class _MessageManager {
    private constructor() { }
    static instance: null | _MessageManager = null
    static getInstance() {
        if (_MessageManager.instance == null) {
            _MessageManager.instance = new _MessageManager()
        }
        return _MessageManager.instance
    }

    broadcast(event: string, ...args: any[]) {
        if (!event) return
        return _agent.send(event, ...args)
    }
}

export const MessageManager = _MessageManager.getInstance()