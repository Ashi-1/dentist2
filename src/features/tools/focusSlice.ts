import { createSlice } from "@reduxjs/toolkit";

interface FocusState {
  focusJawRequestId: number;
}

const initialState: FocusState = {
  focusJawRequestId: 0,
};

const focusSlice = createSlice({
  name: "focus",
  initialState,
  reducers: {
    focusJaw(state) {
      state.focusJawRequestId++;
    },
  },
});

export const { focusJaw } = focusSlice.actions;
export default focusSlice.reducer;