import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as THREE from "three";

import type { DentalObject } from "./DentalObject";

/* ===================================================== */
/*   JAW DATA (ANATOMY)                                  */
/* ===================================================== */

export type JawData = {
  id: string;
  modelPath: string;

  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: THREE.Vector3;

  opacity?: number;
  visible?: boolean;
};

/* ===================================================== */
/*   SCENE STATE                                         */
/* ===================================================== */

type SceneState = {
  anatomy: {
    jaws: JawData[];
  };

  objects: DentalObject[];
};

/* ===================================================== */
/*   INITIAL STATE                                       */
/* ===================================================== */

const initialState: SceneState = {
  anatomy: {
    jaws: [], // ⭐ dynamic jaws
  },

  objects: [], // ⭐ existing objects (UNCHANGED)
};

/* ===================================================== */
/*   SLICE                                               */
/* ===================================================== */

const sceneSlice = createSlice({
  name: "scene",
  initialState,
  reducers: {

    /* ================= JAW CONTROL ================= */

    setJaws(state, action: PayloadAction<JawData[]>) {
      state.anatomy.jaws = action.payload;
    },

    addJaw(state, action: PayloadAction<JawData>) {
      state.anatomy.jaws.push(action.payload);
    },

    updateJaw(
      state,
      action: PayloadAction<{
        id: string;
        changes: Partial<JawData>;
      }>
    ) {
      const jaw = state.anatomy.jaws.find(
        j => j.id === action.payload.id
      );
      if (jaw) Object.assign(jaw, action.payload.changes);
    },

    removeJaw(state, action: PayloadAction<string>) {
      state.anatomy.jaws = state.anatomy.jaws.filter(
        j => j.id !== action.payload
      );
    },

    /* ================= OBJECTS (UNCHANGED) ================= */

    addObject(state, action: PayloadAction<DentalObject>) {
      state.objects.push(action.payload);
    },

    updateObject(
      state,
      action: PayloadAction<{
        id: string;
        changes: Partial<DentalObject>;
      }>
    ) {
      const obj = state.objects.find(
        o => o.id === action.payload.id
      );
      if (obj) Object.assign(obj, action.payload.changes);
    },

    removeObject(state, action: PayloadAction<string>) {
      state.objects = state.objects.filter(
        o => o.id !== action.payload
      );
    },

    clearScene(state) {
      state.objects = [];
      state.anatomy.jaws = []; // ⭐ optional but logical
    },

    /* ================= LOAD FROM BACKEND ================= */

    loadScene(
      state,
      action: PayloadAction<{
        anatomy?: { jaws: JawData[] };
        objects?: DentalObject[];
      }>
    ) {
      if (action.payload.anatomy) {
        state.anatomy = action.payload.anatomy;
      }

      if (action.payload.objects) {
        state.objects = action.payload.objects;
      }
    },
  },
});

/* ===================================================== */
/*   EXPORTS                                             */
/* ===================================================== */

export const {
  setJaws,
  addJaw,
  updateJaw,
  removeJaw,

  addObject,
  updateObject,
  removeObject,
  clearScene,
  loadScene,
} = sceneSlice.actions;

export default sceneSlice.reducer;