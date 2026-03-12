import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useAppSelector } from "../app/hooks";
import { Html } from "@react-three/drei";
import { useMemo } from "react";

export default function JawBasePlaneWithDistance() {

  const { scene } = useThree();

  /* ⭐ NEW — get objects instead of implants/crowns */
  const objects = useAppSelector(s => s.scene.objects);

  const implants = objects.filter(o => o.type === "implant");
  const crowns = objects.filter(o => o.type === "crown");

  // ✅ REDUX VISIBILITY CONTROL (UNCHANGED)
  const visible = useAppSelector(s => s.boneDepth.visible);

  const jawMesh = scene.getObjectByName("jaw") as THREE.Mesh | null;

  const planeData = useMemo(() => {

    if (!jawMesh) return null;

    const box = new THREE.Box3().setFromObject(jawMesh);

    const size = new THREE.Vector3();
    box.getSize(size);

    const center = box.getCenter(new THREE.Vector3());

    return {
      center,
      size,
      zPlane: box.min.z
    };

  }, [jawMesh]);

  // ✅ ONLY ADD visible check — NOTHING ELSE CHANGED
  if (!planeData || !visible) return null;

  const { center, size, zPlane } = planeData;

  return (
    <>
      {/* =======================
          STABLE XY PLANE
      ======================= */}

      <mesh position={[center.x, center.y, zPlane + 0.01]}>
        <planeGeometry args={[size.x * 1.3, size.y * 1.3]} />
        <meshBasicMaterial
          color="#00ffaa"
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      {/* =======================
          IMPLANT DISTANCE
      ======================= */}

      {implants.map((imp) => {

        const dist = Math.abs(imp.position.z - zPlane);

        const start = new THREE.Vector3(
          imp.position.x,
          imp.position.y,
          imp.position.z
        );

        const end = new THREE.Vector3(
          imp.position.x + 12,
          imp.position.y + 12,
          imp.position.z
        );

        const dir = new THREE.Vector3().subVectors(end, start).normalize();
        const length = start.distanceTo(end);

        return (
          <group key={`imp-plane-${imp.id}`}>

            <primitive
              object={
                new THREE.ArrowHelper(
                  dir,
                  start,
                  length,
                  0x00ffaa,
                  2,
                  1
                )
              }
            />

            <Html
              position={[end.x, end.y, end.z]}
              center
              style={{ pointerEvents: "none" }}
            >
              <div style={{
                background: "#0b0f12",
                color: "#00ffaa",
                padding: "6px 12px",
                borderRadius: 12,
                fontWeight: 700,
                boxShadow: "0 4px 14px rgba(0,255,170,0.35)",
                whiteSpace: "nowrap"
              }}>
                {dist.toFixed(1)} mm
              </div>
            </Html>

          </group>
        );
      })}

      {/* =======================
          CROWN DISTANCE
      ======================= */}

      {crowns.map((c) => {

        const dist = Math.abs(c.position.z - zPlane);

        const start = new THREE.Vector3(
          c.position.x,
          c.position.y,
          c.position.z
        );

        const end = new THREE.Vector3(
          c.position.x - 12,
          c.position.y + 12,
          c.position.z
        );

        const dir = new THREE.Vector3().subVectors(end, start).normalize();
        const length = start.distanceTo(end);

        return (
          <group key={`crown-plane-${c.id}`}>

            <primitive
              object={
                new THREE.ArrowHelper(
                  dir,
                  start,
                  length,
                  0x00ffaa,
                  2,
                  1
                )
              }
            />

            <Html
              position={[end.x, end.y, end.z]}
              center
              style={{ pointerEvents: "none" }}
            >
              <div style={{
                background: "#0b0f12",
                color: "#00ffaa",
                padding: "6px 12px",
                borderRadius: 12,
                fontWeight: 700,
                boxShadow: "0 4px 14px rgba(0,255,170,0.35)",
                whiteSpace: "nowrap"
              }}>
                {dist.toFixed(1)} mm
              </div>
            </Html>

          </group>
        );
      })}

    </>
  );
}