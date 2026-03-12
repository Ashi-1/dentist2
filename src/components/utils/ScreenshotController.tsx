import { exportScreenshot } from "../../utils/screenshot/exportScreenshot";

export function takeViewerScreenshot() {
  const uiPanels = document.querySelectorAll(".ui-panel");

  // Hide UI panels temporarily
  uiPanels.forEach((panel) => {
    (panel as HTMLElement).style.visibility = "hidden";
  });

  setTimeout(async () => {

    await exportScreenshot({
      resolution: 2, // 4K style export
      filename: "dental-planning.png"
    });

    // Restore UI panels
    uiPanels.forEach((panel) => {
      (panel as HTMLElement).style.visibility = "visible";
    });

  }, 100);
}