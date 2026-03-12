import { useLoader } from "@react-three/fiber";
import { STLLoader } from "three-stdlib";
import { useMemo } from "react";
import * as THREE from "three";
import { useAppSelector } from "../../app/hooks";

type Vec3 = [number, number, number];

type JawData = {
  id: string;
  modelPath: string;
  position: THREE.Vector3 | Vec3;
  quaternion?: THREE.Quaternion;
  scale?: THREE.Vector3 | Vec3;
  opacity?: number;
  visible?: boolean;
};

type Props = {
  data?: JawData;
  onClick: (e: any) => void;
  opacity?: number;
};

export default function JawModel({ data, onClick, opacity }: Props) {

  const activeTool = useAppSelector(s => s.tool.activeTool);

  const rawGeometry = useLoader(
    STLLoader,
    data?.modelPath ?? "/models/jaw.stl"
  );

  // const geometry = useMemo(() => {
  //   const g = rawGeometry.clone();
  // //  g.center();
  //   g.computeVertexNormals();
  //   return g;
  // }, [rawGeometry]);

  const geometry = useMemo(() => {
  const g = rawGeometry.clone();

  // IMPORTANT
  g.computeBoundingBox();

  console.log("THREE BOUNDS:", g.boundingBox);

  g.computeVertexNormals();

  return g;
}, [rawGeometry]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (activeTool !== "placeObject") return;
    onClick(e);
  };

  const position = useMemo(() => {
    if (!data?.position) return new THREE.Vector3(0, 0, 0);
    return Array.isArray(data.position)
      ? new THREE.Vector3(...data.position)
      : data.position;
  }, [data?.position]);

  const quaternion =
    data?.quaternion ?? new THREE.Quaternion();

  const scale = useMemo(() => {
    if (!data?.scale) return new THREE.Vector3(1, 1, 1);
    return Array.isArray(data.scale)
      ? new THREE.Vector3(...data.scale)
      : data.scale;
  }, [data?.scale]);

  const visible = data?.visible ?? true;

  // const finalOpacity =
  //   data?.opacity ?? opacity ?? 1;

  const finalOpacity = opacity ?? data?.opacity ?? 1;

  return (
  <mesh
    geometry={geometry}
    position={position}
    quaternion={quaternion}
    scale={scale}
    visible={visible}
    onClick={handleClick}
    name="jaw"
    frustumCulled={false}
  >
    <meshStandardMaterial
      color="#e5e7eb"
      metalness={0}
      roughness={1}
      side={THREE.DoubleSide}
      transparent={true}
      //opacity={finalOpacity}
      opacity={0}
      depthWrite={false}
      depthTest={true}
    />
  </mesh>
);
}