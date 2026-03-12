import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit"; // ⭐ FIX

/* ===== TYPES ===== */

type PlacementSettings = {
  screwDepth: number;
  crownOffset: number;
};

type VisualSettings = {
  jawOpacity: number;
};

type SettingsState = {
  placement: PlacementSettings;
  visual: VisualSettings;
};

/* ===== INITIAL STATE ===== */

const initialState: SettingsState = {
  placement: {
    screwDepth: 7.5,
    crownOffset: 0,
  },
  visual: {
    jawOpacity: 0.35,
  },
};

/* ===== SLICE ===== */

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {

    /* ===== PLACEMENT ===== */

    setScrewDepth(state, action: PayloadAction<number>) {
      state.placement.screwDepth = Math.max(0, action.payload);
    },

    setCrownOffset(state, action: PayloadAction<number>) {
      state.placement.crownOffset = action.payload;
    },

    /* ===== VISUAL ===== */

    setJawOpacity(state, action: PayloadAction<number>) {
      state.visual.jawOpacity = Math.min(
        1,
        Math.max(0, action.payload)
      );
    },

    /* ===== RESET ===== */

    resetSettings() {
      return initialState;
    },
  },
});

export const {
  setScrewDepth,
  setCrownOffset,
  setJawOpacity,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;