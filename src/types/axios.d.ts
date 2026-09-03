import "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    /** When true, 401 interceptor must not force a session logout. */
    skipSessionLogout?: boolean;
  }
}
