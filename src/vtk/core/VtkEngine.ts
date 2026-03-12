import {
  createRenderer,
  destroyRenderer,
  type VtkRendererContext,
} from "./VtkRenderer";
import { setupCamera, resetCamera } from "./VtkCamera";
import {
  createSceneManager,
  type VtkSceneManagerAPI,
} from "./VtkSceneManager";
import {
  setupObjectPlacement,
  type VtkPlacementSystem,
} from "../tools/placement/VtkObjectPlacement";
import {
  createTransformGizmo,
  type VtkTransformGizmoAPI,
} from "../tools/transform/VtkTransformGizmo";
import { preloadModel } from "../models/VtkModelCache";

export interface VtkEngineAPI {
  sceneManager: VtkSceneManagerAPI;
  transformGizmo: VtkTransformGizmoAPI;
  rendererCtx: VtkRendererContext;
  resetCamera: () => void;
  render: () => void;
  resize: () => void;
  destroy: () => void;
}

const PRELOAD_MODELS = [
  "/models/implant_screw.stl",
  "/models/crown.stl",
  "/models/abutment.stl",
];

export default async function createVtkEngine(
  container: HTMLDivElement
): Promise<VtkEngineAPI> {
  await Promise.allSettled(PRELOAD_MODELS.map((p) => preloadModel(p)));

  const rendererCtx = createRenderer(container);

  setupCamera(rendererCtx);

  const sceneManager = createSceneManager(
    rendererCtx.renderer,
    rendererCtx.renderWindow
  );

  const placement: VtkPlacementSystem = setupObjectPlacement(
    container,
    rendererCtx.renderer,
    rendererCtx.renderWindow
  );

  const transformGizmo: VtkTransformGizmoAPI = createTransformGizmo(
    container,
    rendererCtx.renderer,
    rendererCtx.renderWindow,
    sceneManager
  );

  function resize() {
    rendererCtx.fullScreenRenderer.resize();
    rendererCtx.renderWindow.render();
  }

  function destroy() {
    transformGizmo.dispose();
    placement.dispose();
    sceneManager.clear();
    destroyRenderer(rendererCtx);
  }

  return {
    sceneManager,
    transformGizmo,
    rendererCtx,
    resetCamera: () => resetCamera(rendererCtx),
    render: () => rendererCtx.renderWindow.render(),
    resize,
    destroy,
  };
}
