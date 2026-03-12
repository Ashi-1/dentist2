import { createSlice } from "@reduxjs/toolkit";

interface FreehandMarkingState {
  enabled: boolean;
}

const initialState: FreehandMarkingState = {
  enabled: false,
};

const freehandMarkingSlice = createSlice({
  name: "freehandMarking",
  initialState,
  reducers: {
    toggleFreehandMarking(state) {
      state.enabled = !state.enabled;
    },
    enableFreehandMarking(state) {
      state.enabled = true;
    },
    disableFreehandMarking(state) {
      state.enabled = false;
    },
  },
});

export const {
  toggleFreehandMarking,
  enableFreehandMarking,
  disableFreehandMarking,
} = freehandMarkingSlice.actions;

export default freehandMarkingSlice.reducer;