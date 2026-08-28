export function createSlotSpinQueue() {
  let tail = Promise.resolve();
  let pending = 0;

  const run = (task) => {
    if (typeof task !== 'function') return Promise.reject(new TypeError('Spin task must be a function'));
    pending += 1;
    const execute = tail.then(() => task());
    tail = execute.catch(() => {});
    return execute.finally(() => { pending = Math.max(0, pending - 1); });
  };

  return {
    run,
    get pending() { return pending; },
    get busy() { return pending > 0; },
    clear() { tail = Promise.resolve(); pending = 0; },
  };
}
