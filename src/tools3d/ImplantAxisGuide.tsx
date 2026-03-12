import { useAppSelector } from "../app/hooks";

import * as THREE from "three";
import { useMemo } from "react";
import { Html } from "@react-three/drei";

export default function ImplantAxisGuideClean() {

  const active = useAppSelector(s => s.axisGuide.active);

  // ⭐ NEW — generic scene objects
  const objects = useAppSelector(s => s.scene.objects);

  // ⭐ NEW selection model
  const selectedIds = useAppSelector(s => s.selection.selectedIds);
  const selectedId = selectedIds[0] ?? null;

  /* ===== FIND SELECTED OBJECT ===== */

  const obj = useMemo(() => {

    if (!selectedId) return null;

    return objects.find(o => o.id === selectedId) ?? null;

  }, [objects, selectedId]);

  if (!active || !obj) return null;

  /* ===== AXIS CALCULATION ===== */

  const axis = new THREE.Vector3(0, 1, 0)
    .applyQuaternion(obj.quaternion)
    .normalize();

  const vertical = new THREE.Vector3(0, 1, 0);

  const angleDeg = THREE.MathUtils
    .radToDeg(axis.angleTo(vertical))
    .toFixed(1);

  const pos = obj.position;
  const length = 35;
  const tip = axis.clone().multiplyScalar(length);

  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    axis
  );

  return (
    <group position={[pos.x, pos.y, pos.z]}>

      {/* HORIZONTAL PLANE */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[28, 64]} />
        <meshBasicMaterial
          color="#66ccff"
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>

      {/* WORLD VERTICAL */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, -35, 0, 0, 35, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#bbbbbb" />
      </line>

      {/* OBJECT AXIS */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, 0, tip.x, tip.y, tip.z]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00ffff" />
      </line>

      {/* ARROW */}
      <mesh position={[tip.x, tip.y, tip.z]} quaternion={q}>
        <coneGeometry args={[2.5, 7, 20]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* ANGLE ARC */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry
          args={[
            18,
            18.5,
            64,
            1,
            0,
            THREE.MathUtils.degToRad(Number(angleDeg)),
          ]}
        />
        <meshBasicMaterial
          color="#ffcc00"
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* LABEL */}
      <Html position={[tip.x * 1.15, tip.y * 1.15, tip.z * 1.15]} center>
        <div style={{
          background: "#000000cc",
          color: "#00ffff",
          padding: "6px 10px",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "bold",
          whiteSpace: "nowrap"
        }}>
          {angleDeg}°
        </div>
      </Html>

    </group>
  );
}