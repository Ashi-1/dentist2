import { useEffect, useRef } from "react"
import { useAppSelector } from "../../app/hooks"
import { VtkEngine } from "./VtkEngine"

export const vtkEngineRef:any = { current:null }

export default function VtkViewer(){

  const containerRef = useRef<HTMLDivElement | null>(null)
  const initialized = useRef(false)

  /* ⭐ JAWS FROM REDUX */
  const jaws = useAppSelector(s => s.scene.anatomy.jaws)

  useEffect(()=>{

    if(!containerRef.current) return

    /* prevent double init */
    if(initialized.current) return
    initialized.current = true

    console.log("VTK ENGINE START")

    vtkEngineRef.current = new VtkEngine(containerRef.current)

  },[])

  /* ⭐ LOAD JAW WHEN REDUX READY */
  useEffect(()=>{

    if(!vtkEngineRef.current) return
    if(!jaws?.length) return

    console.log("VTK LOAD JAW", jaws[0])

    vtkEngineRef.current.loadJaw(jaws[0])

  },[jaws])

  return(

    <div
      ref={containerRef}
      style={{
        position:"absolute",
        inset:0,
        zIndex:0,
        pointerEvents:"none"
      }}
    />

  )

}