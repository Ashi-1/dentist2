import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit"; 

type CollisionState = {
  enabled: boolean;
  threshold: number; // exposure sensitivity
};

const initialState: CollisionState = {
  enabled: true,
  threshold: 1.5,
};

const collisionSlice = createSlice({
  name: "collision",
  initialState,
  reducers: {

    setCollisionEnabled(state, action: PayloadAction<boolean>) {
      state.enabled = action.payload;
    },

    setCollisionThreshold(state, action: PayloadAction<number>) {
      state.threshold = action.payload;
    },

  },
});

export const {
  setCollisionEnabled,
  setCollisionThreshold,
} = collisionSlice.actions;

export default collisionSlice.reducer;