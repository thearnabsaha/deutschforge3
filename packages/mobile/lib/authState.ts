// Global flag to suppress AuthGate redirect during logout
let _loggingOut = false;

export const authState = {
  get loggingOut() { return _loggingOut; },
  setLoggingOut(v: boolean) { _loggingOut = v; },
};
