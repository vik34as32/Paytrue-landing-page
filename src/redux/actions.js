/** Dispatched on logout / session expiry to reset all Redux state. */
export const RESET_APP_STATE = "app/reset";

export function resetAppState() {
  return { type: RESET_APP_STATE };
}
