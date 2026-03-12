import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { TransformControls } from "@react-three/drei";

export default function SectionBoxTool({ orbitRef }: any) {
  const { scene } = useThree();

  const [enabled, setEnabled] = useState(false);

  const boxRef = useRef<THREE.Mesh>(null);
  const jawRef = useRef<THREE.Mesh | null>(null);

  // 🔍 find jaw
  useEffect(() => {
    jawRef.current = scene.getObjectByName("jaw") as THREE.Mesh | null;
  }, [scene]);

  // 🧠 Apply shader clipping
  useEffect(() => {
    const jaw = jawRef.current;
    if (!jaw) return;

    const mat = jaw.material as THREE.MeshStandardMaterial;

    if (!enabled) {
      mat.onBeforeCompile = () => {};
      mat.needsUpdate = true;
      return;
    }

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.boxMin = { value: new THREE.Vector3() };
      shader.uniforms.boxMax = { value: new THREE.Vector3() };

      shader.vertexShader =
        "varying vec3 vWorldPos;\n" +
        shader.vertexShader.replace(
          "#include <worldpos_vertex>",
          `
          #include <worldpos_vertex>
          vWorldPos = worldPosition.xyz;
          `
        );

      shader.fragmentShader =
        "varying vec3 vWorldPos;\n uniform vec3 boxMin; uniform vec3 boxMax;\n" +
        shader.fragmentShader.replace(
          "#include <clipping_planes_fragment>",
          `
          if(
            vWorldPos.x < boxMin.x || vWorldPos.x > boxMax.x ||
            vWorldPos.y < boxMin.y || vWorldPos.y > boxMax.y ||
            vWorldPos.z < boxMin.z || vWorldPos.z > boxMax.z
          ){
            discard;
          }
          `
        );

      jaw.userData.shader = shader;
    };

    mat.needsUpdate = true;
  }, [enabled]);

  // 🔄 update box bounds every frame
  useEffect(() => {
    const id = setInterval(() => {
      if (!enabled) return;

      const jaw = jawRef.current;
      const box = boxRef.current;
      if (!jaw || !box) return;

      const shader = jaw.userData.shader;
      if (!shader) return;

      const bounds = new THREE.Box3().setFromObject(box);

      shader.uniforms.boxMin.value.copy(bounds.min);
      shader.uniforms.boxMax.value.copy(bounds.max);
    }, 16);

    return () => clearInterval(id);
  }, [enabled]);

  // ⌨️ HOTKEYS
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "b") setEnabled((v) => !v);
      if (e.key === "Escape") setEnabled(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* 🔷 Section box */}
      <mesh ref={boxRef} scale={[80, 80, 80]}>
        <boxGeometry />
        <meshBasicMaterial wireframe color="#00ffff" />
      </mesh>

      {/* 🔷 Move box */}
      {boxRef.current && (
        <TransformControls
          object={boxRef.current}
          mode="translate"
          onMouseDown={() =>
            orbitRef?.current && (orbitRef.current.enabled = false)
          }
          onMouseUp={() =>
            orbitRef?.current && (orbitRef.current.enabled = true)
          }
        />
      )}
    </>
  );
}