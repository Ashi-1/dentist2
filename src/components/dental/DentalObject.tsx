import { useLoader } from "@react-three/fiber";
import { STLLoader } from "three-stdlib";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import type { DentalObject } from "../../features/scene/DentalObject";

export default function DentalObject3D({
  data,
}: {
  data: DentalObject;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  /* ================= LOAD STL ================= */

  const rawGeometry = useLoader(
    STLLoader,
    data.modelPath
  );

  /* ================= PREP GEOMETRY ================= */

  const geometry = useMemo(() => {
    const g = rawGeometry.clone();

    g.center();

    // ⭐🔥 MAIN FIX — remove embedded vertex colors (causes black parts)
    if (g.hasAttribute("color")) {
      g.deleteAttribute("color");
    }

    // ⭐ Rebuild normals for proper lighting
    g.computeVertexNormals();

    // ⭐ Smooth shading (safe)
    g.normalizeNormals?.();

    // ⭐ Optional alignment (kept from your logic)
    g.rotateX(Math.PI);

    return g;
  }, [rawGeometry]);

  /* ================= RENDER ================= */

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={data.position}
      quaternion={data.quaternion}
      scale={data.scale ?? [1, 1, 1]}
      visible={data.visible ?? true}
    >
      <meshStandardMaterial
        color={
          data.type === "crown"
            ? "#F5F1E6" // 🦷 natural enamel
            : "#D4AF37" // 🔩 titanium implant
        }
        metalness={data.type === "implant" ? 0.75 : 0.05}
        roughness={data.type === "implant" ? 0.4 : 0.7}
        vertexColors={false} // ⭐ ensure STL colors ignored
      />
    </mesh>
  );
}