import vtkCellPicker from "@kitware/vtk.js/Rendering/Core/CellPicker";
import * as THREE from "three";

import { store } from "../../../app/store";
import { addObject } from "../../../features/scene/sceneSlice";
import { selectObject } from "../../../features/selection/selectionSlice";
import {
  setActiveTool,
  setTransformMode,
} from "../../../features/tools/toolSlice";
import type { DentalObjectType } from "../../../features/scene/DentalObject";

const MODEL_PATHS: Record<string, string> = {
  implant: "/models/implant_screw.stl",
  crown: "/models/crown.stl",
  abutment: "/models/abutment.stl",
  screw: "/models/implant_screw.stl",
  custom: "/models/implant_screw.stl",
};

const DRAG_THRESHOLD = 4;

export interface VtkPlacementSystem {
  dispose: () => void;
}

function normalizeVec(v: number[]): number[] {
  const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  if (len < 1e-10) return [0, 0, 1];
  return [v[0] / len, v[1] / len, v[2] / len];
}

export function setupObjectPlacement(
  container: HTMLDivElement,
  renderer: any,
  renderWindow: any
): VtkPlacementSystem {
  const picker = vtkCellPicker.newInstance();
  picker.setTolerance(0.005);

  const interactor = renderWindow.getInteractor();
  interactor.setPicker(picker);

  let downX = 0;
  let downY = 0;

  function onMouseDown(e: MouseEvent) {
    downX = e.clientX;
    downY = e.clientY;
  }

  function onMouseUp(event: MouseEvent) {
    const dx = event.clientX - downX;
    const dy = event.clientY - downY;
    if (dx * dx + dy * dy > DRAG_THRESHOLD * DRAG_THRESHOLD) return;

    const state = store.getState();
    if (state.tool.activeTool !== "placeObject") return;
    if (!state.tool.placeType) return;

    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = canvas.height - (event.clientY - rect.top) * scaleY;

    picker.pick([x, y, 0], renderer);

    const actors = picker.getActors();
    if (!actors || actors.length === 0) return;

    const hitPoint = picker.getPickPosition();
    if (!hitPoint || hitPoint.length !== 3) return;

    const camera = renderer.getActiveCamera();
    const camPos = camera.getPosition();
    const toCamera = normalizeVec([
      camPos[0] - hitPoint[0],
      camPos[1] - hitPoint[1],
      camPos[2] - hitPoint[2],
    ]);

    const placeType = state.tool.placeType as DentalObjectType;
    const modelPath = MODEL_PATHS[placeType] ?? MODEL_PATHS.implant;

    let position: THREE.Vector3;
    let quaternion = new THREE.Quaternion();
    let scale = new THREE.Vector3(1, 1, 1);

    switch (placeType) {
      case "implant": {
        const implantLength = 30;
        position = new THREE.Vector3(
          hitPoint[0] + toCamera[0] * (implantLength / 4),
          hitPoint[1] + toCamera[1] * (implantLength / 4),
          hitPoint[2] + toCamera[2] * (implantLength / 4)
        );

        quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(toCamera[0], toCamera[1], toCamera[2])
        );

        scale = new THREE.Vector3(0.15, 0.25, 0.15);
        break;
      }

      case "crown": {
        const normal = new THREE.Vector3(
          toCamera[0],
          toCamera[1],
          toCamera[2]
        );

        position = new THREE.Vector3(
          hitPoint[0] + normal.x * 5,
          hitPoint[1] + normal.y * 5,
          hitPoint[2] + normal.z * 5
        );

        quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          normal
        );

        const flip = new THREE.Quaternion();
        flip.setFromAxisAngle(normal, Math.PI);
        quaternion.multiply(flip);

        scale = new THREE.Vector3(0.40, 0.30, 0.35);
        break;
      }

      default: {
        position = new THREE.Vector3(
          hitPoint[0],
          hitPoint[1],
          hitPoint[2]
        );
        scale = new THREE.Vector3(0.1, 0.1, 0.1);
      }
    }

    const id = `${placeType}-${Date.now()}`;

    console.log("[VtkPlacement] hitPoint:", hitPoint);
    console.log("[VtkPlacement] toCamera:", toCamera);
    console.log("[VtkPlacement] position:", position.toArray());
    console.log("[VtkPlacement] quaternion:", [quaternion.x, quaternion.y, quaternion.z, quaternion.w]);
    console.log("[VtkPlacement] scale:", scale.toArray());

    store.dispatch(
      addObject({
        id,
        type: placeType,
        modelPath,
        position,
        quaternion,
        scale,
        visible: true,
      })
    );

    store.dispatch(selectObject(id));
    store.dispatch(setActiveTool("transform"));
    store.dispatch(setTransformMode("translate"));
  }

  container.addEventListener("mousedown", onMouseDown);
  container.addEventListener("mouseup", onMouseUp);

  return {
    dispose() {
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mouseup", onMouseUp);
    },
  };
}
