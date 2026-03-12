import vtkSTLReader from "@kitware/vtk.js/IO/Geometry/STLReader"
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper"
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor"

/* ⭐ GLOBAL ACTOR REFERENCE */
let jawActor:any = null

export function loadSTL(renderer:any, renderWindow:any, jaw:any){

  const reader = vtkSTLReader.newInstance()

  reader.setUrl(jaw.modelPath).then(()=>{

    const mapper = vtkMapper.newInstance()
    mapper.setInputConnection(reader.getOutputPort())

    const bounds = mapper.getBounds()
    console.log("VTK BOUNDS:", bounds)

    // const actor = vtkActor.newInstance()
    // actor.setMapper(mapper)

    // /* ⭐ SAVE ACTOR FOR LATER OPACITY CONTROL */
    // jawActor = actor

    // /* INITIAL OPACITY FROM JSON */
    // actor.getProperty().setOpacity(jaw?.opacity ?? 1)

    // /* APPLY JSON TRANSFORM */

const actor = vtkActor.newInstance()
actor.setMapper(mapper)
mapper.setScalarVisibility(false)
const property = actor.getProperty()

property.setColor(0.95, 0.94, 0.89)
property.setAmbient(0.3)
property.setDiffuse(0.7)
property.setSpecular(0.1)
property.setSpecularPower(10)

jawActor = actor

actor.getProperty().setOpacity(jaw?.opacity ?? 1)

    if(jaw?.position){
      actor.setPosition(
        jaw.position.x,
        jaw.position.y,
        jaw.position.z
      )
    }

    if(jaw?.scale){
      actor.setScale(
        jaw.scale.x,
        jaw.scale.y,
        jaw.scale.z
      )
    }

    renderer.addActor(actor)

    renderWindow.render()

  })

}


/* ⭐ FUNCTION TO UPDATE OPACITY FROM SLIDER */

export function setJawOpacity(opacity:number){

  if(!jawActor) return

  jawActor.getProperty().setOpacity(opacity)

}