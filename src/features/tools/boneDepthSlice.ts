import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type BoneDepthState = {
  visible: boolean;
};

const initialState: BoneDepthState = {
  visible: false
};

const boneDepthSlice = createSlice({
  name: "boneDepth",
  initialState,
  reducers: {

    toggleBoneDepth(state) {
      state.visible = !state.visible;
    },

    setBoneDepthVisibility(state, action: PayloadAction<boolean>) {
      state.visible = action.payload;
    }

  }
});

export const {
  toggleBoneDepth,
  setBoneDepthVisibility
} = boneDepthSlice.actions;

export default boneDepthSlice.reducer;