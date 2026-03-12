import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useAppSelector } from "../app/hooks";

export default function ImplantAnalysisRings() {

  const selection = useAppSelector(s => s.selection);
  const implants = useAppSelector(s => s.scene.implants);

  console.log("📌 Selection state:", selection);

  /* ========= FIND SELECTED IMPLANT ========= */

  const implant = useMemo(() => {

    if (!selection) return null;

    const ids = (selection as any).selectedIds;
    const type = (selection as any).type;

    if (type !== "implant" || !ids?.length) {
      console.log("⚠️ Selected object is not implant");
      return null;
    }

    const id = ids[0]; // ⭐ FIRST SELECTED

    const found = implants.find(i => i.id === id) || null;

    console.log("🔩 Implant found:", found);

    return found;

  }, [selection, implants]);

  const groupRef = useRef<THREE.Group>(null);

  /* ========= ANIMATION ========= */

  useFrame(({ clock }) => {

    if (!groupRef.current || !implant) return;

    const t = clock.getElapsedTime();

    groupRef.current.children.forEach((ring, i) => {

      const pulse = (t * 1.5 + i * 0.5) % 3;

      const scale = 1 + pulse * 2;

      ring.scale.setScalar(scale);

      const mat = (ring as any).material;

      if (mat) {
        mat.opacity = Math.max(0, 1 - pulse / 3);
      }
    });
  });

  /* ========= NO IMPLANT → NO RINGS ========= */

  if (!implant) return null;

  /* ========= POSITION ========= */

  const axis = new THREE.Vector3(0, 1, 0)
    .applyQuaternion(implant.quaternion)
    .normalize();

  const basePos = implant.position
    .clone()
    .add(axis.multiplyScalar(10));

  console.log("🎯 Ring position:", basePos);

  /* ========= RENDER ========= */

  return (
    <group
      ref={groupRef}
      position={[basePos.x, basePos.y, basePos.z]}
      quaternion={implant.quaternion}
    >
      {[0, 1, 2].map(i => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[8, 8.6, 64]} />
          <meshBasicMaterial
            color="#00ffe1"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}