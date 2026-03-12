import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useAppSelector } from "../app/hooks";

type Props = {
  orbitRef: React.RefObject<any>;
};

export default function FreehandMarkingTool({ orbitRef }: Props) {
  const { gl, camera, scene, raycaster } = useThree();

  // ⭐ Redux state
  const active = useAppSelector(
    (state) => state.freehandMarking.enabled
  );

  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState<THREE.Vector3[]>([]);

  const mouse = useRef(new THREE.Vector2());

  /* ================= START / STOP DRAW ================= */

  useEffect(() => {
    if (!active) return;

    const onDown = () => {
      setDrawing(true);

      if (orbitRef?.current) orbitRef.current.enabled = false;
    };

    const onUp = () => {
      setDrawing(false);

      if (orbitRef?.current) orbitRef.current.enabled = true;
    };

    gl.domElement.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      gl.domElement.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [active, gl, orbitRef]);

  /* ================= DRAW ================= */

  useEffect(() => {
    if (!drawing || !active) return;

    const onMove = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();

      mouse.current.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      raycaster.setFromCamera(mouse.current, camera);

      const hits = raycaster.intersectObjects(scene.children, true);
      if (!hits.length) return;

      setPoints((prev) => [...prev, hits[0].point.clone()]);
    };

    gl.domElement.addEventListener("mousemove", onMove);

    return () =>
      gl.domElement.removeEventListener("mousemove", onMove);
  }, [drawing, active, gl, camera, scene, raycaster]);

  /* ================= NOT ACTIVE ================= */

  if (!active) return null;

  /* ================= RENDER ================= */

  if (points.length < 2) return null;

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color="#00ffff" linewidth={2} />
    </line>
  );
}