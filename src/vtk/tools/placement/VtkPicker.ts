import vtkCellPicker from "@kitware/vtk.js/Rendering/Core/CellPicker";

export function createPicker(renderer: any, renderWindow: any) {

  const picker = vtkCellPicker.newInstance();

  picker.setTolerance(0.02);

  const interactor = renderWindow.getInteractor();
  interactor.setPicker(picker);

  function pick(container: HTMLDivElement, event: MouseEvent) {

    const rect = container.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = rect.height - (event.clientY - rect.top);

    console.log("🧭 Pick coords:", x, y);

    /* ⭐ CORRECT */

    picker.pick([x, y, 0], renderer);

    const actors = picker.getActors();
    const pos = picker.getPickPosition();

    console.log("Actors found:", actors);

    if (!actors || actors.length === 0) return null;
    if (!pos || pos.length !== 3) return null;

    console.log("Pick position:", pos[0], pos[1], pos[2]);

    const normal = [0, 1, 0];

    return {
      actor: actors[0],
      position: pos,
      normal: normal
    };
  }

  return { pick };
}