import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";

export interface VtkRendererContext {
  fullScreenRenderer: any;
  renderer: any;
  renderWindow: any;
  interactor: any;
  container: HTMLDivElement;
}

export function createRenderer(container: HTMLDivElement): VtkRendererContext {
  const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
    rootContainer: container,
    containerStyle: {
      width: "100%",
      height: "100%",
      position: "absolute",
      top: "0",
      left: "0",
      overflow: "hidden",
    },
  });

  const renderer = fullScreenRenderer.getRenderer();
  const renderWindow = fullScreenRenderer.getRenderWindow();
  const interactor = renderWindow.getInteractor();

  renderer.setBackground(0.06, 0.06, 0.08);



  return { fullScreenRenderer, renderer, renderWindow, interactor, container };
}

export function destroyRenderer(ctx: VtkRendererContext) {
  try {
    ctx.interactor.unbindEvents();
  } catch {
    /* already unbound */
  }

  try {
    const openGLRW = ctx.fullScreenRenderer.getOpenGLRenderWindow();
    const canvas = openGLRW?.getCanvas?.();
    if (canvas?.parentElement) {
      canvas.parentElement.removeChild(canvas);
    }
    if (canvas?.parentElement?.parentElement === ctx.container) {
      ctx.container.removeChild(canvas.parentElement);
    }
  } catch {
    /* best-effort cleanup */
  }

  try {
    ctx.fullScreenRenderer.delete();
  } catch {
    /* already deleted */
  }
}
