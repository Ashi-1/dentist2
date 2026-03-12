import { useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { useAppSelector } from "../app/hooks";

export default function FocusJawTool({ orbitRef }: any) {

  const { scene, camera, gl } = useThree();

  // ⭐ Listen Redux event
  const focusRequestId = useAppSelector(
    (s) => s.focus.focusJawRequestId
  );

  const startPos = new THREE.Vector3();
  const targetPos = new THREE.Vector3();
  const startTarget = new THREE.Vector3();
  const targetTarget = new THREE.Vector3();

  let animating = false;
  let progress = 0;

  const duration = 1.6;

  /* ================= CORE ANIMATION ================= */

  const animateTo = (
    center: THREE.Vector3,
    view: "front" | "side" | "top"
  ) => {

    const jaw = scene.getObjectByName("jaw") as THREE.Mesh | null;
    if (!jaw) return;

    const box = new THREE.Box3().setFromObject(jaw);
    const size = new THREE.Vector3();
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 2;

    startPos.copy(camera.position);
    startTarget.copy(orbitRef?.current?.target || new THREE.Vector3());

    if (view === "front")
      targetPos.set(center.x, center.y, center.z + distance);

    if (view === "side")
      targetPos.set(center.x + distance, center.y, center.z);

    if (view === "top")
      targetPos.set(center.x, center.y + distance, center.z);

    targetTarget.copy(center);

    progress = 0;
    animating = true;
  };

  /* ================= FOCUS JAW ================= */

  const focusJaw = (view: "front" | "side" | "top" = "front") => {

    const jaw = scene.getObjectByName("jaw") as THREE.Mesh | null;
    if (!jaw) return;

    const box = new THREE.Box3().setFromObject(jaw);
    const center = new THREE.Vector3();
    box.getCenter(center);

    animateTo(center, view);
  };

  /* ================= REDUX TRIGGER ================= */

  useEffect(() => {
    if (focusRequestId === 0) return;

    focusJaw("front");

  }, [focusRequestId]);

  /* ================= FRAME LOOP ================= */

  useFrame((_, delta) => {

    if (!animating) return;

    progress += delta / duration;

    if (progress >= 1) {
      progress = 1;
      animating = false;
    }

    const eased =
      progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    camera.position.lerpVectors(startPos, targetPos, eased);

    const currentTarget = new THREE.Vector3().lerpVectors(
      startTarget,
      targetTarget,
      eased
    );

    if (orbitRef?.current) {
      orbitRef.current.target.copy(currentTarget);
      orbitRef.current.update();
    }

    camera.lookAt(currentTarget);
  });

  /* ================= DOUBLE CLICK (SAFE UX) ================= */

  useEffect(() => {

    const onDoubleClick = () => focusJaw("front");

    gl.domElement.addEventListener("dblclick", onDoubleClick);

    return () => {
      gl.domElement.removeEventListener("dblclick", onDoubleClick);
    };

  }, [scene, camera, gl]);

  return null;
}