import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TabsState {
  selectedTab: string;
}

const initialState: TabsState = {
  selectedTab: "apiNotification",
};

export const tabsSlice = createSlice({
  name: "tabs",
  initialState,
  reducers: {
    setSelectedTab: (state, action: PayloadAction<string>) => {
      state.selectedTab = action.payload;
    },
  },
});

export const { setSelectedTab } = tabsSlice.actions;
export default tabsSlice.reducer;