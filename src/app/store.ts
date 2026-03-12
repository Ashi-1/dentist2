import { configureStore } from "@reduxjs/toolkit";

import sceneReducer from "../features/scene/sceneSlice";
import selectionReducer from "../features/selection/selectionSlice";
import toolReducer from "../features/tools/toolSlice";
import settingsReducer from "../features/settings/settingsSlice";
import measurementReducer from "../features/measurement/measurementSlice";
import collisionReducer from "../features/collision/collisionSlice";
import slicingReducer from "../features/slicing/slicingSlice";
import axisGuideReducer from "../features/axisGuide/axisGuideSlice";
import magnifierReducer from "../features/tools/magnifierSlice";
import freehandMarkingReducer from "../features/tools/freehandMarkingSlice";
import annotationReducer from "../features/tools/annotationSlice";
import focusReducer from "../features/tools/focusSlice";
import boneDepthReducer from "../features/tools/boneDepthSlice";

/* ================= STORE ================= */

export const store = configureStore({
  reducer: {
    scene: sceneReducer,
    selection: selectionReducer,
    tool: toolReducer,
    settings: settingsReducer,
    measurement: measurementReducer,
    collision: collisionReducer,
    slicing: slicingReducer,
    axisGuide: axisGuideReducer,
    magnifier: magnifierReducer,
    freehandMarking: freehandMarkingReducer,
    annotation: annotationReducer,

    // ⭐ ADD THIS
    focus: focusReducer,
    boneDepth: boneDepthReducer,
  },

  devTools: import.meta.env.DEV,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

/* ================= TYPES ================= */

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;