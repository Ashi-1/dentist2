import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

import {
  setActiveTool,
  setTransformMode,
  setPlaceType, // ⭐ REQUIRED
} from "../../features/tools/toolSlice";

import {
  toggleMeasurement,
  clearMeasurement,
} from "../../features/measurement/measurementSlice";

import { setJawOpacity } from "../../features/settings/settingsSlice";
import { clearSelection } from "../../features/selection/selectionSlice";
import { toggleAxisGuide } from "../../features/axisGuide/axisGuideSlice";

import { toggleAnnotation } from "../../features/tools/annotationSlice";
import { toggleFreehandMarking } from "../../features/tools/freehandMarkingSlice";
import { toggleMagnifier } from "../../features/tools/magnifierSlice";
import { focusJaw } from "../../features/tools/focusSlice";
import { toggleBoneDepth } from "../../features/tools/boneDepthSlice";

import { removeObject } from "../../features/scene/sceneSlice"; // ⭐ NEW
import { fetchCaseScene } from "../../features/scene/sceneThunks";
import { loadScene } from "../../features/scene/sceneSlice";
import { createBaseScene } from "../../features/scene/sceneFactory";
import { takeViewerScreenshot } from "../utils/ScreenshotController";
import { serializeScene } from "../../features/scene/sceneSerializer";
import { setJawOpacity as setVtkJawOpacity } from "../../medical/vtk/VtkSTLBridge"

import {
  PlusCircle,
  Move3D,
  RotateCw,
  Scaling,
  Ruler,
  Compass,
  Menu,
  Trash2,
  Eye,
  XCircle,
  Pencil,
  PenTool,
  Search,
  Locate,
  Layers,
  Camera,
  Save,
} from "lucide-react";
import { store } from "../../app/store";

export default function ControlPanel() {
  const dispatch = useAppDispatch();
  const [menuOpen, setMenuOpen] = useState(false);

  /* ================= STATE ================= */

  const tool = useAppSelector((s) => s.tool.activeTool);
  const mode = useAppSelector((s) => s.tool.transformMode);
  const placeType = useAppSelector((s) => s.tool.placeType);

  const measurement = useAppSelector((s) => s.measurement.active);
  const jawOpacity = useAppSelector((s) => s.settings.visual.jawOpacity);

  const selectedIds = useAppSelector((s) => s.selection.selectedIds);
  const objects = useAppSelector((s) => s.scene.objects);

  const axisGuideActive = useAppSelector((s) => s.axisGuide.active);
  const annotationActive = useAppSelector((s) => s.annotation.enabled);
  const freehandActive = useAppSelector((s) => s.freehandMarking.enabled);
  const magnifierActive = useAppSelector((s) => s.magnifier.enabled);
  const boneDepthVisible = useAppSelector((s) => s.boneDepth.visible);
  

  const hasSelection = selectedIds.length > 0;

  /* ================= DERIVED ================= */

  const selectedObject = objects.find(
    (o) => o.id === selectedIds[0]
  );

  const selectionType = selectedObject?.type;

  /* ================= DELETE ================= */

  const deleteSelectedScrew = () => {
    const id = selectedIds[0];
    if (!id || selectionType !== "implant") return;

    dispatch(removeObject(id));
    dispatch(clearSelection());
  };

  const deleteSelectedCrown = () => {
    const id = selectedIds[0];
    if (!id || selectionType !== "crown") return;

    dispatch(removeObject(id));
    dispatch(clearSelection());
  };

  const exitAllTools = () => {
    dispatch(clearSelection());
    dispatch(clearMeasurement());
    dispatch(setActiveTool("select")); // ⭐ valid tool
    dispatch(setTransformMode("translate"));
  };

  function saveCase(){

  const state = store.getState();

  const sceneJSON = serializeScene(state);

  console.log("SAVE JSON:", JSON.stringify(sceneJSON, null, 2));
   alert("Case saved successfully");

}

  return (
    <>
      {/* ========= TOP RIGHT MENU ========= */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20"
        >
          <Menu size={20} />
        </button>

        {menuOpen && (
  //<div className="mt-3 w-72 rounded-2xl bg-[#020617]/95 border border-white/10 p-4 space-y-3 text-gray-200">
<div className="absolute right-0 top-12 w-72 rounded-2xl bg-[#020617]/95 border border-white/10 p-4 space-y-3 text-gray-200">
    {/* 📸 Export Screenshot */}
    <MenuBtn
      onClick={takeViewerScreenshot}
      icon={<Camera size={18} />}
      label="Export Screenshot"
    />

    <MenuBtn
  onClick={saveCase}
  icon={<Save size={18} />}
  label="Save Case"
/>

    <MenuBtn
      disabled={!hasSelection || selectionType !== "implant"}
      onClick={deleteSelectedScrew}
      icon={<Trash2 size={18} />}
      label="Delete Selected Screw"
    />

    <MenuBtn
      disabled={!hasSelection || selectionType !== "crown"}
      onClick={deleteSelectedCrown}
      icon={<Trash2 size={18} />}
      label="Delete Selected Crown"
    />

    <MenuBtn
      onClick={exitAllTools}
      icon={<XCircle size={18} />}
      label="Exit from All Active Tools"
    />

    <div className="pt-3 border-t border-white/10">
      <div className="flex items-center gap-2 mb-2 text-sm">
        <Eye size={16} /> Jaw Transparency
      </div>

      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={jawOpacity}
        onChange={(e) => {

  const value = parseFloat(e.target.value)

  dispatch(setJawOpacity(value))

  setVtkJawOpacity(value)

}}
        className="w-full accent-cyan-400"
      />
    </div>

  </div>
)}
      </div>

   
      {/* ========= LEFT PANEL ========= */}
<div className="h-full flex items-start p-4">
  <div className="ui-panel w-80 h-full overflow-y-auto rounded-3xl bg-[#020617]/95 border border-white/10 text-gray-200 px-5 py-6 flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-center text-cyan-400">
            ✨ Planning Studio
          </h2>

{/* 📂 Upload Local STL */}
<label
  className="
    w-full py-2 rounded-xl
    bg-purple-500/20 border border-purple-400
    hover:bg-purple-500/30 transition
    text-purple-300 font-medium
    cursor-pointer text-center block
  "
>
  📂 Upload Local STL

  <input
    type="file"
    accept=".stl"
    className="hidden"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const localUrl = URL.createObjectURL(file);

      dispatch(loadScene(createBaseScene(localUrl)));
    }}
  />
</label>







          <button
  onClick={() => dispatch(fetchCaseScene())}
  className="
    w-full mb-4 py-2 rounded-xl
    bg-cyan-500/20 border border-cyan-400
    hover:bg-cyan-500/30 transition
    text-cyan-300 font-medium
  "
>
  🎬 Load Demo Case
</button>

          {/* ===== PLACEMENT ===== */}
          <IconSection title="Placement">

            <IconBtn
              icon={<PlusCircle />}
              label="Place Screw"
              active={tool === "placeObject" && placeType === "implant"}
              onClick={() => {
                dispatch(setActiveTool("placeObject"));
                dispatch(setPlaceType("implant"));
              }}
            />

            <IconBtn
              icon={"🦷"}
              label="Place Crown"
              active={tool === "placeObject" && placeType === "crown"}
              onClick={() => {
                dispatch(setActiveTool("placeObject"));
                dispatch(setPlaceType("crown"));
              }}
            />

          </IconSection>

          {/* ===== TRANSFORM ===== */}
          <IconSection title="Transform">
            <IconBtn
              icon={<Move3D />}
              label="Move"
              disabled={!hasSelection}
              active={tool === "transform" && mode === "translate"}
              onClick={() => {
                if (tool === "transform" && mode === "translate") {
                  dispatch(setActiveTool("select"));
                } else {
                  dispatch(setActiveTool("transform"));
                  dispatch(setTransformMode("translate"));
                }
              }}
            />

            <IconBtn
              icon={<RotateCw />}
              label="Rotate"
              disabled={!hasSelection}
              active={tool === "transform" && mode === "rotate"}
              onClick={() => {
                if (tool === "transform" && mode === "rotate") {
                  dispatch(setActiveTool("select"));
                } else {
                  dispatch(setActiveTool("transform"));
                  dispatch(setTransformMode("rotate"));
                }
              }}
            />

            <IconBtn
              icon={<Scaling />}
              label="Scale"
              disabled={!hasSelection}
              active={tool === "transform" && mode === "scale"}
              onClick={() => {
                if (tool === "transform" && mode === "scale") {
                  dispatch(setActiveTool("select"));
                } else {
                  dispatch(setActiveTool("transform"));
                  dispatch(setTransformMode("scale"));
                }
              }}
            />
          </IconSection>

          {/* ===== ANALYSIS ===== */}
          <IconSection title="Analysis">
            <IconBtn
              icon={<Ruler />}
              label="Measurement"
              active={measurement}
              onClick={() => dispatch(toggleMeasurement())}
            />

            <IconBtn
              icon={<Compass />}
              label="Axis Guide"
              active={axisGuideActive}
              onClick={() => dispatch(toggleAxisGuide())}
            />
          </IconSection>

          {/* ===== UTILITIES ===== */}
          <IconSection title="Utilities">

            <IconBtn
              icon={<Pencil />}
              label="Annotation Tool"
              active={annotationActive}
              onClick={() => dispatch(toggleAnnotation())}
            />

            <IconBtn
              icon={<PenTool />}
              label="Freehand Surgical Marking"
              active={freehandActive}
              onClick={() => dispatch(toggleFreehandMarking())}
            />

            <IconBtn
              icon={<Search />}
              label="Local Magnifier Lens"
              active={magnifierActive}
              onClick={() => dispatch(toggleMagnifier())}
            />

            <IconBtn
              icon={<Locate />}
              label="Focus on Jaw"
              onClick={() => dispatch(focusJaw())}
            />

            <IconBtn
              icon={<Layers />}
              label="Bone Depth View"
              active={boneDepthVisible}
              onClick={() => dispatch(toggleBoneDepth())}
            />

          </IconSection>
        </div>
      </div>
    </>
  );
}

/* ================= UI HELPERS ================= */

function IconSection({ title, children }: any) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-white/50 mb-2">
        {title}
      </h3>
      <div className="flex gap-3 flex-wrap">{children}</div>
    </div>
  );
}

function IconBtn({ icon, label, onClick, active, disabled }: any) {
  return (
    <button
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`
        w-12 h-12 flex items-center justify-center
        rounded-xl border transition
        ${disabled ? "opacity-40 pointer-events-none" : ""}
        ${
          active
            ? "bg-cyan-500/30 border-cyan-400"
            : "bg-white/5 border-white/10 hover:bg-white/10"
        }
      `}
    >
      {icon}
    </button>
  );
}

function MenuBtn({ icon, label, ...props }: any) {
  return (
    <button
      {...props}
      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
    >
      {icon} {label}
    </button>
  );
}