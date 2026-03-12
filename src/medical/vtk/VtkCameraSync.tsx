import { useFrame } from "@react-three/fiber"

type Props = {
  engineRef: any
  orbitRef: any
}

export default function VtkCameraSync({
  engineRef,
  orbitRef
}: Props){

  useFrame(()=>{

    if(!engineRef?.current) return

    if(!orbitRef?.current) return

    const camera = orbitRef.current.object

    if(!camera) return

    engineRef.current.syncCamera(camera)

  })

  return null
}