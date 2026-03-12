import { createSlice } from "@reduxjs/toolkit";

interface MagnifierState {
  enabled: boolean;
}

const initialState: MagnifierState = {
  enabled: false,
};

const magnifierSlice = createSlice({
  name: "magnifier",
  initialState,
  reducers: {
    toggleMagnifier(state) {
      state.enabled = !state.enabled;
    },
    enableMagnifier(state) {
      state.enabled = true;
    },
    disableMagnifier(state) {
      state.enabled = false;
    },
  },
});

export const {
  toggleMagnifier,
  enableMagnifier,
  disableMagnifier,
} = magnifierSlice.actions;

export default magnifierSlice.reducer;