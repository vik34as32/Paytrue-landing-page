import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "@/src/redux/rootReducer";
import { dmtApi } from "@/src/modules/dmt/redux";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(dmtApi.middleware),
});

export default store;
