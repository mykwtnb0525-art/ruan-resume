import * as THREE from "three";
import { MACHINE_DIMENSIONS } from "./machineConfig.js";

export function createMachineBase(materials) {
  const group = new THREE.Group();
  group.name = "MachineBase";

  const lower = new THREE.Mesh(
    new THREE.CylinderGeometry(1.72, 1.78, 0.24, 56),
    materials.metal,
  );
  lower.position.y = 0.12;
  lower.name = "MachineBase_LowerRing";

  const middle = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.69, 0.28, 56),
    materials.greenDark,
  );
  middle.position.y = 0.32;
  middle.name = "MachineBase_GreenRing";

  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(1.47, 1.6, 0.25, 56),
    materials.ivoryDark,
  );
  plinth.position.y = 0.51;
  plinth.name = "MachineBase_Plinth";

  const statusStripMaterial = new THREE.MeshStandardMaterial({
    color: 0x311016,
    emissive: 0x9f1e2d,
    emissiveIntensity: 0.08,
    roughness: 0.42,
    metalness: 0.3,
  });
  statusStripMaterial.name = "MachineBaseStatus";
  const statusStrip = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 0.05, 0.035),
    statusStripMaterial,
  );
  statusStrip.position.set(0, 0.38, 1.69);

  const footGeometry = new THREE.CylinderGeometry(0.12, 0.14, 0.12, 18);
  const feet = [
    [-1.12, 0.02, 0.95],
    [1.12, 0.02, 0.95],
    [-1.12, 0.02, -0.95],
    [1.12, 0.02, -0.95],
  ].map(([x, y, z]) => {
    const foot = new THREE.Mesh(footGeometry, materials.rubber);
    foot.position.set(x, y, z);
    group.add(foot);
    return foot;
  });

  group.add(lower, middle, plinth, statusStrip);
  return { group, lower, middle, plinth, feet, statusStripMaterial };
}
