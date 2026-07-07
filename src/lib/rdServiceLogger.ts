/**
 * Mantra L1 RD Service logger — all discovery/capture attempts go to console.
 * Prefix: [RD Service]
 */

const PREFIX = "[RD Service]";

export function rdLog(...args: unknown[]): void {
  if (typeof console !== "undefined") {
    console.log(PREFIX, ...args);
  }
}

export function rdWarn(...args: unknown[]): void {
  if (typeof console !== "undefined") {
    console.warn(PREFIX, ...args);
  }
}

export function rdError(...args: unknown[]): void {
  if (typeof console !== "undefined") {
    console.error(PREFIX, ...args);
  }
}

export function rdLogAttempt(
  protocol: string,
  host: string,
  port: number,
  method: string,
  path: string
): void {
  rdLog(`Trying ${protocol.toUpperCase()} ...`);
  rdLog(`Trying Port ${port} ...`);
  rdLog(`Trying RD URL ${protocol}://${host}:${port}${path} (${method})`);
}

export function rdLogResult(
  label: string,
  detail: Record<string, unknown>
): void {
  rdLog(label, detail);
}
