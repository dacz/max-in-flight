/**
 *
 * Utilizes max. async running operations
 * eg. max concurrent calls to http endpoint
 *
 * ## Motivation:
 *
 * I needed to call great amount of requests to http endpoint
 * from different places of my server side app
 * (graphql bridge with huge query running)
 * and I needed to be sure that only X requests will be in flight
 *
 * There are other solutions when you have existing array of async
 * functions to call and you need to limit their processing (starting)
 *
 * This was not the case, I needed kind of FIFO queue for such calls.
 *
 * And it was fun to write it.
 *
 * ## How to use it:
 *
 * import maxInFlight from 'maxInFlight';
 * // limit number of max. concurrent async operation
 * const defer = maxInFlight(3).deferCall;
 *
 * async function() {
 *   const result = await defer(
 *     fetch,
 *     'http://some.com', ... any other args for fetch ...);
 * }
 *
 * alternatively you can use it to defer fn
 *
 * const deferFetch = maxInFlight(3).deferFn(fetch);
 *
 * const result = await deferFetch('http://some.com', ...);
 *
 * Error is propagated to the defer so operation may fail
 * and will not take down other operations in flight
 * or any submitted in the future.
 *
 */

export default maxInFlight => {
  let currentInFlight = 0;
  const queue = [];

  // node/browser
  const nextTick = cb =>
    /* istanbul ignore next */
    typeof window !== 'undefined' ? setTimeout(cb, 0) : process.nextTick(cb);

  const runQueue = _ => {
    if (queue.length < 1) return true;
    if (currentInFlight < maxInFlight) {
      const next = queue.shift();
      if (next) {
        const [res, fn] = next;
        currentInFlight++;
        return res(fn());
      }
      return true;
    }
    return true;
  };

  const callWrapper = (fn, ...args) => async _ => {
    try {
      const rv = await fn(...args);
      currentInFlight--;
      nextTick(runQueue);
      return rv;
    } catch (e) {
      currentInFlight--;
      nextTick(runQueue);
      return e;
    }
  };

  const deferCall = (...allArgs) => {
    const prom = new Promise(res => queue.push([res, callWrapper(...allArgs)]));
    nextTick(runQueue);
    return prom;
  };

  const deferFn = fn => (...allArgs) => deferCall(fn, ...allArgs);

  return {
    deferCall,
    deferFn,
  };
};
