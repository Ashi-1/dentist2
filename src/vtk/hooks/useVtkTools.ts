import { useEffect, useRef } from "react";
import { useAppSelector } from "../../app/hooks";
import type { VtkEngineAPI } from "../core/VtkEngine";

export function useVtkTools(engine: VtkEngineAPI | null) {
  const selectedIds = useAppSelector((s) => s.selection.selectedIds);
  const activeTool = useAppSelector((s) => s.tool.activeTool);
  const transformMode = useAppSelector((s) => s.tool.transformMode);
  const objects = useAppSelector((s) => s.scene.objects);

  const prevSelectedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!engine?.transformGizmo) return;

    const selectedId = selectedIds[0] ?? null;

    if (selectedId !== prevSelectedRef.current) {
      engine.transformGizmo.highlightById(selectedId);
      prevSelectedRef.current = selectedId;
    }
  }, [engine, selectedIds]);

  useEffect(() => {
    if (!engine?.transformGizmo) return;

    const selectedId = selectedIds[0] ?? null;
    if (selectedId && selectedId === prevSelectedRef.current) {
      engine.transformGizmo.highlightById(selectedId);
    }
  }, [engine, objects]);

  useEffect(() => {
    if (!engine) return;
    engine.render();
  }, [engine, activeTool, transformMode]);
}
