import { createAsyncThunk } from "@reduxjs/toolkit";
import { loadScene } from "./sceneSlice";
import { deserializeScene } from "./sceneDeserializer";
import { normalizeScene } from "./sceneNormalizer";

/* ⭐ TOOL / STATE IMPORTS */
import { selectObject } from "../selection/selectionSlice";
import { setActiveTool, setTransformMode, setPlaceType } from "../tools/toolSlice";

import { toggleMeasurement } from "../measurement/measurementSlice";
import { toggleAxisGuide } from "../axisGuide/axisGuideSlice";

import { toggleAnnotation } from "../tools/annotationSlice";
import { toggleFreehandMarking } from "../tools/freehandMarkingSlice";
import { toggleMagnifier } from "../tools/magnifierSlice";
import { focusJaw } from "../tools/focusSlice";
import { toggleBoneDepth } from "../tools/boneDepthSlice";

import { setJawOpacity } from "../settings/settingsSlice";

/* ===================================================== */
/*   FETCH CASE FROM BACKEND / DEMO JSON                 */
/* ===================================================== */

export const fetchCaseScene = createAsyncThunk(
  "scene/fetchCaseScene",
  async (_, { dispatch, getState }) => {

    console.log("🚀 fetchCaseScene thunk started");

    const res = await fetch("/mock-case.json");
    console.log("📡 Fetch response status:", res.status);

    const raw = await res.json();
    console.log("📦 Raw JSON from backend:", raw);

    /* ===================================================== */
    /* ⭐ DESERIALIZE + NORMALIZE                            */
    /* ===================================================== */

    const deserialized = deserializeScene(raw);
    const normalizedScene = normalizeScene(deserialized);

    console.log("🔄 After deserialize + normalize:", normalizedScene);

    /* ===================================================== */
    /* ⭐ PRESERVE EXISTING JAW                              */
    /* ===================================================== */

    const state: any = getState();
    const existingJaws = state.scene?.anatomy?.jaws ?? [];

    const finalScene = {
      anatomy: {
        // If jaw already exists (cloud/local), keep it
        jaws:
          existingJaws.length > 0
            ? existingJaws
            : normalizedScene.anatomy?.jaws ?? [],
      },
      objects: normalizedScene.objects ?? [],
    };

    dispatch(loadScene(finalScene));
    console.log("🌍 loadScene dispatched (jaw preserved)");

    /* ===================================================== */
    /* ⭐ RESTORE SELECTION                                  */
    /* ===================================================== */

    if (raw.selection?.selectedIds?.length) {
      const id = raw.selection.selectedIds[0];

      dispatch(selectObject(id));

      // Fix first render gizmo issue
      setTimeout(() => {
        dispatch(selectObject(id));
      }, 0);

      console.log("🎯 Selection restored:", id);
    }

    /* ===================================================== */
    /* ⭐ RESTORE UI TOOL STATE                              */
    /* ===================================================== */

    if (raw.ui) {
      dispatch(setActiveTool(raw.ui.activeTool));
      dispatch(setTransformMode(raw.ui.transformMode));

      if (raw.ui.placeType) {
        dispatch(setPlaceType(raw.ui.placeType));
      }

      console.log("🛠️ Tool restored:", raw.ui);
    }

    /* ===================================================== */
    /* ⭐ RESTORE ANALYSIS TOOLS                             */
    /* ===================================================== */

    if (raw.analysis?.measurement) {
      dispatch(toggleMeasurement());
      console.log("📏 Measurement enabled");
    }

    if (raw.analysis?.axisGuide) {
      dispatch(toggleAxisGuide());
      console.log("🧭 Axis guide enabled");
    }

    /* ===================================================== */
    /* ⭐ RESTORE UTILITIES                                  */
    /* ===================================================== */

    if (raw.utilities?.annotation) {
      dispatch(toggleAnnotation());
      console.log("📝 Annotation enabled");
    }

    if (raw.utilities?.freehandMarking) {
      dispatch(toggleFreehandMarking());
      console.log("✏️ Freehand marking enabled");
    }

    if (raw.utilities?.magnifier) {
      dispatch(toggleMagnifier());
      console.log("🔍 Magnifier enabled");
    }

    if (raw.utilities?.focusJaw) {
      dispatch(focusJaw());
      console.log("🎯 Focus jaw activated");
    }

    if (raw.utilities?.boneDepth) {
      dispatch(toggleBoneDepth());
      console.log("🦴 Bone depth enabled");
    }

    /* ===================================================== */
    /* ⭐ RESTORE SETTINGS                                   */
    /* ===================================================== */

    if (raw.settings?.jawOpacity !== undefined) {
      dispatch(setJawOpacity(raw.settings.jawOpacity));
      console.log("🎚️ Jaw opacity set:", raw.settings.jawOpacity);
    }

    console.log("✅ Demo case fully restored");

    return finalScene;
  }
);