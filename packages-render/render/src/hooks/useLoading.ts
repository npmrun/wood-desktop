export function useLoading() {
    const isLoading = ref(false)
    enum ELoadingStatus {
        idle = 0,
        clientLoading = 1,
        loading = 2
    }
    const LoadnigStatus = ref(ELoadingStatus.idle)
    let timer: NodeJS.Timeout | null = null

    function reset() {
        timer && clearTimeout(timer)
        timer = null
        LoadnigStatus.value = ELoadingStatus.idle
    }

    // 1000ms内没有执行成功则出现加载框
    watch(
        () => isLoading.value,
        () => {
            if (isLoading.value) {
                timer && clearTimeout(timer)
                timer = null
                LoadnigStatus.value = ELoadingStatus.clientLoading
                timer = setTimeout(() => {
                    LoadnigStatus.value = ELoadingStatus.loading
                }, 1000)
            } else {
                reset()
            }
        },
        { immediate: true },
    )
    return {
        isLoading,
        LoadnigStatus,
        ELoadingStatus,
    }
}