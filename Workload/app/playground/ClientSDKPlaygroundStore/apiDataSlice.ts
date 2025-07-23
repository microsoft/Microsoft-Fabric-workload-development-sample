import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Item } from "../../implementation/clients/FabricPlatformTypes";

interface ApiDataState {
  datahubDialogDescription: string;
  dataHubMsgBoxType: string;
  isWorkspaceExplorerPresented: boolean;
  isMultiSelectionEnabled: boolean;
  selectedLinkedItem: Item | null;
}

const initialState: ApiDataState = {
  datahubDialogDescription: "Dialog description",
  dataHubMsgBoxType: "",
  isWorkspaceExplorerPresented: false,
  isMultiSelectionEnabled: false,
  selectedLinkedItem: null,
};

export const apiDataSlice = createSlice({
  name: "apiData",
  initialState,
  reducers: {
    initializeApiData: (state, action: PayloadAction<string>) => {
      state.dataHubMsgBoxType = action.payload;
    },
    setDatahubDialogDescription: (state, action: PayloadAction<string>) => {
      state.datahubDialogDescription = action.payload;
    },
    setDataHubMsgBoxType: (state, action: PayloadAction<string>) => {
      state.dataHubMsgBoxType = action.payload;
    },
    setWorkspaceExplorerPresented: (state, action: PayloadAction<boolean>) => {
      state.isWorkspaceExplorerPresented = action.payload;
    },
    setMultiSelectionEnabled: (state, action: PayloadAction<boolean>) => {
      state.isMultiSelectionEnabled = action.payload;
    },
    setSelectedLinkedItem: (state, action: PayloadAction<Item | null>) => {
      state.selectedLinkedItem = action.payload;
    },
  },
});

export const {
  initializeApiData,
  setDatahubDialogDescription,
  setDataHubMsgBoxType,
  setWorkspaceExplorerPresented,
  setMultiSelectionEnabled,
  setSelectedLinkedItem,
} = apiDataSlice.actions;

export default apiDataSlice.reducer;