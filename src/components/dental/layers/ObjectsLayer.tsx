import { useAppSelector } from "../../../app/hooks";
import DentalObject3D from "../DentalObject";

export default function ObjectsLayer() {

  const objects = useAppSelector(
    state => state.scene.objects
  );

  return (
    <>
      {objects.map(obj => (
        <DentalObject3D
          key={obj.id}
          data={obj}
        />
      ))}
    </>
  );
}