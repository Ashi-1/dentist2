import * as THREE from "three";
import {
  loadOrCreateActor,
  createActorFromCache,
  isCached,
  getModelBoundsCenter,
} from "../models/VtkModelCache";

const GEO_FLIP = new THREE.Quaternion().setFromAxisAngle(
  new THREE.Vector3(1, 0, 0),
  Math.PI
);

export interface ActorEntry {
  id: string;
  actor: any;
  modelPath: string;
}

export interface SceneObjectData {
  id: string;
  modelPath: string;
  position: { x: number; y: number; z: number } | number[];
  scale?: { x: number; y: number; z: number } | number[];
  quaternion?: { _x: number; _y: number; _z: number; _w: number } | number[];
  opacity?: number;
  visible?: boolean;
  isAnatomy?: boolean;
}

export interface VtkSceneManagerAPI {
  addActorFromState: (obj: SceneObjectData) => Promise<void>;
  removeActor: (id: string) => void;
  updateActorTransform: (
    id: string,
    position: number[],
    scale: number[]
  ) => void;
  getActor: (id: string) => any | undefined;
  getActorId: (actor: any) => string | undefined;
  getAllEntries: () => ActorEntry[];
  clear: () => void;
  render: () => void;
}

function toArray3(v: any): number[] {
  if (Array.isArray(v)) return v;
  if (v && typeof v.x === "number") return [v.x, v.y, v.z];
  return [0, 0, 0];
}

function toScale3(v: any): number[] {
  if (!v) return [1, 1, 1];
  if (Array.isArray(v)) return v;
  if (typeof v.x === "number") return [v.x, v.y, v.z];
  return [1, 1, 1];
}

function toQuat(q: any): THREE.Quaternion {
  if (!q) return new THREE.Quaternion();
  if (Array.isArray(q)) return new THREE.Quaternion(q[0], q[1], q[2], q[3]);
  if (typeof q._x === "number")
    return new THREE.Quaternion(q._x, q._y, q._z, q._w);
  if (typeof q.x === "number")
    return new THREE.Quaternion(q.x, q.y, q.z, q.w);
  return new THREE.Quaternion();
}

export function createSceneManager(
  renderer: any,
  renderWindow: any
): VtkSceneManagerAPI {
  const entries = new Map<string, ActorEntry>();
  const loading = new Set<string>();
  let cameraResetDone = false;

  function render() {
    renderWindow.render();
  }

  async function addActorFromState(obj: SceneObjectData): Promise<void> {
    if (entries.has(obj.id) || loading.has(obj.id)) return;
    loading.add(obj.id);

    let actor: any;
    try {
      actor = isCached(obj.modelPath)
        ? createActorFromCache(obj.modelPath)
        : await loadOrCreateActor(obj.modelPath);
    } catch (err) {
      console.error(`[VtkSceneManager] Failed to load: ${obj.modelPath}`, err);
      loading.delete(obj.id);
      return;
    }

    loading.delete(obj.id);

    if (!actor) return;
    if (entries.has(obj.id)) return;

    const pos = toArray3(obj.position);
    const scl = toScale3(obj.scale);

    if (obj.isAnatomy) {
      actor.setPosition(pos[0], pos[1], pos[2]);
    } else {
      const center = getModelBoundsCenter(obj.modelPath);
      if (center) {
        actor.setOrigin(center[0], center[1], center[2]);
        actor.setPosition(
          pos[0] - center[0],
          pos[1] - center[1],
          pos[2] - center[2]
        );
        console.log("[VtkScene] id:", obj.id, "center:", center,
          "actorPos:", [pos[0] - center[0], pos[1] - center[1], pos[2] - center[2]],
          "reduxPos:", pos);
      } else {
        actor.setPosition(pos[0], pos[1], pos[2]);
        console.log("[VtkScene] id:", obj.id, "no center, actorPos:", pos);
      }

      const reduxQ = toQuat(obj.quaternion);
      const combined = reduxQ.clone().multiply(GEO_FLIP);
      console.log("[VtkScene] id:", obj.id, "reduxQ:", [reduxQ.x, reduxQ.y, reduxQ.z, reduxQ.w],
        "combined:", [combined.x, combined.y, combined.z, combined.w]);
      actor.setOrientationFromQuaternion([
        combined.x,
        combined.y,
        combined.z,
        combined.w,
      ]);
    }

    actor.setScale(scl[0], scl[1], scl[2]);
    actor.setPickable(true);

    if (obj.opacity !== undefined && obj.opacity < 1) {
      actor.getProperty().setOpacity(obj.opacity);
    }
    if (obj.visible === false) {
      actor.setVisibility(false);
    }

    renderer.addActor(actor);
    entries.set(obj.id, { id: obj.id, actor, modelPath: obj.modelPath });

    if (!cameraResetDone) {
      cameraResetDone = true;
      renderer.resetCamera();
      renderer.resetCameraClippingRange();
    }

    render();
  }

  function removeActor(id: string) {
    const entry = entries.get(id);
    if (!entry) return;
    renderer.removeActor(entry.actor);
    entries.delete(id);
    render();
  }

  function updateActorTransform(
    id: string,
    position: number[],
    scale: number[]
  ) {
    const entry = entries.get(id);
    if (!entry) return;

    const origin = entry.actor.getOrigin();
    entry.actor.setPosition(
      position[0] - origin[0],
      position[1] - origin[1],
      position[2] - origin[2]
    );
    entry.actor.setScale(scale[0], scale[1], scale[2]);
    render();
  }

  function getActor(id: string) {
    return entries.get(id)?.actor;
  }

  function getActorId(actor: any): string | undefined {
    for (const [id, entry] of entries) {
      if (entry.actor === actor) return id;
    }
    return undefined;
  }

  function getAllEntries(): ActorEntry[] {
    return Array.from(entries.values());
  }

  function clear() {
    for (const entry of entries.values()) {
      renderer.removeActor(entry.actor);
    }
    entries.clear();
    loading.clear();
    cameraResetDone = false;
    render();
  }

  return {
    addActorFromState,
    removeActor,
    updateActorTransform,
    getActor,
    getActorId,
    getAllEntries,
    clear,
    render,
  };
}
