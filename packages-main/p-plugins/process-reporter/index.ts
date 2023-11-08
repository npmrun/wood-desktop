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
    .map(() => rxjs.Observable.fromPromise(exports.getAppUsage(pid)))
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