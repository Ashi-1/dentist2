import { Canvas, useLoader } from "@react-three/fiber";
import { Suspense, memo, useRef, useEffect, useState } from "react";
import { STLLoader } from "three-stdlib";

import SceneRoot from "./scene/SceneRoot";
import { handlePlacement } from "./placement/PlacementHandler";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import VtkViewer from "../../medical/vtk/VtkViewer";

/* ⭐ GLOBAL SHORTCUTS */
import KeyboardShortcuts from "../system/KeyboardShortcuts";
import GlobalLoader from "../ui/GlobalLoader";

import VtkCameraSync from "../../medical/vtk/VtkCameraSync"
import { vtkEngineRef } from "../../medical/vtk/VtkViewer"

const DentalViewer = memo(function DentalViewer() {

  const dispatch = useAppDispatch();

  /* ================= STATE ================= */

  const jawOpacity = useAppSelector(
    (s) => s.settings.visual.jawOpacity
  );

  const activeTool = useAppSelector((s) => s.tool.activeTool);
  const placeType = useAppSelector((s) => s.tool.placeType);

  /* Three controls ref */
  const orbitRef = useRef<any>(null);

  /* ================= PRELOAD ================= */

  const screwGeo = useLoader(
    STLLoader,
    "/models/implant_screw.stl"
  );

  const crownGeo = useLoader(
    STLLoader,
    "/models/crown.stl"
  );

  /* ================= PLACEMENT ================= */

  const handleClick = (e: any) =>
    handlePlacement(e, activeTool, placeType, dispatch);

  /* ================= MENU DETECTION ================= */

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {

    const checkMenu = () => {
      const menu = document.querySelector(".w-72");
      setMenuOpen(!!menu);
    };

    const observer = new MutationObserver(checkMenu);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    checkMenu();

    return () => observer.disconnect();

  }, []);

  /* ================= RENDER ================= */

  return (
    <div
      className={`relative w-full h-full overflow-hidden transition-transform duration-300 ${
        menuOpen ? "-translate-x-40" : "translate-x-0"
      }`}
    >

      {/* 🧠 VTK Medical Renderer */}
      <VtkViewer threeCamera={orbitRef} />

      <Canvas
        className="w-full h-full block"
        gl={{ preserveDrawingBuffer: true }}
        camera={{
          position: [0, 120, 260],
          fov: 45,
          near: 0.1,
          far: 10000,
        }}
      >

        <Suspense fallback={null}>

          {/* ⭐ GLOBAL SHORTCUT SYSTEM */}
          <KeyboardShortcuts />

          {/* ⚡ Preload models */}
          <mesh geometry={screwGeo} visible={false} />
          <mesh geometry={crownGeo} visible={false} />

          {/* 🌍 Entire 3D Scene */}
          <SceneRoot
            orbitRef={orbitRef}
            handleClick={handleClick}
            jawOpacity={jawOpacity}
          />

          <VtkCameraSync
  engineRef={vtkEngineRef}
  orbitRef={orbitRef}
/>

        </Suspense>

        <GlobalLoader />

      </Canvas>

    </div>
  );
});

export default DentalViewer;