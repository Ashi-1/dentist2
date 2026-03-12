import SceneLights from "../SceneLights";
import JawLayer from "../layers/JawLayer";
import ObjectsLayer from "../layers/ObjectsLayer";
import ToolsLayer from "../tools/ToolsLayer";
import CameraControls from "./CameraControls";


export default function SceneRoot({
  orbitRef,
  handleClick,
  jawOpacity,
}: any) {
  return (
    <>
    
      <SceneLights />

      {/* 🦴 Dynamic anatomy */}
      <JawLayer
        onClick={handleClick}
        opacity={jawOpacity}
      />

      {/* 🔩 Dynamic objects */}
      <ObjectsLayer />

      {/* 🛠 Tools */}
      <ToolsLayer orbitRef={orbitRef} />

      <CameraControls orbitRef={orbitRef} />
    </>
  );
}