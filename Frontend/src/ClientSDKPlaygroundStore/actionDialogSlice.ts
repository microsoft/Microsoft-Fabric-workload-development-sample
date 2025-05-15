import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ActionDialogState {
  apiDialogMsgboxTitle: string;
  apiDialogMsgboxContent: string;
  apiDialogMsgboxLink: string;
  apiDialogMsgboxButtonCount: number;
  sharedStateMessage: string;
  apiErrorTitle: string;
  apiErrorStatusCode: string;
  apiErrorMessage: string;
  apiErrorFailureMessage: string;
  apiErrorFailureCode: number;
  apiErrorRequestId: string;
  apiErrorStackTrace: string;
}

const initialState: ActionDialogState = {
  apiDialogMsgboxTitle: "",
  apiDialogMsgboxContent: "",
  apiDialogMsgboxLink: "",
  apiDialogMsgboxButtonCount: 0,
  sharedStateMessage: "",
  apiErrorTitle: "",
  apiErrorStatusCode: "",
  apiErrorMessage: "",
  apiErrorFailureMessage: "",
  apiErrorFailureCode: 1,
  apiErrorRequestId: "",
  apiErrorStackTrace: "",
};

export const actionDialogSlice = createSlice({
  name: "actionDialog",
  initialState,
  reducers: {
    updateMessageBoxTitle: (state, action: PayloadAction<string>) => {
      state.apiDialogMsgboxTitle = action.payload;
    },
    updateMessageBoxMessage: (state, action: PayloadAction<string>) => {
      state.apiDialogMsgboxContent = action.payload;
    },
    updateMessageBoxLink: (state, action: PayloadAction<string>) => {
      state.apiDialogMsgboxLink = action.payload;
    },
    updateButtonCount: (state, action: PayloadAction<number>) => {
      state.apiDialogMsgboxButtonCount = action.payload;
    },
    setLocalSharedStateMessage: (state, action: PayloadAction<string>) => {
      state.sharedStateMessage = action.payload;
    },
    updateApiErrorTitle: (state, action: PayloadAction<string>) => {
      state.apiErrorTitle = action.payload;
    },
    updateApiErrorStatusCode: (state, action: PayloadAction<string>) => {
      state.apiErrorStatusCode = action.payload;
    },
    updateApiErrorMessage: (state, action: PayloadAction<string>) => {
      state.apiErrorMessage = action.payload;
    },
    updateApiErrorFailureMessage: (state, action: PayloadAction<string>) => {
      state.apiErrorFailureMessage = action.payload;
    },
    updateApiErrorFailureCode: (state, action: PayloadAction<number>) => {
      state.apiErrorFailureCode = action.payload;
    },
    updateApiErrorRequestId: (state, action: PayloadAction<string>) => {
      state.apiErrorRequestId = action.payload;
    },
    updateApiErrorStackTrace: (state, action: PayloadAction<string>) => {
      state.apiErrorStackTrace = action.payload;
    },
  },
});

export const { 
  updateMessageBoxTitle, 
  updateMessageBoxMessage, 
  updateMessageBoxLink, 
  updateButtonCount, 
  setLocalSharedStateMessage, 
  updateApiErrorTitle, 
  updateApiErrorStatusCode,
  updateApiErrorMessage,
  updateApiErrorFailureMessage,
  updateApiErrorFailureCode,
  updateApiErrorRequestId,
  updateApiErrorStackTrace,
} = actionDialogSlice.actions;

export default actionDialogSlice.reducer;