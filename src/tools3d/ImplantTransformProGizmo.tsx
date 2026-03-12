import { TransformControls } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectObject } from "../features/selection/selectionSlice";
import { updateObject } from "../features/scene/sceneSlice";

type Props = {
  orbitRef: React.RefObject<any>;
};

export default function ImplantTransformProGizmo({ orbitRef }: Props) {

  const dispatch = useAppDispatch();

  const objects = useAppSelector(s => s.scene.objects);

  const implants = objects.filter(o => o.type === "implant");
  const crowns = objects.filter(o => o.type === "crown");

  const selectedIds = useAppSelector(s => s.selection.selectedIds);
  const selectedId = selectedIds[0] ?? null;

  const transformMode = useAppSelector(s => s.tool.transformMode);
  const activeTool = useAppSelector(s => s.tool.activeTool);

  const screwDepth = useAppSelector(s => s.settings.placement.screwDepth);

  const ref = useRef<THREE.Group>(null);
  const [pivotReady, setPivotReady] = useState(false);

  /* ================= SELECTED OBJECT ================= */

  const selectedImplant =
    implants.find(i => i.id === selectedId) ?? null;

  const selectedCrown =
    crowns.find(c => c.id === selectedId) ?? null;

  const selectedObject = selectedImplant || selectedCrown;

  /* ================= UPDATE TRANSFORM ================= */

  const update = () => {

    if (!selectedObject || !ref.current) return;

    if (selectedImplant) {

      const axis = new THREE.Vector3(0, 1, 0)
        .applyQuaternion(selectedImplant.quaternion)
        .normalize();

      const newBasePos = ref.current.position
        .clone()
        .add(axis.clone().multiplyScalar(-screwDepth));

      dispatch(updateObject({
        id: selectedImplant.id,
        changes: {
          position: newBasePos,
          quaternion: ref.current.quaternion.clone(),
          scale: ref.current.scale.clone(),
        },
      }));
    }

    if (selectedCrown) {

      dispatch(updateObject({
        id: selectedCrown.id,
        changes: {
          position: ref.current.position.clone(),
          quaternion: ref.current.quaternion.clone(),
          scale: ref.current.scale.clone(),
        },
      }));
    }
  };

  /* ================= SELECTION HANDLES (INVISIBLE) ================= */

  const renderHandles = () => (
    <>
      {implants.map((imp) => {

        const axis = new THREE.Vector3(0, 1, 0)
          .applyQuaternion(imp.quaternion)
          .normalize();

        const pos = imp.position
          .clone()
          .add(axis.multiplyScalar(screwDepth));

        return (
          <mesh
            key={imp.id}
            position={pos}
            onClick={(e) => {
              e.stopPropagation();
              dispatch(selectObject(imp.id));
            }}
          >
            {/* Invisible clickable volume */}
            <sphereGeometry args={[10, 12, 12]} />
            <meshBasicMaterial
              transparent
              opacity={0}
              depthWrite={false}
            />
          </mesh>
        );
      })}

      {crowns.map((c) => (
        <mesh
          key={c.id}
          position={[c.position.x, c.position.y, c.position.z]}
          onClick={(e) => {
            e.stopPropagation();
            dispatch(selectObject(c.id));
          }}
        >
          <sphereGeometry args={[10, 12, 12]} />
          <meshBasicMaterial
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );

  /* ================= PIVOT OBJECT ================= */

  const renderPivot = () => {

    if (!selectedObject) return null;

    const pos =
      selectedImplant
        ? (() => {
            const axis = new THREE.Vector3(0, 1, 0)
              .applyQuaternion(selectedImplant.quaternion)
              .normalize();

            return selectedImplant.position
              .clone()
              .add(axis.multiplyScalar(screwDepth));
          })()
        : selectedCrown!.position.clone();

    return (
      <group
        ref={(node) => {
          ref.current = node as THREE.Group;
          setPivotReady(!!node);
        }}
        key={selectedObject.id}
        position={pos}
        quaternion={selectedObject.quaternion}
        scale={selectedObject.scale ?? [1, 1, 1]}
      />
    );
  };

  /* ================= GIZMO ================= */

  const renderGizmo = () => {

    if (
      activeTool !== "transform" ||
      !selectedObject ||
      !pivotReady ||
      !ref.current
    ) return null;

    return (
      <TransformControls
        key={selectedObject.id + "-" + transformMode}
        object={ref.current}
        mode={transformMode}
        size={0.8}
        onMouseDown={() =>
          orbitRef.current && (orbitRef.current.enabled = false)
        }
        onMouseUp={() => {
          orbitRef.current && (orbitRef.current.enabled = true);
          update();
        }}
        onObjectChange={update}
      />
    );
  };

  /* ================= RENDER ================= */

  return (
    <>
      {renderHandles()}

      {activeTool === "transform" && (
        <>
          {renderPivot()}
          {renderGizmo()}
        </>
      )}
    </>
  );
}