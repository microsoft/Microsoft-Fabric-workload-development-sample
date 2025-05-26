import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ApiPanelSettingsState {
  apiPanelIsLightDismiss: boolean;
}

const initialState: ApiPanelSettingsState = {
  apiPanelIsLightDismiss: false,
};

export const apiPanelSettingsSlice = createSlice({
  name: "apiPanelSettings",
  initialState,
  reducers: {
    setApiPanelIsLightDismiss: (state, action: PayloadAction<boolean>) => {
      state.apiPanelIsLightDismiss = action.payload;
    },
  },
});

export const { setApiPanelIsLightDismiss } = apiPanelSettingsSlice.actions;
export default apiPanelSettingsSlice.reducer;