interface IOptions {
    autoRun: boolean
}

export function useTime(opts?: Partial<IOptions>) {
    const curTime = ref<Date>(new Date())
    function callFn() {
        curTime.value = new Date()
        let offetTime = 1000 - curTime.value.getMilliseconds() // 当前1秒内剩余毫秒数
        setTimeout(() => {
            callFn()
        }, offetTime)
    }

    opts?.autoRun && callFn()

    return {
        callFn,
        curTime,
    }
}
