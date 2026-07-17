import type { ComponentType, ReactNode } from "react";

export interface UserMultiStepFormProps {
  userType?: string;
  mode?: string;
  userId?: string | null;
  initialUser?: Record<string, unknown> | null;
  title?: string;
  description?: string;
  backHref?: string;
  successRedirect?: string;
  icon?: ComponentType<{ className?: string }> | ReactNode;
  lockIdentityFields?: boolean;
  forceCurrentLocation?: boolean;
  hidePassword?: boolean;
}

declare function UserMultiStepForm(props: UserMultiStepFormProps): JSX.Element;
export default UserMultiStepForm;
