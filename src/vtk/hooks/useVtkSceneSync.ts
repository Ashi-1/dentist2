import { useEffect, useRef } from "react";
import { useAppSelector } from "../../app/hooks";
import type { VtkEngineAPI } from "../core/VtkEngine";
import type { SceneObjectData } from "../core/VtkSceneManager";

function toSceneData(obj: any, isAnatomy = false): SceneObjectData {
  return {
    id: obj.id,
    modelPath: obj.modelPath,
    position: obj.position,
    scale: obj.scale,
    quaternion: obj.quaternion,
    opacity: obj.opacity,
    visible: obj.visible,
    isAnatomy,
  };
}

export function useVtkSceneSync(engine: VtkEngineAPI | null) {
  const jaws = useAppSelector((s) => s.scene.anatomy.jaws);
  const objects = useAppSelector((s) => s.scene.objects);

  const syncedJawIds = useRef(new Set<string>());
  const syncedObjIds = useRef(new Set<string>());

  useEffect(() => {
    if (!engine) return;

    const currentIds = new Set(jaws.map((j) => j.id));

    for (const jaw of jaws) {
      if (!syncedJawIds.current.has(jaw.id)) {
        engine.sceneManager.addActorFromState(toSceneData(jaw, true));
        syncedJawIds.current.add(jaw.id);
      }
    }

    for (const id of Array.from(syncedJawIds.current)) {
      if (!currentIds.has(id)) {
        engine.sceneManager.removeActor(id);
        syncedJawIds.current.delete(id);
      }
    }
  }, [engine, jaws]);

  useEffect(() => {
    if (!engine) return;

    const currentIds = new Set(objects.map((o) => o.id));

    for (const obj of objects) {
      if (!syncedObjIds.current.has(obj.id)) {
        engine.sceneManager.addActorFromState(toSceneData(obj));
        syncedObjIds.current.add(obj.id);
      }
    }

    for (const id of Array.from(syncedObjIds.current)) {
      if (!currentIds.has(id)) {
        engine.sceneManager.removeActor(id);
        syncedObjIds.current.delete(id);
      }
    }
  }, [engine, objects]);
}
