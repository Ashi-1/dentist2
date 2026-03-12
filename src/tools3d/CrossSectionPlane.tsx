import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { TransformControls } from "@react-three/drei";

export default function CrossSectionPlane({ orbitRef }: any) {
  const { scene, gl } = useThree();
  const [enabled, setEnabled] = useState(false);

  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, -1), 0));
  const planeMesh = useRef<THREE.Mesh>(null);

  // ⭐ GLOBAL CLIPPING — STABLE METHOD
  useEffect(() => {
    if (enabled) {
      gl.clippingPlanes = [plane.current];
      gl.localClippingEnabled = true;
    } else {
      gl.clippingPlanes = [];
    }
  }, [enabled, gl]);

  // 🔎 Find jaw for positioning only
  const getJaw = () => {
    let jaw: THREE.Mesh | null = null;
    scene.traverse((o: any) => {
      if (o.isMesh && o.name === "jaw") jaw = o;
    });
    return jaw;
  };

  // ⭐ Spawn plane in front
  useEffect(() => {
    if (!enabled || !planeMesh.current) return;

    const jaw = getJaw();
    if (!jaw) return;

    const box = new THREE.Box3().setFromObject(jaw);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    planeMesh.current.position.set(
      center.x,
      center.y,
      center.z + size.z * 1.2
    );
  }, [enabled]);

  // ⭐ Sync plane equation
  useFrame(() => {
    if (!planeMesh.current) return;

    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(
      planeMesh.current.quaternion
    );

    plane.current.setFromNormalAndCoplanarPoint(
      normal,
      planeMesh.current.position
    );
  });

  // ⭐ Shortcuts
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "l") setEnabled((v) => !v);
      if (e.key === "Escape") setEnabled(false);
    };

    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* Visible plane */}
      <mesh ref={planeMesh}>
        <planeGeometry args={[400, 400]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Move control */}
      <TransformControls
        object={planeMesh.current as THREE.Object3D}
        mode="translate"
        onMouseDown={() =>
          orbitRef?.current && (orbitRef.current.enabled = false)
        }
        onMouseUp={() =>
          orbitRef?.current && (orbitRef.current.enabled = true)
        }
      />
    </>
  );
}