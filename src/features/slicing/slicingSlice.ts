import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit"; // ⭐ FIX

type Axis = "x" | "y" | "z";

type SlicingState = {
  enabled: boolean;
  axis: Axis;
  position: number;
};

const initialState: SlicingState = {
  enabled: false,
  axis: "y",
  position: 0,
};

const slicingSlice = createSlice({
  name: "slicing",
  initialState,
  reducers: {
    toggleSlicing(state) {
      state.enabled = !state.enabled;
    },
    setAxis(state, action: PayloadAction<Axis>) {
      state.axis = action.payload;
    },
    setPosition(state, action: PayloadAction<number>) {
      state.position = action.payload;
    },
  },
});

export const { toggleSlicing, setAxis, setPosition } =
  slicingSlice.actions;

export default slicingSlice.reducer;