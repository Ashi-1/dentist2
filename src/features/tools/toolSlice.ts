import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { DentalObjectType } from "../scene/DentalObject";

/* ===================================================== */
/*   GENERIC TOOL SYSTEM — TYPE AGNOSTIC                 */
/* ===================================================== */

/* ===== MAIN TOOL ===== */

export type Tool =
  | "select"
  | "placeObject"
  | "measure"
  | "transform";

/* ===== TRANSFORM MODE ===== */

export type TransformMode =
  | "translate"
  | "rotate"
  | "scale";

/* ===== TOOL STATE ===== */

type ToolState = {
  activeTool: Tool;

  // ⭐ what object type to place
  placeType: DentalObjectType | null;

  transformMode: TransformMode;
};

const initialState: ToolState = {
  activeTool: "select",
  placeType: null,
  transformMode: "translate",
};

const toolSlice = createSlice({
  name: "tool",
  initialState,
  reducers: {

    /* ===== SET ACTIVE TOOL ===== */

    setActiveTool(state, action: PayloadAction<Tool>) {
      state.activeTool = action.payload;
    },

    /* ===== SET OBJECT TYPE TO PLACE ===== */

    setPlaceType(
      state,
      action: PayloadAction<DentalObjectType | null>
    ) {
      state.placeType = action.payload;
    },

    /* ===== SET TRANSFORM MODE ===== */

    setTransformMode(
      state,
      action: PayloadAction<TransformMode>
    ) {
      state.transformMode = action.payload;
    },
  },
});

export const {
  setActiveTool,
  setPlaceType,
  setTransformMode,
} = toolSlice.actions;

export default toolSlice.reducer;