import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NotificationState {
  apiNotificationTitle: string;
  apiNotificationMessage: string;
}

const initialState: NotificationState = {
  apiNotificationTitle: "",
  apiNotificationMessage: "",
};

export const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setTitle: (state, action: PayloadAction<string>) => {
      state.apiNotificationTitle = action.payload;
    },
    setMessage: (state, action: PayloadAction<string>) => {
      state.apiNotificationMessage = action.payload;
    },
  },
});

export const { setTitle, setMessage } = notificationSlice.actions;
export default notificationSlice.reducer;