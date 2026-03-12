import { OrbitControls } from "@react-three/drei";

export default function CameraControls({ orbitRef }: any) {
  return <OrbitControls ref={orbitRef} enableDamping />;
}