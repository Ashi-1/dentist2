import * as THREE from "three";

export const createBaseScene = (jawUrl: string) => {
  return {
    anatomy: {
      jaws: [
        {
          id: `jaw-${Date.now()}`,
          modelPath: jawUrl,
          position: new THREE.Vector3(0, 0, 0),
          quaternion: new THREE.Quaternion(0, 0, 0, 1),
          scale: new THREE.Vector3(1, 1, 1),
          opacity: 0.8,
          visible: true,
        },
      ],
    },

    objects: [],

    selection: {
      selectedIds: [],
    },

    ui: {
      activeTool: "transform",
      transformMode: "translate",
      placeType: "implant",
    },

    analysis: {
      measurement: false,
      axisGuide: false,
    },

    utilities: {
      annotation: false,
      freehandMarking: false,
      magnifier: false,
      boneDepth: false,
      focusJaw: true,
    },

    settings: {
      jawOpacity: 0.8,
    },
  };
};