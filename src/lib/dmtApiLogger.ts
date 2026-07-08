export interface DmtApiLogEntry {
  id: string;
  apiName: string;
  endpoint: string;
  method: string;
  request?: unknown;
  response?: unknown;
  status: number;
  latencyMs: number;
  success: boolean;
  timestamp: string;
}

const STORAGE_KEY = "dmt_api_logs";
const MAX_LOGS = 200;

function readLogs(): DmtApiLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DmtApiLogEntry[]) : [];
  } catch {
    return [];
  }
}

function writeLogs(logs: DmtApiLogEntry[]): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)));
}

export function logDmtApiCall(entry: Omit<DmtApiLogEntry, "id" | "timestamp">): void {
  const logs = readLogs();
  logs.unshift({
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  });
  writeLogs(logs);
}

export function getDmtApiLogs(): DmtApiLogEntry[] {
  return readLogs();
}

export function clearDmtApiLogs(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function apiNameFromEndpoint(endpoint: string): string {
  const path = endpoint.replace(/^\/dmt\//, "");
  return path
    .split("/")
    .filter(Boolean)
    .map((s) => s.replace(/^\[/, "").replace(/\]$/, ""))
    .join(" ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
