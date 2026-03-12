import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  addPoint,
  removeSegment,
} from "../features/measurement/measurementSlice";

export default function MeasurementTool() {
  const dispatch = useAppDispatch();

  const active = useAppSelector((s) => s.measurement.active);
  const points = useAppSelector((s) => s.measurement.points);

  const { gl, camera, scene, raycaster } = useThree();

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  /* ================= CLICK ONLY WHEN ACTIVE ================= */

  useEffect(() => {
    if (!active) return;

    const handleClick = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();

      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      raycaster.setFromCamera(mouse, camera);

      const hits = raycaster.intersectObjects(scene.children, true);
      if (!hits.length) return;

      dispatch(addPoint(hits[0].point.clone()));
    };

    gl.domElement.addEventListener("click", handleClick);
    return () =>
      gl.domElement.removeEventListener("click", handleClick);
  }, [active, gl, camera, scene, raycaster, dispatch]);

  /* ================= BUILD SEGMENTS ================= */

  const segments = useMemo(() => {
    const result: {
      p1: THREE.Vector3;
      p2: THREE.Vector3;
      distance: number;
      mid: THREE.Vector3;
      index: number;
    }[] = [];

    for (let i = 0; i < points.length - 1; i += 2) {
      const p1 = points[i];
      const p2 = points[i + 1];
      if (!p2) break;

      result.push({
        p1,
        p2,
        distance: p1.distanceTo(p2),
        mid: p1.clone().add(p2).multiplyScalar(0.5),
        index: i,
      });
    }

    return result;
  }, [points]);

  /* ================= GEOMETRIES (SAFE) ================= */

  const geometries = useMemo(() => {
    return segments.map((s) =>
      new THREE.BufferGeometry().setFromPoints([s.p1, s.p2])
    );
  }, [segments]);

  if (segments.length === 0) return null;

  /* ================= RENDER ================= */

  return (
    <>
      {/* POINTS */}
      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.7, 14, 14]} />
          <meshBasicMaterial color="#7df9ff" />
        </mesh>
      ))}

      {/* SEGMENTS */}
      {segments.map((s, i) => {
        const geometry = geometries[i];

        return (
          <group key={i}>
            {/* VISIBLE LINE */}
           <primitive
  object={
    new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({
        color: hoveredIndex === i ? "#00ffff" : "yellow",
      })
    )
  }
/>

            {/* HOVER DETECTOR */}
        <line
  onPointerOver={() => setHoveredIndex(i)}
  onPointerOut={() => setHoveredIndex(null)}
>
  <bufferGeometry attach="geometry" {...geometry} />
  <lineBasicMaterial
    attach="material"
    transparent
    opacity={0}
  />
</line>

            {/* HOVER LABEL */}
            {hoveredIndex === i && (
              <Html position={s.mid} center>
                <div
                  style={{
                    background: "rgba(0,0,0,0.85)",
                    color: "#00ffff",
                    padding: "4px 8px",
                    borderRadius: 6,
                    fontSize: 12,
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.distance.toFixed(2)} mm
                </div>
              </Html>
            )}

            {/* DELETE BUTTON */}
            <Html position={s.p2} center>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(removeSegment(s.index));
                }}
                style={{
                  width: 18,
                  height: 18,
                  background: "rgba(0,0,0,0.9)",
                  color: "red",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ✕
              </div>
            </Html>
          </group>
        );
      })}
    </>
  );
}