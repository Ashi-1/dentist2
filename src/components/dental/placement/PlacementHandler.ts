import * as THREE from "three";
import { addObject } from "../../../features/scene/sceneSlice";
import { selectObject } from "../../../features/selection/selectionSlice";
import {
  setActiveTool,
  setTransformMode,
  setPlaceType,   // ⭐ ADD THIS
} from "../../../features/tools/toolSlice";
import type { DentalObjectType } from "../../../features/scene/DentalObject";

/* ===================================================== */
/*   GENERIC PLACEMENT — WORKS FOR ALL OBJECT TYPES       */
/* ===================================================== */

export function handlePlacement(
  e: any,
  activeTool: string,
  placeType: DentalObjectType | null,
  dispatch: any
) {
  if (activeTool !== "placeObject" || !placeType) return;

  const hitPoint = e.point.clone();
  const direction = e.ray.direction.clone().normalize();

  let position: THREE.Vector3;
  let quaternion = new THREE.Quaternion();
  let scale = new THREE.Vector3(1, 1, 1);
  let modelPath = "";

  /* ===================================================== */
  /*   TYPE-SPECIFIC DEFAULTS                              */
  /* ===================================================== */

  switch (placeType) {

    case "implant": {
      const implantLength = 30;

      position = hitPoint
        .clone()
        .add(direction.clone().multiplyScalar(implantLength / 4));

      quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction
      );

      scale = new THREE.Vector3(0.15, 0.25, 0.15);
      modelPath = "/models/implant_screw.stl";
      break;
    }

    case "crown": {
      const normal = e.face.normal
        .clone()
        .transformDirection(e.object.matrixWorld)
        .normalize();

      position = hitPoint
        .clone()
        .add(normal.clone().multiplyScalar(5));

      quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        normal
      );

      const flip = new THREE.Quaternion();
      flip.setFromAxisAngle(normal, Math.PI);
      quaternion.multiply(flip);

      scale = new THREE.Vector3(0.40, 0.30, 0.35);
      modelPath = "/models/crown.stl";
      break;
    }

    default: {
      position = hitPoint.clone();
      modelPath = "/models/custom.stl";
    }
  }

  /* ===================================================== */
  /*   CREATE OBJECT                                       */
  /* ===================================================== */

  const id = crypto.randomUUID();

  dispatch(
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

  /* ===================================================== */
  /*   SELECT + AUTO TRANSFORM                             */
  /* ===================================================== */

  dispatch(selectObject(id));

  setTimeout(() => {

    // ⭐🔥 CRITICAL FIX — exit placement mode
    dispatch(setPlaceType(null));

    dispatch(setTransformMode("translate"));
    dispatch(setActiveTool("transform"));

  }, 0);
}