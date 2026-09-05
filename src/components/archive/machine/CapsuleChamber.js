import * as THREE from "three";
import { createRoundedBoxGeometry } from "../threeUtils.js";
import { createCapsuleInstances } from "./CapsuleInstances.js";
import { MACHINE_DIMENSIONS } from "./machineConfig.js";

export function createCapsuleChamber(materials, capsuleCount) {
  const group = new THREE.Group();
  group.name = "CapsuleChamber";

  const profile = [
    new THREE.Vector2(1.02, 0),
    new THREE.Vector2(1.18, 0.16),
    new THREE.Vector2(1.29, 0.48),
    new THREE.Vector2(1.31, 1.18),
    new THREE.Vector2(1.27, 1.67),
    new THREE.Vector2(1.12, 2.02),
    new THREE.Vector2(0.98, 2.18),
  ];
  const chamber = new THREE.Mesh(
    new THREE.LatheGeometry(profile, 64),
    materials.glass,
  );
  chamber.position.y = 3.12;
  chamber.scale.z = 0.84;
  chamber.name = "CapsuleChamber_SmokedGlass";
  chamber.renderOrder = 12;

  const back = new THREE.Mesh(
    createRoundedBoxGeometry(1.48, 1.72, 0.08, 0.22),
    materials.greenDark,
  );
  back.position.set(0, 4.13, -1.04);

  const lowerFrame = new THREE.Mesh(
    new THREE.TorusGeometry(1.23, 0.085, 14, 64),
    materials.metal,
  );
  lowerFrame.rotation.x = Math.PI / 2;
  lowerFrame.position.y = 3.13;
  lowerFrame.scale.z = 0.84;

  const topFrame = new THREE.Mesh(
    new THREE.TorusGeometry(1.01, 0.085, 14, 64),
    materials.metal,
  );
  topFrame.rotation.x = Math.PI / 2;
  topFrame.position.y = 5.29;
  topFrame.scale.z = 0.84;

  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry(1.06, 1.0, 0.18, 56),
    materials.brass,
  );
  crown.position.y = 5.38;
  crown.scale.z = 0.84;

  const capsules = createCapsuleInstances(capsuleCount);
  capsules.group.position.y = 4.18;
  capsules.group.scale.set(1.08, 1.08, 0.92);

  const braceGeometry = createRoundedBoxGeometry(0.075, 1.78, 0.075, 0.022);
  [-1.15, 1.15].forEach((x) => {
    const brace = new THREE.Mesh(braceGeometry, materials.brass);
    brace.position.set(x, 4.12, 0.47);
    group.add(brace);
  });

  group.add(back, capsules.group, chamber, lowerFrame, topFrame, crown);
  return {
    group,
    chamber,
    capsules: capsules.group,
    capsuleMeshes: capsules.capsuleMeshes,
  };
}
