export function exportScreenshot(options?: {
  resolution?: number
  filename?: string
}) {

  const resolution = options?.resolution ?? 1
  const filename = options?.filename ?? "dental-view.png"

  const canvases = document.querySelectorAll("canvas")

  if (canvases.length < 2) {
    console.warn("Both canvases not found")
    return
  }

  const vtkCanvas = canvases[0] as HTMLCanvasElement
  const threeCanvas = canvases[1] as HTMLCanvasElement

  const width = vtkCanvas.width
  const height = vtkCanvas.height

  const exportCanvas = document.createElement("canvas")
  exportCanvas.width = width * resolution
  exportCanvas.height = height * resolution

  const ctx = exportCanvas.getContext("2d")

  if (!ctx) return

  /* draw VTK first */
  ctx.drawImage(vtkCanvas, 0, 0, exportCanvas.width, exportCanvas.height)

  /* draw Three.js overlay */
  ctx.drawImage(threeCanvas, 0, 0, exportCanvas.width, exportCanvas.height)

  const image = exportCanvas.toDataURL("image/png")

  const link = document.createElement("a")
  link.href = image
  link.download = filename

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}