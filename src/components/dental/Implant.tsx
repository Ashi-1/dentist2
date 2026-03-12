import { useLoader } from "@react-three/fiber";
import { STLLoader } from "three-stdlib";
import * as THREE from "three";
import { useMemo } from "react";

type Props = {
  position: THREE.Vector3 | [number, number, number];
  quaternion: THREE.Quaternion;
  scale?: THREE.Vector3 | [number, number, number];
};

export default function Implant({
  position,
  quaternion,
  scale,
}: Props) {

  const rawGeometry = useLoader(
    STLLoader,
    "/models/implant_screw.stl"
  );

  const geometry = useMemo(() => {
    const g = rawGeometry.clone();

    g.center();
    g.rotateX(Math.PI);

    g.computeVertexNormals(); // ⭐ IMPORTANT

    g.computeBoundingBox();
    const height = g.boundingBox?.max.y ?? 0;
    g.translate(0, -height / 2, 0);

    return g;
  }, [rawGeometry]);

  return (
    <mesh
      geometry={geometry}
      position={position}
      quaternion={quaternion}
      scale={scale ?? [1, 1, 1]}
    >
      <meshStandardMaterial
        color="#BFC3C7"     // ⭐ titanium grey
        metalness={0.75}    // ⭐ NOT 1
        roughness={0.4}     // ⭐ brushed surface
      />
    </mesh>
  );
}