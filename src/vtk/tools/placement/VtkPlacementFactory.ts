import * as THREE from "three";
import type { DentalObjectType } from "../../../features/scene/DentalObject";

export function createDentalObject(
  type: DentalObjectType,
  pos: number[],
  normal: number[]
){

  console.log("🏭 Creating dental object")
  console.log("📍 Pick position:", pos)

  let modelPath = ""
  let scale = new THREE.Vector3(1,1,1)

  switch (type) {

    case "implant":
      modelPath = "/models/implant_screw.stl"
      scale = new THREE.Vector3(0.1,0.15,0.1)
      break

    case "crown":
      modelPath = "/models/crown.stl"
      scale = new THREE.Vector3(0.3,0.35,0.3)
      break

  }

  /* fallback normal */

  if(!normal){
    normal = [0,1,0]
  }

  /* ⭐ EXACT CLICK POSITION */

  const position = new THREE.Vector3(
    pos[0],
    pos[1],
    pos[2]
  )

  console.log(
    "📌 Final spawn position:",
    position.x,
    position.y,
    position.z
  )

  return {
    id: `${type}-${Date.now()}`,
    type,
    modelPath,
    position,
    quaternion: new THREE.Quaternion(),
    scale,
    visible: true
  }

}