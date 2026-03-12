import { createSlice } from "@reduxjs/toolkit";

type AxisGuideState = {
  active: boolean;
};

const initialState: AxisGuideState = {
  active: false,
};

const axisGuideSlice = createSlice({
  name: "axisGuide",
  initialState,
  reducers: {

    toggleAxisGuide(state) {
      state.active = !state.active;
    },

    enableAxisGuide(state) {
      state.active = true;
    },

    disableAxisGuide(state) {
      state.active = false;
    },

  },
});

export const {
  toggleAxisGuide,
  enableAxisGuide,
  disableAxisGuide,
} = axisGuideSlice.actions;

export default axisGuideSlice.reducer;