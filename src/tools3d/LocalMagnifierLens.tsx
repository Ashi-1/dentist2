import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { useAppSelector } from "../app/hooks";

export default function LocalMagnifierLens() {

  const { gl, scene, camera, size } = useThree();

  // ⭐ Redux state ONLY (no local shortcuts)
  const active = useAppSelector(
    state => state.magnifier.enabled
  );

  const rt = useRef<THREE.WebGLRenderTarget | null>(null);
  const magCam = useRef(new THREE.PerspectiveCamera());
  const lensRef = useRef<THREE.Mesh>(null);

  const mouse = useRef(new THREE.Vector2());

  /* ================= RENDER TARGET ================= */

  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;

    rt.current = new THREE.WebGLRenderTarget(
      2048 * dpr,
      2048 * dpr,
      { depthBuffer: true }
    );

    rt.current.texture.minFilter = THREE.LinearFilter;
    rt.current.texture.magFilter = THREE.LinearFilter;

    rt.current.texture.anisotropy =
      gl.capabilities.getMaxAnisotropy();

    return () => rt.current?.dispose();
  }, [gl]);

  /* ================= MOUSE ================= */

  useEffect(() => {
    if (!active) return;

    const onMove = (e: MouseEvent) => {
      mouse.current.set(
        (e.clientX / size.width) * 2 - 1,
        -(e.clientY / size.height) * 2 + 1
      );
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [active, size]);

  /* ================= FRAME ================= */

  useFrame(() => {
    if (!active || !rt.current) return;

    const ray = new THREE.Raycaster();
    ray.setFromCamera(mouse.current, camera);

    const hits = ray.intersectObjects(scene.children, true);
    if (!hits.length) return;

    const p = hits[0].point;

    /* ===== ZOOM CAMERA ===== */

    const dir = p.clone().sub(camera.position).normalize();
    const distance = 25;

    magCam.current.position.copy(
      p.clone().sub(dir.multiplyScalar(distance))
    );

    magCam.current.lookAt(p);

    const cam = camera as THREE.PerspectiveCamera;
    magCam.current.fov = cam.fov / 2;
    magCam.current.near = 0.01;
    magCam.current.far = 10000;
    magCam.current.updateProjectionMatrix();

    /* ===== RENDER ===== */

    gl.setRenderTarget(rt.current);
    gl.clear();
    gl.render(scene, magCam.current);
    gl.setRenderTarget(null);

    /* ===== LENS POSITION ===== */

    if (lensRef.current) {
      lensRef.current.position.copy(p);
      lensRef.current.quaternion.copy(camera.quaternion);
    }
  });

  if (!active || !rt.current) return null;

  /* ================= RENDER ================= */

  return (
    <mesh ref={lensRef} renderOrder={999}>
      
      {/* 🔍 ZOOM LENS */}
      <circleGeometry args={[22, 96]} />
      <meshBasicMaterial
        map={rt.current.texture}
        transparent
        depthTest={false}
      />

      {/* ⭐ BORDER RING */}
      <mesh>
        <ringGeometry args={[22.5, 23.5, 128]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.95}
          depthTest={false}
        />
      </mesh>

    </mesh>
  );
}