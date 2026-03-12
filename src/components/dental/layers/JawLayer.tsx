import { useAppSelector } from "../../../app/hooks";
import JawModel from "../JawModel";

export default function JawLayer({ onClick, opacity }: any) {

  const jaws = useAppSelector(
    (state) => state.scene.anatomy.jaws
  );

  // ✅ Safety: if no jaws, render nothing
  if (!jaws || jaws.length === 0) {
    return null;
  }

  // ✅ Safety: filter invalid modelPath
  const validJaws = jaws.filter(
    (jaw) =>
      jaw?.modelPath &&
      typeof jaw.modelPath === "string" &&
      jaw.modelPath.trim() !== ""
  );

  if (validJaws.length === 0) {
    return null;
  }

  return (
    <>
      {validJaws.map((jaw) => (
        <JawModel
          key={jaw.id}
          data={jaw}
          onClick={onClick}
          opacity={opacity}
        />
      ))}
    </>
  );
}