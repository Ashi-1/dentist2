import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useAppSelector } from "../app/hooks";
import { useMemo } from "react";

export default function CollisionIndicator() {

  const { scene } = useThree();

  /* ⭐ NEW — get objects */
  const objects = useAppSelector(s => s.scene.objects);

  const implants = objects.filter(o => o.type === "implant");
  const crowns = objects.filter(o => o.type === "crown");

  const screwDepth = useAppSelector(s => s.settings.placement.screwDepth);
  const crownOffset = useAppSelector(s => s.settings.placement.crownOffset);

  const enabled = useAppSelector(s => s.collision.enabled);

  const jawMesh = scene.getObjectByName("jaw") as THREE.Mesh | null;

  /* ===== ALWAYS CALL HOOKS ===== */

  const jawBox = useMemo(() => {
    if (!jawMesh) return null;
    return new THREE.Box3().setFromObject(jawMesh);
  }, [jawMesh]);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  if (!enabled || !jawMesh || !jawBox) return null;

  /* ============================================================
     🔩 IMPLANT VALIDATION — MUST BE INSIDE THICKNESS
  ============================================================ */

  const implantOutside = (pos: THREE.Vector3) => {
    return !jawBox.containsPoint(pos);
  };

  /* ============================================================
     👑 CROWN VALIDATION — ANY CONTACT IS OK
  ============================================================ */

  const crownDetached = (pos: THREE.Vector3) => {

    const directions = [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, -1),
    ];

    for (const dir of directions) {
      raycaster.set(pos, dir);
      const hits = raycaster.intersectObject(jawMesh, true);

      if (hits.length > 0 && hits[0].distance < 3) {
        return false; // touching bone → OK
      }
    }

    return true; // no contact anywhere → ALERT
  };

  return (
    <>
      {/* ======================================================
          🔩 IMPLANTS
      ====================================================== */}

      {implants.map((imp) => {

        const axis = new THREE.Vector3(0, 1, 0)
          .applyQuaternion(imp.quaternion)
          .normalize();

        const tipPos = imp.position
          .clone()
          .add(axis.clone().multiplyScalar(screwDepth));

        const outside = implantOutside(tipPos);

        if (!outside) return null;

        return (
          <mesh key={`imp-${imp.id}`} position={tipPos}>
            <torusGeometry args={[14, 1.5, 20, 80]} />
            <meshBasicMaterial
              color="red"
              transparent
              opacity={0.95}
              depthWrite={false}
              depthTest={false}
            />
          </mesh>
        );
      })}

      {/* ======================================================
          👑 CROWNS
      ====================================================== */}

      {crowns.map((c) => {

        const axis = new THREE.Vector3(0, 0, 1)
          .applyQuaternion(c.quaternion)
          .normalize();

        const surfacePos = c.position
          .clone()
          .sub(axis.clone().multiplyScalar(crownOffset));

        const detached = crownDetached(surfacePos);

        if (!detached) return null;

        return (
          <mesh key={`crown-${c.id}`} position={surfacePos}>
            <torusGeometry args={[12, 1.2, 20, 80]} />
            <meshBasicMaterial
              color="orange"
              transparent
              opacity={0.95}
              depthWrite={false}
              depthTest={false}
            />
          </mesh>
        );
      })}
    </>
  );
}