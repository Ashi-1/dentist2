import { useEffect, useRef, useState } from "react";
import createVtkEngine, { type VtkEngineAPI } from "./core/VtkEngine";
import { useVtkSceneSync } from "./hooks/useVtkSceneSync";
import { useVtkTools } from "./hooks/useVtkTools";
import { useAppDispatch } from "../app/hooks";
import { loadScene } from "../features/scene/sceneSlice";
import { store } from "../app/store";

export default function VtkDentalViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<VtkEngineAPI | null>(null);

  const dispatch = useAppDispatch();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let eng: VtkEngineAPI | null = null;

    (async () => {
      const state = store.getState();
      const hasJaws = state.scene.anatomy.jaws.length > 0;

      if (!hasJaws) {
        try {
          const res = await fetch("/mock-case.json");
          const data = await res.json();
          if (cancelled) return;
          dispatch(
            loadScene({
              anatomy: data.anatomy,
              objects: data.objects ?? [],
            })
          );
        } catch (err) {
          console.error("[VtkDentalViewer] mock-case load failed:", err);
        }
      }

      if (cancelled) return;

      eng = await createVtkEngine(container);

      if (cancelled) {
        eng.destroy();
        eng = null;
        return;
      }

      const current = store.getState();
      const jaws = current.scene.anatomy.jaws;
      const objects = current.scene.objects;

      for (const jaw of jaws) {
        eng.sceneManager.addActorFromState({
          id: jaw.id,
          modelPath: jaw.modelPath,
          position: jaw.position,
          scale: jaw.scale,
          quaternion: jaw.quaternion,
          opacity: jaw.opacity,
          visible: jaw.visible,
          isAnatomy: true,
        });
      }

      for (const obj of objects) {
        eng.sceneManager.addActorFromState({
          id: obj.id,
          modelPath: obj.modelPath,
          position: obj.position,
          scale: obj.scale,
          quaternion: obj.quaternion,
          visible: obj.visible,
        });
      }

      setEngine(eng);
    })();

    return () => {
      cancelled = true;
      if (eng) {
        eng.destroy();
        eng = null;
      }
    };
  }, [dispatch]);

  useEffect(() => {
    if (!engine) return;
    const observer = new ResizeObserver(() => engine.resize());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [engine]);

  useVtkSceneSync(engine);
  useVtkTools(engine);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    />
  );
}
