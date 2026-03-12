import * as THREE from "three";

export type DentalObjectType =
  | "implant"
  | "crown"
  | "abutment"
  | "screw"
  | "custom";

export type DentalObject = {
  id: string;
  type: DentalObjectType;

  modelPath: string;

  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale?: THREE.Vector3;

  visible?: boolean;
  locked?: boolean;

  parentId?: string | null;
  metadata?: Record<string, any>;
};