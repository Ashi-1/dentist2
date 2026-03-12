import { useEffect, useState } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useAppSelector } from "../app/hooks";

export default function AnnotationTool() {
  const { gl, camera, scene, raycaster } = useThree();

  const active = useAppSelector(
    (state) => state.annotation.enabled
  );

  const [annotations, setAnnotations] = useState<
    { position: THREE.Vector3; text: string }[]
  >([]);

  const [inputText, setInputText] = useState("");
  const [inputPos, setInputPos] = useState<THREE.Vector3 | null>(null);

  /* ================= CLICK ================= */

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

      const point = hits[0].point.clone();

      setInputPos(point);
      setInputText("");
    };

    gl.domElement.addEventListener("click", handleClick);

    return () =>
      gl.domElement.removeEventListener("click", handleClick);
  }, [active, gl, camera, scene, raycaster]);

  /* ================= DELETE ================= */

  const deleteAnnotation = (index: number) => {
    setAnnotations((prev) => prev.filter((_, i) => i !== index));
  };

  /* ================= RENDER ================= */

  return (
    <>
      {/* ===== Existing annotations ===== */}
      {annotations.map((a, i) => (
        <group key={i} position={a.position}>
          {/* Marker */}
          <mesh>
            <sphereGeometry args={[1.2, 12, 12]} />
            <meshBasicMaterial color="#00ffff" />
          </mesh>

          {/* Label */}
          <Html position={[0, 6, 0]} center>
            <div
              className="relative bg-[#0b1220]/95 backdrop-blur-xl
                         text-cyan-200 px-3 py-2 rounded-lg
                         border border-cyan-400/40 shadow-xl
                         text-xs font-semibold max-w-[180px]"
            >
              {/* ❌ Delete icon */}
              <button
                onClick={() => deleteAnnotation(i)}
                className="absolute -top-2 -right-2
                           w-5 h-5 rounded-full
                           bg-red-500 hover:bg-red-400
                           text-white text-xs font-bold
                           flex items-center justify-center
                           shadow-lg"
                title="Remove annotation"
              >
                ×
              </button>

              {/* Text */}
              <div className="pr-2 break-words">{a.text}</div>
            </div>
          </Html>
        </group>
      ))}

      {/* ===== Tailwind Input Popup ===== */}
      {inputPos && (
        <Html position={inputPos} center>
          <div
            className="bg-[#0b1220]/95 backdrop-blur-xl
                       border border-cyan-400/40 rounded-xl
                       shadow-2xl p-4 w-56"
          >
            <div className="text-cyan-300 text-sm font-semibold mb-2">
              Add Annotation
            </div>

           <input
  autoFocus
  value={inputText}
  onChange={(e) => setInputText(e.target.value)}

  onKeyDown={(e) => {
    e.stopPropagation(); // ⭐ allow spaces
  }}

  className="w-full bg-black/40 text-cyan-200 px-3 py-2 rounded-lg
             outline-none border border-cyan-500/30
             focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
  placeholder="Enter text..."
/>

            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setInputPos(null)}
                className="px-3 py-1 text-sm rounded-lg
                           bg-gray-700 hover:bg-gray-600 text-white"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (!inputText.trim()) return;

                  setAnnotations((prev) => [
                    ...prev,
                    { position: inputPos, text: inputText },
                  ]);

                  setInputPos(null);
                }}
                className="px-3 py-1 text-sm rounded-lg
                           bg-cyan-500 hover:bg-cyan-400
                           text-black font-semibold"
              >
                Add
              </button>
            </div>
          </div>
        </Html>
      )}
    </>
  );
}