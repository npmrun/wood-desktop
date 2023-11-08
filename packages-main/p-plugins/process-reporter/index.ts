import memoize from "memoizee"
import electron from "electron"
import pidtree from "pidtree"
import pidusage from "pidusage"
import rxjs from "rxjs"
import extractURLDomain from "./extractURLDomain"


export function getAppUsage(pid: string | number) {
    return pidtree(pid, { root: true })
        .then(pidusage)
        .then((usages) => Object.values(usages).filter(Boolean));
}


let getSharedProcessMetricsPollerByPid = (pid, samplingInterval) => rxjs.Observable.timer(0, samplingInterval)
    .map(() => rxjs.Observable.fromPromise(getAppUsage(pid)))
    .mergeAll()
    .share();
getSharedProcessMetricsPollerByPid = memoize(getSharedProcessMetricsPollerByPid);

let getSharedProcessMetricsPollerByApp = (app, samplingInterval) => rxjs.Observable.timer(0, samplingInterval)
    .map(() => app.getAppMetrics())
    .share();
getSharedProcessMetricsPollerByApp = memoize(getSharedProcessMetricsPollerByApp);

/**
 * Returns an Observable that emits Electron.ProcessMetric[] on a regular interval.
 *
 * For a given `app` and a given `samplingInterval`, the returned observable is shared
 * for performance reasons.
 *
 * options.samplingInterval = 1000 (1s) by default
 * @param app
 * @param options
 */
export function onProcessMetrics(app, options) {
    options = Object.assign({ samplingInterval: 1000 }, options);
    return getSharedProcessMetricsPollerByApp(app, options.samplingInterval);
}

/**
 * Returns an Rx.Observable that emits `PidUsage[]` every `options.samplingInterval` ms.
 *
 * For a given `pid` and a given `samplingInterval`, the returned observable is shared
 * for performance reasons.
 * `pid` is the root of the process tree.
 *
 * @param pid
 * @param {object} options
 * @param {number} options.samplingInterval - 1000 (1s) by default
 *
 * @example
 * - pid: main process
 *   - rendererPid1: renderer process
 *   - rendererPid2: renderer process
 */
export function onProcessTreeMetricsForPid(pid, options) {
    options = Object.assign({ samplingInterval: 1000 }, options);
    return getSharedProcessMetricsPollerByPid(pid, options.samplingInterval);
}

function getExtendedAppMetrics(appMetrics) {
    const allWebContents = electron.webContents.getAllWebContents();
    const webContentsInfo = allWebContents.map((wc) => ({
        type: wc.getType(),
        id: wc.id,
        pid: wc.getOSProcessId(),
        URL: wc.getURL(),
        URLDomain: extractURLDomain(wc.getURL()),
    }));
    return appMetrics.map(proc => {
        const report = proc;
        const wc = webContentsInfo.find(wc => wc.pid === proc.pid);
        if (!wc)
            return report;
        report.webContents = [wc];
        return report;
    });
}

/**
 * Returns an Rx.Observable that emits reports of `ExtendedProcessMetric`
 * every `options.samplingInterval` ms.
 *
 * Default `options.samplingInterval` = 1000ms
 *
 * Compared to `onProcessMetrics` it adds data on the `webContents` associated
 * to the given process.
 *
 * @param app the electron app instance
 * @param options
 */
export function onExtendedProcessMetrics(app, options = {}) {
    return onProcessMetrics(app, options).map(getExtendedAppMetrics)
}

/**
 * Will emit an array of `PidUsage` when a process of the tree exceeds the
 * `options.percentCPUUsageThreshold` on more than `options.samplesCount`
 * samples.
 * It monitors the whole tree of pids, starting from `childPid`.
 * The reason behind this is that the `process.pid` of the main process is at the same
 * level as all renderers.
 * So we fetch their common ancestor, which is the `ppid` of the main process.
 * The parent pid of `childPid` is not part of the end result
 * (that way, we monitor the same processes as `getAppMetrics`).
 *
 * In opposite to onExcessiveCPUUsage, onExcessiveCPUUsageInProcessTree does not use
 * Electron's internal measurement but rather use `pidusage`, a cross-platform
 * process cpu % and memory usage of a PID. It is known to have lower pressure on CPU.
 * Also, as this leverage `pidusage`, the measures on Windows can be considered
 * as not accurate.
 *
 * Default `options.samplesCount` = 10
 * Default `options.percentCPUUsageThreshold` = 80
 *
 * @param pid - the pid of the main process
 * @param options
 */
export function onExcessiveCPUUsageInProcessTree(pid, options) {
    options = Object.assign({ samplesCount: 10, percentCPUUsageThreshold: 80 }, options);
    return onProcessTreeMetricsForPid(pid, options)
        .map((appUsage:any) => rxjs.Observable.from(appUsage))
        .mergeAll()
        .groupBy((appUsage:any) => appUsage.pid)
        .map(g => g.bufferCount(options.samplesCount))
        .mergeAll()
        .filter(processMetricsSamples => {
            const excessiveSamplesCount = processMetricsSamples.filter(p => p.cpu >= options.percentCPUUsageThreshold).length;
            return excessiveSamplesCount === processMetricsSamples.length;
        });
}

/**
 * Will emit an array `ExtendedProcessMetric` when a process exceeds the
 * `options.percentCPUUsageThreshold` on more than `options.samplesCount`
 * samples.
 *
 * Default `options.samplesCount` = 10
 * Default `options.percentCPUUsageThreshold` = 80
 *
 * @param app the electron app instance
 * @param options
 */
export function onExcessiveCPUUsage(app, options) {
    options = Object.assign({ samplesCount: 10, percentCPUUsageThreshold: 80 }, options);
    return onExtendedProcessMetrics(app, options)
        .map(report => rxjs.Observable.from(report))
        .mergeAll()
        .groupBy((processMetric: any) => processMetric.pid)
        .map(g => g.bufferCount(options.samplesCount))
        .mergeAll()
        .filter(processMetricsSamples => {
            const excessiveSamplesCount = processMetricsSamples.filter(p => p.cpu.percentCPUUsage >= options.percentCPUUsageThreshold).length;
            return excessiveSamplesCount == processMetricsSamples.length;
        });
}