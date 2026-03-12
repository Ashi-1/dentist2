import * as THREE from "three";
import type { JawData } from "./sceneSlice";
import type { DentalObject } from "./DentalObject";

export function deserializeScene(data: any) {

  console.log("🧩 deserializeScene called with:", data);

  /* ================= JAWS ================= */

  const jaws: JawData[] =
    data?.anatomy?.jaws?.map((j: any, index: number) => {

      console.log(`🦷 Raw jaw [${index}]:`, j);

      const jaw = {
        ...j,

        position: new THREE.Vector3(...(j.position ?? [0, 0, 0])),

        quaternion: new THREE.Quaternion(
          ...(j.quaternion ?? [0, 0, 0, 1])
        ),

        scale: new THREE.Vector3(...(j.scale ?? [1, 1, 1])),

        /* ⭐ IMPORTANT */

        opacity: j.opacity ?? 1,
        visible: j.visible ?? true
      };

      console.log(`✅ Converted jaw [${index}]:`, jaw);

      return jaw;

    }) ?? [];

  console.log("🦷 Final jaws array:", jaws);

  /* ================= OBJECTS ================= */

  const objects: DentalObject[] =
    data?.objects?.map((o: any, index: number) => {

      console.log(`🔩 Raw object [${index}]:`, o);

      const obj = {
        ...o,

        position: new THREE.Vector3(...(o.position ?? [0, 0, 0])),

        quaternion: new THREE.Quaternion(
          ...(o.quaternion ?? [0, 0, 0, 1])
        ),

        scale: o.scale
          ? new THREE.Vector3(...o.scale)
          : new THREE.Vector3(1, 1, 1),
      };

      console.log(`✅ Converted object [${index}]:`, obj);

      return obj;

    }) ?? [];

  console.log("🔩 Final objects array:", objects);

  const result = {
    anatomy: { jaws },
    objects,
  };

  console.log("📤 deserializeScene result:", result);

  return result;
}