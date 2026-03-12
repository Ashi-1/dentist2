import * as THREE from "three";

export function serializeScene(state: any) {

  const jaws = state.scene.anatomy.jaws.map((j: any) => ({
    id: j.id,
    source: j.source,
    modelPath: j.modelPath,

    position: vectorToArray(j.position),
    quaternion: quaternionToArray(j.quaternion),
    scale: vectorToArray(j.scale),

    /* ⭐ FIX */
    opacity: state.settings?.visual?.jawOpacity ?? j.opacity,

    visible: j.visible
  }));

  const objects = state.scene.objects.map((o: any) => ({
    id: o.id,
    type: o.type,
    modelPath: o.modelPath,

    position: vectorToArray(o.position),
    quaternion: quaternionToArray(o.quaternion),
    scale: vectorToArray(o.scale)
  }));

  return {
    anatomy: { jaws },
    objects
  };
}

/* ================= helpers ================= */

function vectorToArray(v: THREE.Vector3 | number[]) {

  if (Array.isArray(v)) return v;

  return [v.x, v.y, v.z];
}

function quaternionToArray(q: THREE.Quaternion | number[]) {

  if (Array.isArray(q)) return q;

  return [q.x, q.y, q.z, q.w];
}