/**
 * Soft-connect retry for an optional host plugin that may finish loading after us,
 * and may hot-reload later (new `api` object). Keeps a keepalive poll so disconnect /
 * host reload is detected even when layout-change does not fire again.
 */
export function softConnectWithRetry(
  tryConnect: () => boolean,
  opts: {
    registerInterval: (id: number) => number;
    onLayoutChange: (cb: () => void) => void;
    /** Keepalive / hunt interval. Default 1000ms. */
    intervalMs?: number;
    setIntervalFn?: (handler: () => void, timeout?: number) => number;
    clearIntervalFn?: (id: number) => void;
  },
): void {
  const intervalMs = opts.intervalMs ?? 1000;
  const setIntervalFn =
    opts.setIntervalFn ?? ((handler, timeout) => window.setInterval(handler, timeout));

  tryConnect();

  const handle = setIntervalFn(() => {
    tryConnect();
  }, intervalMs);
  opts.registerInterval(handle);

  opts.onLayoutChange(() => {
    tryConnect();
  });
}
