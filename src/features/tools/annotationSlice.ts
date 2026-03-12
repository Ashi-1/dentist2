import { createSlice } from "@reduxjs/toolkit";

interface AnnotationState {
  enabled: boolean;
}

const initialState: AnnotationState = {
  enabled: false,
};

const annotationSlice = createSlice({
  name: "annotation",
  initialState,
  reducers: {
    toggleAnnotation(state) {
      state.enabled = !state.enabled;
    },
    enableAnnotation(state) {
      state.enabled = true;
    },
    disableAnnotation(state) {
      state.enabled = false;
    },
  },
});

export const {
  toggleAnnotation,
  enableAnnotation,
  disableAnnotation,
} = annotationSlice.actions;

export default annotationSlice.reducer;