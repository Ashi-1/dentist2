import { useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function CameraPresets({ orbitRef }: any) {

  const { scene, camera } = useThree();

  const startPos = new THREE.Vector3();
  const targetPos = new THREE.Vector3();
  const startTarget = new THREE.Vector3();
  const targetTarget = new THREE.Vector3();

  let animating = false;
  let progress = 0;

  const duration = 1.2;

  /* ================= CORE ================= */

  const animateTo = (center: THREE.Vector3, view: string) => {

    const jaw = scene.getObjectByName("jaw") as THREE.Mesh | null;
    if (!jaw) return;

    const box = new THREE.Box3().setFromObject(jaw);
    const size = new THREE.Vector3();
    box.getSize(size);

    const distance = Math.max(size.x, size.y, size.z) * 2;

    startPos.copy(camera.position);
    startTarget.copy(orbitRef?.current?.target || new THREE.Vector3());

    switch (view) {

      case "front":
        targetPos.set(center.x, center.y, center.z + distance);
        break;

      case "back":   // ⭐ NEW 180° VIEW
        targetPos.set(center.x, center.y, center.z - distance);
        break;

      case "right":
        targetPos.set(center.x + distance, center.y, center.z);
        break;

      case "left":
        targetPos.set(center.x - distance, center.y, center.z);
        break;

      case "top":
        targetPos.set(center.x, center.y + distance, center.z);
        break;

      case "iso":
        targetPos.set(
          center.x + distance,
          center.y + distance,
          center.z + distance
        );
        break;
    }

    targetTarget.copy(center);

    progress = 0;
    animating = true;
  };

  /* ================= GET CENTER ================= */

  const focus = (view: string) => {

    const jaw = scene.getObjectByName("jaw") as THREE.Mesh | null;
    if (!jaw) return;

    const box = new THREE.Box3().setFromObject(jaw);
    const center = new THREE.Vector3();
    box.getCenter(center);

    animateTo(center, view);
  };

  /* ================= SHORTCUTS ================= */

  useEffect(() => {

    const onKey = (e: KeyboardEvent) => {

      if (!e.altKey) return;

      switch (e.key) {

        case "1":
          focus("front");
          break;

        case "6":      // ⭐ BACK VIEW
          focus("back");
          break;

        case "2":
          focus("right");
          break;

        case "3":
          focus("left");
          break;

        case "4":
          focus("top");
          break;

        case "5":
          focus("iso");
          break;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);

  }, []);

  /* ================= ANIMATION ================= */

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

  return null;
}