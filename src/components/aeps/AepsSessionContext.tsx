"use client";

import { createContext, useContext } from "react";

type AepsSessionContextValue = {
  sessionReady: boolean;
  loginDone: boolean;
};

export const AepsSessionContext = createContext<AepsSessionContextValue>({
  sessionReady: false,
  loginDone: false,
});

export function useAepsSessionState() {
  return useContext(AepsSessionContext);
}
