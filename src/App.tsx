import { useEffect, useRef } from "react";
import ControlPanel from "./components/ui/ControlPanel";
import DentalViewer from "./components/dental/DentalViewer";
import VtkDentalViewer from "./vtk/VtkDentalViewer";

import { useAppDispatch } from "./app/hooks";
import { loadScene } from "./features/scene/sceneSlice";

import * as THREE from "three";

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {

  const dispatch = useAppDispatch();
  const loadedRef = useRef(false);

  useEffect(() => {

    if (loadedRef.current) return;
    loadedRef.current = true;

    const fullQuery = window.location.search;
    const urlIndex = fullQuery.indexOf("url=");

    if (urlIndex === -1) return;

    const rawUrl = fullQuery.substring(urlIndex + 4);
    if (!rawUrl) return;

    console.log("🌐 Raw presigned URL detected:");
    console.log(rawUrl);

    dispatch(
      loadScene({
        anatomy: {
          jaws: [
            {
              id: "external-jaw",
              modelPath: rawUrl,
              position: new THREE.Vector3(0, 0, 0),
              quaternion: new THREE.Quaternion(),
              scale: new THREE.Vector3(1, 1, 1),
              opacity: 0.8,
              visible: true,
            },
          ],
        },
        objects: [],
      })
    );

  }, [dispatch]);

  return (

    <BrowserRouter>

      <div className="h-screen flex bg-black overflow-hidden">

        {/* LEFT PANEL */}
        <div className="w-80 shrink-0 border-r border-gray-700 shadow-2xl">
          <ControlPanel />
        </div>

        {/* VIEWER AREA */}
        <div className="flex-1 relative h-full overflow-hidden">

          <div className="absolute top-3 left-1/2 -translate-x-1/2 text-sm text-gray-300 bg-gray-900/70 px-4 py-1 rounded-full backdrop-blur border border-gray-700 shadow z-10">
            External STL Viewer
          </div>

          <Routes>

            {/* HYBRID VIEWER */}
            <Route path="/" element={<DentalViewer />} />

            {/* PURE VTK VIEWER */}
            <Route path="/vtk" element={<VtkDentalViewer />} />

          </Routes>

        </div>

      </div>

    </BrowserRouter>
  );
}

export default App;