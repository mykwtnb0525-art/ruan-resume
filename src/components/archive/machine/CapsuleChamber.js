import * as THREE from "three";
import { createRoundedBoxGeometry } from "../threeUtils.js";
import { createCapsuleInstances } from "./CapsuleInstances.js";
import { MACHINE_DIMENSIONS } from "./machineConfig.js";

export function createCapsuleChamber(materials, capsuleCount) {
  const group = new THREE.Group();
  group.name = "CapsuleChamber";

  const profile = [
    new THREE.Vector2(1.08, 0),
    new THREE.Vector2(1.28, 0.16),
    new THREE.Vector2(1.37, 0.52),
    new THREE.Vector2(1.39, 1.34),
    new THREE.Vector2(1.32, 1.78),
    new THREE.Vector2(1.11, 2.02),
  ];
  const chamber = new THREE.Mesh(
    new THREE.LatheGeometry(profile, 64),
    materials.glass,
  );
  chamber.position.y = 3.02;
  chamber.name = "CapsuleChamber_SmokedGlass";
  chamber.renderOrder = 4;

  const back = new THREE.Mesh(
    createRoundedBoxGeometry(1.54, 1.62, 0.08, 0.26),
    materials.greenDark,
  );
  back.position.set(0, 3.98, -1.28);

  const lowerFrame = new THREE.Mesh(
    new THREE.TorusGeometry(1.35, 0.1, 14, 64),
    materials.metal,
  );
  lowerFrame.rotation.x = Math.PI / 2;
  lowerFrame.position.y = 3.04;

  const topFrame = new THREE.Mesh(
    new THREE.TorusGeometry(1.13, 0.1, 14, 64),
    materials.metal,
  );
  topFrame.rotation.x = Math.PI / 2;
  topFrame.position.y = 5.03;

  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry(1.16, 1.12, 0.2, 56),
    materials.brass,
  );
  crown.position.y = 5.12;

  const capsules = createCapsuleInstances(capsuleCount);
  capsules.group.position.y = 4.03;
  capsules.group.scale.setScalar(1.24);

  group.add(back, capsules.group, chamber, lowerFrame, topFrame, crown);
  return {
    group,
    chamber,
    capsules: capsules.group,
    capsuleMeshes: capsules.capsuleMeshes,
  };
}
