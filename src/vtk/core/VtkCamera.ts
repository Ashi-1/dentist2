import vtkInteractorStyleTrackballCamera from "@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera";

export function setupCamera(ctx: {
  renderer: any;
  renderWindow: any;
  interactor: any;
}) {
  const style = vtkInteractorStyleTrackballCamera.newInstance();
  ctx.interactor.setInteractorStyle(style);

  const camera = ctx.renderer.getActiveCamera();
  camera.setPosition(0, 0, 300);
  camera.setFocalPoint(0, 0, 0);
  camera.setViewUp(0, 1, 0);
  camera.setClippingRange(0.1, 10000);
}

export function resetCamera(ctx: { renderer: any; renderWindow: any }) {
  ctx.renderer.resetCamera();
  ctx.renderer.resetCameraClippingRange();
  ctx.renderWindow.render();
}
