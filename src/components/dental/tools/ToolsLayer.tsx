import ImplantTransformProGizmo from "../../../tools3d/ImplantTransformProGizmo";
import MeasurementTool from "../../../tools3d/MeasurementTool";
//import CollisionIndicator from "../../../tools3d/CollisionIndicator";
 //import ImplantAnalysisRings from "../../../tools3d/ImplantAnalysisRings";
// import PrepDrillTool from "../../../tools3d/PrepDrillTool";
import ImplantAxisGuide from "../../../tools3d/ImplantAxisGuide";
import AnnotationTool from "../../../tools3d/AnnotationTool";
import FreehandMarkingTool from "../../../tools3d/FreehandMarkingTool";
import LocalMagnifierLens from "../../../tools3d/LocalMagnifierLens";
// import CrossSectionPlane from "../../../tools3d/CrossSectionPlane";
//import SectionBox from "../../../tools3d/SectionBox";
import FocusJawTool from "../../../tools3d/FocusJawTool";
import CameraPresets from "../../../tools3d/CameraPresets";
 import BoneDepthIndicator from "../../../tools3d/BoneDepthIndicator";


export default function ToolsLayer({ orbitRef }: any) {
  return (
    <>
      <ImplantTransformProGizmo orbitRef={orbitRef} />

      <MeasurementTool />

     {/* <CollisionIndicator /> */}
      {/* <ImplantAnalysisRings /> */}
      {/* <PrepDrillTool /> */}

      <ImplantAxisGuide />

      <AnnotationTool />

      {/* ✅ FIX — pass orbitRef */}
      <FreehandMarkingTool orbitRef={orbitRef} />
      <LocalMagnifierLens />
    {/* <CrossSectionPlane orbitRef={orbitRef} /> */}
    {/* <SectionBox orbitRef={orbitRef} /> */}
    <FocusJawTool orbitRef={orbitRef} />
    <CameraPresets orbitRef={orbitRef} />
    <BoneDepthIndicator />
   
    </>
  );
}