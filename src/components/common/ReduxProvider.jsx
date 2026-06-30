"use client";



import { Provider } from "react-redux";

import { store } from "@/src/redux/store";

import ToastProvider from "@/src/components/common/ToastProvider";

import ErrorBoundary from "@/src/components/common/ErrorBoundary";

import { useAuthInit } from "@/src/hooks/useAuth";



function AuthInitializer({ children }) {

  useAuthInit();

  return children;

}



export default function ReduxProvider({ children }) {

  return (

    <Provider store={store}>

      <ErrorBoundary>

        <AuthInitializer>

          {children}

          <ToastProvider />

        </AuthInitializer>

      </ErrorBoundary>

    </Provider>

  );

}

