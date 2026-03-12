import vtkCellPicker from "@kitware/vtk.js/Rendering/Core/CellPicker";
import * as THREE from "three";

import { store } from "../../../app/store";
import { updateObject } from "../../../features/scene/sceneSlice";
import {
  selectObject,
  clearSelection,
} from "../../../features/selection/selectionSlice";
import { setActiveTool } from "../../../features/tools/toolSlice";
import type { VtkSceneManagerAPI } from "../../core/VtkSceneManager";

const DRAG_THRESHOLD = 4;
const ROTATE_SENSITIVITY = 0.4;
const SCALE_SENSITIVITY = 0.005;

export interface VtkTransformGizmoAPI {
  highlightById: (id: string | null) => void;
  dispose: () => void;
}

function cross(a: number[], b: number[]): number[] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function normalize(v: number[]): number[] {
  const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  if (len < 1e-10) return [0, 0, 0];
  return [v[0] / len, v[1] / len, v[2] / len];
}

function dist3(a: number[], b: number[]): number {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
  );
}

const GEO_FLIP = new THREE.Quaternion().setFromAxisAngle(
  new THREE.Vector3(1, 0, 0),
  Math.PI
);

function actorToReduxQuaternion(actor: any): THREE.Quaternion {
  const wxyz = actor.getOrientationWXYZ();
  const angleDeg: number = wxyz[0];
  const ax: number = wxyz[1];
  const ay: number = wxyz[2];
  const az: number = wxyz[3];

  let actorQuat: THREE.Quaternion;
  if (angleDeg === 0 || (ax === 0 && ay === 0 && az === 0)) {
    actorQuat = new THREE.Quaternion();
  } else {
    const halfRad = (angleDeg * Math.PI) / 360;
    const s = Math.sin(halfRad);
    actorQuat = new THREE.Quaternion(ax * s, ay * s, az * s, Math.cos(halfRad));
  }

  return actorQuat.multiply(GEO_FLIP);
}

export function createTransformGizmo(
  container: HTMLDivElement,
  renderer: any,
  renderWindow: any,
  sceneManager: VtkSceneManagerAPI
): VtkTransformGizmoAPI {
  const picker = vtkCellPicker.newInstance();
  picker.setTolerance(0.01);

  const interactor = renderWindow.getInteractor();

  let isDragging = false;
  let potentialDrag = false;
  let downClientX = 0;
  let downClientY = 0;
  let prevClientX = 0;
  let prevClientY = 0;

  let dragActorId: string | null = null;
  let dragActor: any = null;
  let startScale: number[] = [1, 1, 1];

  let highlightedId: string | null = null;
  let savedInteractorStyle: any = null;

  function getCanvasCoords(event: MouseEvent): [number, number] | null {
    const c = container.querySelector("canvas") as HTMLCanvasElement;
    if (!c) return null;
    const rect = c.getBoundingClientRect();
    const scaleX = c.width / rect.width;
    const scaleY = c.height / rect.height;
    return [
      (event.clientX - rect.left) * scaleX,
      c.height - (event.clientY - rect.top) * scaleY,
    ];
  }

  function highlightById(id: string | null) {
    if (highlightedId && highlightedId !== id) {
      const prev = sceneManager.getActor(highlightedId);
      if (prev) {
        try { prev.getProperty().setEdgeVisibility(false); } catch { /* */ }
      }
    }
    highlightedId = id;
    if (id) {
      const actor = sceneManager.getActor(id);
      if (actor) {
        try {
          actor.getProperty().setEdgeVisibility(true);
          actor.getProperty().setEdgeColor(0.2, 0.85, 1.0);
          actor.getProperty().setLineWidth(2);
        } catch { /* */ }
      }
    }
    renderWindow.render();
  }

  function pickSceneObjectId(event: MouseEvent): string | null {
    const coords = getCanvasCoords(event);
    if (!coords) return null;

    picker.setPickFromList(false);
    picker.pick([coords[0], coords[1], 0], renderer);
    const actors = picker.getActors();
    if (!actors || actors.length === 0) return null;

    const state = store.getState();
    const objectIds = new Set(state.scene.objects.map((o: any) => o.id));

    for (const a of actors) {
      const id = sceneManager.getActorId(a);
      if (id && objectIds.has(id)) return id;
    }

    return null;
  }

  function pickAnyId(event: MouseEvent): string | null {
    const coords = getCanvasCoords(event);
    if (!coords) return null;

    picker.setPickFromList(false);
    picker.pick([coords[0], coords[1], 0], renderer);
    const actors = picker.getActors();
    if (!actors || actors.length === 0) return null;

    const state = store.getState();
    const objectIds = new Set(state.scene.objects.map((o: any) => o.id));

    for (const a of actors) {
      const id = sceneManager.getActorId(a);
      if (id && objectIds.has(id)) return id;
    }

    return sceneManager.getActorId(actors[0]) ?? null;
  }

  function getWorldPerPixel(): number {
    const camera = renderer.getActiveCamera();
    const camPos = camera.getPosition();
    const focalPt = camera.getFocalPoint();
    const d = dist3(camPos, focalPt);
    const c = container.querySelector("canvas") as HTMLCanvasElement;
    const cssH = c ? c.getBoundingClientRect().height : 600;
    if (camera.getParallelProjection()) {
      return (2 * camera.getParallelScale()) / cssH;
    }
    const fovRad = (camera.getViewAngle() * Math.PI) / 180;
    return (2 * d * Math.tan(fovRad / 2)) / cssH;
  }

  function getCameraVectors() {
    const camera = renderer.getActiveCamera();
    const camPos = camera.getPosition();
    const focalPt = camera.getFocalPoint();
    const viewUp = camera.getViewUp();
    const viewDir = normalize([
      focalPt[0] - camPos[0],
      focalPt[1] - camPos[1],
      focalPt[2] - camPos[2],
    ]);
    const right = normalize(cross(viewDir, viewUp));
    const up = normalize(cross(right, viewDir));
    return { right, up };
  }

  function disableCameraInteraction() {
    if (!savedInteractorStyle) {
      savedInteractorStyle = interactor.getInteractorStyle();
    }
    interactor.setInteractorStyle(null);
  }

  function restoreCameraInteraction() {
    if (savedInteractorStyle) {
      interactor.setInteractorStyle(savedInteractorStyle);
      savedInteractorStyle = null;
    }
  }

  function onMouseDown(event: MouseEvent) {
    downClientX = event.clientX;
    downClientY = event.clientY;
    prevClientX = event.clientX;
    prevClientY = event.clientY;
    isDragging = false;
    potentialDrag = false;
    dragActor = null;
    dragActorId = null;

    const state = store.getState();
    if (state.tool.activeTool !== "transform") return;

    const pickedId = pickSceneObjectId(event);
    if (!pickedId) return;

    const actor = sceneManager.getActor(pickedId);
    if (!actor) return;

    const currentSelectedId = state.selection.selectedIds[0] ?? null;
    if (pickedId !== currentSelectedId) {
      store.dispatch(selectObject(pickedId));
    }

    dragActorId = pickedId;
    dragActor = actor;
    startScale = [...actor.getScale()];
    potentialDrag = true;

    disableCameraInteraction();
  }

  function onMouseMove(event: MouseEvent) {
    if (!potentialDrag) return;

    const dx = event.clientX - downClientX;
    const dy = event.clientY - downClientY;

    if (!isDragging && dx * dx + dy * dy > DRAG_THRESHOLD * DRAG_THRESHOLD) {
      isDragging = true;
    }

    if (!isDragging || !dragActor) return;

    const state = store.getState();
    const mode = state.tool.transformMode;
    const pixelDx = event.clientX - prevClientX;
    const pixelDy = event.clientY - prevClientY;

    if (mode === "translate") {
      const wpp = getWorldPerPixel();
      const { right, up } = getCameraVectors();
      const wx = (right[0] * pixelDx - up[0] * pixelDy) * wpp;
      const wy = (right[1] * pixelDx - up[1] * pixelDy) * wpp;
      const wz = (right[2] * pixelDx - up[2] * pixelDy) * wpp;
      const pos = dragActor.getPosition();
      dragActor.setPosition(pos[0] + wx, pos[1] + wy, pos[2] + wz);
    }

    if (mode === "rotate") {
      dragActor.rotateY(pixelDx * ROTATE_SENSITIVITY);
      dragActor.rotateX(pixelDy * ROTATE_SENSITIVITY);
    }

    if (mode === "scale") {
      const totalDy = downClientY - event.clientY;
      const factor = Math.max(0.05, 1 + totalDy * SCALE_SENSITIVITY);
      dragActor.setScale(
        startScale[0] * factor,
        startScale[1] * factor,
        startScale[2] * factor
      );
    }

    prevClientX = event.clientX;
    prevClientY = event.clientY;
    renderWindow.render();
  }

  function onMouseUp(event: MouseEvent) {
    if (isDragging && dragActor && dragActorId) {
      restoreCameraInteraction();

      const pos = dragActor.getPosition();
      const origin = dragActor.getOrigin();
      const scl = dragActor.getScale();
      const quat = actorToReduxQuaternion(dragActor);

      store.dispatch(
        updateObject({
          id: dragActorId,
          changes: {
            position: new THREE.Vector3(
              pos[0] + origin[0],
              pos[1] + origin[1],
              pos[2] + origin[2]
            ),
            quaternion: quat,
            scale: new THREE.Vector3(scl[0], scl[1], scl[2]),
          },
        })
      );

      isDragging = false;
      potentialDrag = false;
      dragActor = null;
      dragActorId = null;
      return;
    }

    if (potentialDrag) {
      restoreCameraInteraction();
      potentialDrag = false;
      dragActor = null;
      dragActorId = null;
      return;
    }

    isDragging = false;
    potentialDrag = false;
    dragActor = null;
    dragActorId = null;

    const moveDx = event.clientX - downClientX;
    const moveDy = event.clientY - downClientY;
    if (moveDx * moveDx + moveDy * moveDy > DRAG_THRESHOLD * DRAG_THRESHOLD) {
      return;
    }

    const state = store.getState();
    if (state.tool.activeTool === "placeObject") return;

    const pickedId = pickAnyId(event);
    if (pickedId) {
      store.dispatch(selectObject(pickedId));
      if (state.tool.activeTool === "select") {
        store.dispatch(setActiveTool("transform"));
      }
    } else {
      store.dispatch(clearSelection());
    }
  }

  container.addEventListener("mousedown", onMouseDown);
  container.addEventListener("mousemove", onMouseMove);
  container.addEventListener("mouseup", onMouseUp);

  return {
    highlightById,
    dispose() {
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseup", onMouseUp);
    },
  };
}
