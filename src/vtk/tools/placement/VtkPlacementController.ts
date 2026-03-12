import { store } from "../../../app/store"
import { addObject } from "../../../features/scene/sceneSlice"
import { createDentalObject } from "./VtkPlacementFactory"

export function handlePlacement(actor:any,pos:number[],normal:number[]){

  console.log("🖱 handlePlacement called")

  const state = store.getState()

  const activeTool = state.tool.activeTool
  const placeType = state.tool.placeType

  console.log("🛠 Active tool:",activeTool)
  console.log("📦 Place type:",placeType)

  if(activeTool!=="placeObject"){
    console.log("❌ Tool not in placement mode")
    return
  }

  if(!placeType){
    console.log("❌ placeType missing")
    return
  }

  if(!actor){
    console.log("❌ No actor clicked")
    return
  }

  if(!pos || pos.length!==3){
    console.log("❌ Invalid position")
    return
  }

  const object = createDentalObject(placeType,pos,normal)

  console.log("✅ Object created:",object)

  store.dispatch(addObject(object))

  console.log("🚀 Object dispatched to Redux")
}