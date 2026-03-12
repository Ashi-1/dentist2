import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as THREE from "three";

type MeasurementState = {
  active: boolean;
  points: THREE.Vector3[];
};

const initialState: MeasurementState = {
  active: false,
  points: [],
};

const measurementSlice = createSlice({
  name: "measurement",
  initialState,
  reducers: {

    // 🔁 Toggle tool ON/OFF
    // ❌ DO NOT CLEAR POINTS HERE
    toggleMeasurement(state) {
      state.active = !state.active;
    },

    // 🧹 FULL CLEAR (ESC key use case)
    clearMeasurement(state) {
      state.active = false;
      state.points = [];
    },

    // ✅ Add points continuously
    addPoint(state, action: PayloadAction<THREE.Vector3>) {
      state.points.push(action.payload.clone());
    },

    // ❌ Delete one measurement segment (2 points)
    removeSegment(state, action: PayloadAction<number>) {
      state.points.splice(action.payload, 2);
    },

  },
});

export const {
  toggleMeasurement,
  clearMeasurement,
  addPoint,
  removeSegment,   // ⭐ IMPORTANT — use in tool
} = measurementSlice.actions;

export default measurementSlice.reducer;