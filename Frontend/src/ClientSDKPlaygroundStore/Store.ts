import { configureStore } from "@reduxjs/toolkit";
import tabsReducer from "./tabsSlice";
import notificationReducer from "./notificationSlice";
import actionDialogReducer from "./actionDialogSlice";
import apiDataReducer from "./apiDataSlice";
import apiPanelSettingsReducer from "./apiPanelSettingsSlice";
import apiAuthenticationReducer from "./apiAuthenticationSlice";
import uiComponentsReducer from "./uiComponentsSlice";

export const ClientSDKStore = configureStore({
  reducer: {
    tabs: tabsReducer,
    notification: notificationReducer,
    actionDialog: actionDialogReducer,
    apiData: apiDataReducer,
    apiPanelSettings: apiPanelSettingsReducer,
    apiAuthentication: apiAuthenticationReducer,
    uiComponents: uiComponentsReducer,
  },
});

export type RootState = ReturnType<typeof ClientSDKStore.getState>;
export type AppDispatch = typeof ClientSDKStore.dispatch;