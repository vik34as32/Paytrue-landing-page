import type { BiometricDeviceType } from "@/src/types/biometric";

const PREFIX = "[Biometric RD]";

export function bioLog(device: BiometricDeviceType, ...args: unknown[]): void {
  if (typeof console !== "undefined") {
    console.log(PREFIX, `Selected Device: ${device}`, ...args);
  }
}

export function bioWarn(device: BiometricDeviceType, ...args: unknown[]): void {
  if (typeof console !== "undefined") {
    console.warn(PREFIX, `Selected Device: ${device}`, ...args);
  }
}

export function bioError(device: BiometricDeviceType, ...args: unknown[]): void {
  if (typeof console !== "undefined") {
    console.error(PREFIX, `Selected Device: ${device}`, ...args);
  }
}

export function bioLogAttempt(
  device: BiometricDeviceType,
  protocol: string,
  host: string,
  port: number,
  method: string,
  path: string
): void {
  bioLog(device, `Trying ${protocol.toUpperCase()} ...`);
  bioLog(device, `Trying Port ${port} ...`);
  bioLog(device, `Trying RD URL ${protocol}://${host}:${port}${path} (${method})`);
}
