import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ApiAuthenticationState {
  claimsForConditionalAccessPolicy: string;
  additionalScopesToConsent: string;
  token: string;
  acquireTokenError: string;
  serverUrl: string;
  serverResponse: string;
  httpMethod: string;
  requestBody: string;
  requestDefaultConsent: boolean;
}

const initialState: ApiAuthenticationState = {
  claimsForConditionalAccessPolicy: '',
  additionalScopesToConsent: '',
  token: '',
  acquireTokenError: '',
  serverUrl: '',
  serverResponse: '',
  httpMethod: '',
  requestBody: '',
  requestDefaultConsent: false,
};

export const apiAuthenticationSlice = createSlice({
  name: "apiAuthentication",
  initialState,
  reducers: {
    setClaimsForConditionalAccessPolicy: (state, action: PayloadAction<string>) => {
      state.claimsForConditionalAccessPolicy = action.payload;
    },
    setAdditionalScopesToConsent: (state, action: PayloadAction<string>) => {
      state.additionalScopesToConsent = action.payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setAcquireTokenError: (state, action: PayloadAction<string>) => {
      state.acquireTokenError = action.payload;
    },
    setServerUrl: (state, action: PayloadAction<string>) => {
      state.serverUrl = action.payload;
    },
    setServerResponse: (state, action: PayloadAction<string>) => {
      state.serverResponse = action.payload;
    },
    setHttpMethod: (state, action: PayloadAction<string>) => {
      state.httpMethod = action.payload;
    },
    setRequestBody: (state, action: PayloadAction<string>) => {
      state.requestBody = action.payload;
    },
    setRequestDefaultConsent: (state, action: PayloadAction<boolean>) => {
      state.requestDefaultConsent = action.payload;
    },
  },
});

export const {
  setClaimsForConditionalAccessPolicy,
  setAdditionalScopesToConsent,
  setToken,
  setAcquireTokenError,
  setServerUrl,
  setServerResponse,
  setHttpMethod,
  setRequestBody,
  setRequestDefaultConsent,
} = apiAuthenticationSlice.actions;

export default apiAuthenticationSlice.reducer;