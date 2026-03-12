import "@kitware/vtk.js/Rendering/Profiles/Geometry"

import vtkRenderWindow from "@kitware/vtk.js/Rendering/Core/RenderWindow"
import vtkRenderer from "@kitware/vtk.js/Rendering/Core/Renderer"
import vtkOpenGLRenderWindow from "@kitware/vtk.js/Rendering/OpenGL/RenderWindow"
import vtkRenderWindowInteractor from "@kitware/vtk.js/Rendering/Core/RenderWindowInteractor"
import vtkInteractorStyleTrackballCamera from "@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera"

import vtkCubeSource from "@kitware/vtk.js/Filters/Sources/CubeSource"
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper"
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor"

import * as THREE from "three"

import { loadSTL } from "./VtkSTLBridge"

export class VtkEngine {

  renderer:any
  renderWindow:any
  openGL:any

  constructor(container:HTMLDivElement){

    const renderer = vtkRenderer.newInstance()
    const renderWindow = vtkRenderWindow.newInstance()

    renderWindow.addRenderer(renderer)

   const openGL = vtkOpenGLRenderWindow.newInstance()

    openGL.setContainer(container)
    
  // screenshot start
const canvas = openGL.getCanvas()
if (canvas) {
  canvas.getContext("webgl", { preserveDrawingBuffer: true })
  canvas.getContext("webgl2", { preserveDrawingBuffer: true })
}

//screenshot end


    renderWindow.addView(openGL)

    /* ⭐ FIX: viewport size match with three canvas */
    openGL.setSize(
      container.clientWidth,
      container.clientHeight
    )

    const interactor = vtkRenderWindowInteractor.newInstance()

    interactor.setView(openGL)
    interactor.initialize()
    interactor.bindEvents(container)

    const style = vtkInteractorStyleTrackballCamera.newInstance()
    interactor.setInteractorStyle(style)

    renderer.setBackground(0,0,0)

    /* ⭐ IMPORTANT: perspective camera */
    const cam = renderer.getActiveCamera()
    cam.setParallelProjection(false)

    this.renderer = renderer
    this.renderWindow = renderWindow
    this.openGL = openGL

    window.addEventListener("resize", () => {

      /* ⭐ FIX: resize viewport correctly */

      this.openGL.setSize(
        container.clientWidth,
        container.clientHeight
      )

      this.renderWindow.render()

    })

  }

  /* ================= LOAD STL ================= */

  loadJaw(jaw:any){

    loadSTL(
      this.renderer,
      this.renderWindow,
      jaw
    )

  }

  /* ================= CAMERA SYNC ================= */

  syncCamera(threeCamera:any){

    if(!threeCamera) return

    const cam = this.renderer.getActiveCamera()

    const pos = threeCamera.position

    cam.setPosition(
      pos.x,
      pos.y,
      pos.z
    )

    const dir = threeCamera.getWorldDirection(
      new THREE.Vector3()
    )

    cam.setFocalPoint(
      pos.x + dir.x,
      pos.y + dir.y,
      pos.z + dir.z
    )

    cam.setViewUp(
      threeCamera.up.x,
      threeCamera.up.y,
      threeCamera.up.z
    )

    /* ⭐ MATCH THREE CAMERA FOV */

    if(threeCamera.fov){
      cam.setViewAngle(threeCamera.fov)
    }

    this.renderer.resetCameraClippingRange()

    this.renderWindow.render()

  }

  getRenderer(){
    return this.renderer
  }

  /* ================= DEBUG CUBE ================= */

  testCube(){

    const cube = vtkCubeSource.newInstance()

    const mapper = vtkMapper.newInstance()

    mapper.setInputConnection(
      cube.getOutputPort()
    )

    const actor = vtkActor.newInstance()

    actor.setMapper(mapper)

    this.renderer.addActor(actor)

    this.renderer.resetCamera()

    this.renderWindow.render()

  }

}