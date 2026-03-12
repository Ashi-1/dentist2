import { useMemo } from "react";
import * as THREE from "three";

export default function SceneLights() {

  // ⭐ Optional: soft shadow settings
  const shadowConfig = useMemo(() => ({
    mapSize: new THREE.Vector2(2048, 2048),
  }), []);

  return (
    <>
      {/* 🌤️ Soft ambient base */}
      <ambientLight intensity={0.35} />

      {/* ☀️ Main surgical light */}
      <directionalLight
        position={[120, 200, 120]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={shadowConfig.mapSize.x}
        shadow-mapSize-height={shadowConfig.mapSize.y}
      />

      {/* 💡 Fill light (remove harsh shadows) */}
      <directionalLight
        position={[-120, 100, -80]}
        intensity={0.45}
      />

      {/* 🔆 Top soft light */}
      <directionalLight
        position={[0, 300, 0]}
        intensity={0.35}
      />
    </>
  );
}