import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIComponentsState {
  sampleInput: string;
  checkboxChecked: boolean;
  selectedRadio: string;
  switchChecked: boolean;
}

const initialState: UIComponentsState = {
  sampleInput: '',
  checkboxChecked: false,
  selectedRadio: 'option1',
  switchChecked: false,
};

export const uiComponentsSlice = createSlice({
  name: "uiComponents",
  initialState,
  reducers: {
    setSampleInput: (state, action: PayloadAction<string>) => {
      state.sampleInput = action.payload;
    },
    setCheckboxChecked: (state, action: PayloadAction<boolean>) => {
      state.checkboxChecked = action.payload;
    },
    setSelectedRadio: (state, action: PayloadAction<string>) => {
      state.selectedRadio = action.payload;
    },
    setSwitchChecked: (state, action: PayloadAction<boolean>) => {
      state.switchChecked = action.payload;
    },
  },
});

export const { setSampleInput, setCheckboxChecked, setSelectedRadio, setSwitchChecked } = uiComponentsSlice.actions;
export default uiComponentsSlice.reducer;