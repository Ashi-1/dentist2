import * as THREE from "three";

export const normalizeScene = (scene: any) => {
  return {
    ...scene,

    anatomy: {
      ...scene.anatomy,
      jaws: scene.anatomy?.jaws?.map((jaw: any) => ({
        ...jaw,
        position: Array.isArray(jaw.position)
          ? new THREE.Vector3(...jaw.position)
          : jaw.position,

        quaternion: Array.isArray(jaw.quaternion)
          ? new THREE.Quaternion(...jaw.quaternion)
          : jaw.quaternion,

        scale: Array.isArray(jaw.scale)
          ? new THREE.Vector3(...jaw.scale)
          : jaw.scale,
      })),
    },

    objects: scene.objects?.map((obj: any) => ({
      ...obj,
      position: Array.isArray(obj.position)
        ? new THREE.Vector3(...obj.position)
        : obj.position,

      quaternion: Array.isArray(obj.quaternion)
        ? new THREE.Quaternion(...obj.quaternion)
        : obj.quaternion,

      scale: Array.isArray(obj.scale)
        ? new THREE.Vector3(...obj.scale)
        : obj.scale,
    })),
  };
};