export type NormalizedAuthUser = {
  id?: string;
  email?: string;
  mobile?: string;
  userType?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  [key: string]: unknown;
};
