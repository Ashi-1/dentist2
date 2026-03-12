import { useLoader } from "@react-three/fiber";
import { STLLoader } from "three-stdlib";
import { useMemo } from "react";
import * as THREE from "three";

type Props = {
  position: THREE.Vector3 | number[];
  quaternion: THREE.Quaternion;
  scale?: THREE.Vector3 | [number, number, number]; // ⭐ NEW
};

export default function Crown({
  position,
  quaternion,
  scale = [0.40, 0.30, 0.35], // ⭐ DEFAULT
}: Props) {

  const rawGeometry = useLoader(STLLoader, "/models/crown.stl");

  const geometry = useMemo(() => {
    const g = rawGeometry.clone();

    g.rotateX(Math.PI / 2);
    g.center();

    return g;
  }, [rawGeometry]);

  return (
    <mesh
      geometry={geometry}
      position={position as any}
      quaternion={quaternion}
      scale={scale}   // ⭐ FIX
    >
      <meshStandardMaterial color="#fff5d6" />
    </mesh>
  );
}