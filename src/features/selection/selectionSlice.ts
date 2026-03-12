import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

/* ===================================================== */
/*   GENERIC SELECTION — TYPE INDEPENDENT                */
/* ===================================================== */

type SelectionState = {
  selectedIds: string[];   // multi-select ready
};

const initialState: SelectionState = {
  selectedIds: [],
};

const selectionSlice = createSlice({
  name: "selection",
  initialState,
  reducers: {

    /* ===== SINGLE SELECT ===== */

    selectObject(
      state,
      action: PayloadAction<string>   // only ID needed
    ) {
      state.selectedIds = [action.payload];
    },

    /* ===== ADD TO SELECTION (Ctrl+Click future) ===== */

    addToSelection(
      state,
      action: PayloadAction<string>
    ) {
      if (!state.selectedIds.includes(action.payload)) {
        state.selectedIds.push(action.payload);
      }
    },

    /* ===== REMOVE FROM SELECTION ===== */

    removeFromSelection(
      state,
      action: PayloadAction<string>
    ) {
      state.selectedIds = state.selectedIds.filter(
        id => id !== action.payload
      );
    },

    /* ===== CLEAR ===== */

    clearSelection(state) {
      state.selectedIds = [];
    },
  },
});

export const {
  selectObject,
  addToSelection,
  removeFromSelection,
  clearSelection,
} = selectionSlice.actions;

export default selectionSlice.reducer;