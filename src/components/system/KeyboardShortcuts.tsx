import { useEffect } from "react";
import { useAppDispatch } from "../../app/hooks";

/* ===== TOOL ACTIONS ===== */

import {
  toggleAnnotation,
  disableAnnotation,
} from "../../features/tools/annotationSlice";

import {
  toggleMeasurement,
  clearMeasurement,
} from "../../features/measurement/measurementSlice";

import {
  toggleMagnifier,
  disableMagnifier,
} from "../../features/tools/magnifierSlice";

import {
  toggleFreehandMarking,
  disableFreehandMarking,
} from "../../features/tools/freehandMarkingSlice";

import {
  clearSelection,
} from "../../features/selection/selectionSlice";

import {
  setTransformMode,
} from "../../features/tools/toolSlice";

import {
  focusJaw,
} from "../../features/tools/focusSlice";

import {
  toggleAxisGuide,
} from "../../features/axisGuide/axisGuideSlice";

export default function KeyboardShortcuts() {

  const dispatch = useAppDispatch();

  useEffect(() => {

    const onKey = (e: KeyboardEvent) => {

      /* ===== IGNORE TYPING ===== */

      const target = e.target as HTMLElement;

      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) return;

      /* ===== REQUIRE ALT / OPTION ===== */

      if (!e.altKey) return;

      const key = e.key.toLowerCase();

      e.preventDefault();

      switch (key) {

        case "n":
          dispatch(toggleAnnotation());
          break;

        case "m":
          dispatch(toggleMeasurement());
          break;

        case "z":
          dispatch(toggleMagnifier());
          break;

        case "f":
          dispatch(toggleFreehandMarking());
          break;

        case "l":
          dispatch(focusJaw());
          break;

        case "a":
          dispatch(toggleAxisGuide());
          break;

        case "t":
          dispatch(setTransformMode("translate"));
          break;

        case "r":
          dispatch(setTransformMode("rotate"));
          break;

        case "s":
          dispatch(setTransformMode("scale"));
          break;

        default:
          break;
      }
    };

    /* ===== ESC GLOBAL RESET ===== */

    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;

      dispatch(disableAnnotation());
      dispatch(clearMeasurement());
      dispatch(disableMagnifier());
      dispatch(disableFreehandMarking());
      dispatch(clearSelection());
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("keydown", onEsc);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keydown", onEsc);
    };

  }, [dispatch]);

  return null;
}