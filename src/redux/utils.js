const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export { delay };

export function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function generateRequestId(prefix) {
  return `${prefix}${Math.floor(10000 + Math.random() * 90000)}`;
}

export function generateTransactionId(prefix) {
  return `${prefix}${Math.floor(100000 + Math.random() * 900000)}`;
}
