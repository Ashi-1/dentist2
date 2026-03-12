import * as THREE from "three";

/* ================= BASE TRANSFORM ================= */

export type Transform = {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale?: THREE.Vector3; // future-proof
};

/* ================= IMPLANT ================= */

export type ImplantData = Transform & {
  id: string;

  // clinical info (optional now, useful later)
  diameter?: number;
  length?: number;

  // prosthetic link
  crownId?: string | null;

  // visibility / state
  visible?: boolean;
};

/* ================= CROWN ================= */

export type CrownData = Transform & {
  id: string;

  // linked implant (optional)
  implantId?: string | null;

  visible?: boolean;
};