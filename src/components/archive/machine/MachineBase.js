import * as THREE from "three";
export function createMachineBase(materials) {
  const group = new THREE.Group();
  group.name = "MachineBase";

  const lower = new THREE.Mesh(
    new THREE.CylinderGeometry(1.49, 1.53, 0.2, 56),
    materials.metal,
  );
  lower.position.y = 0.1;
  lower.name = "MachineBase_LowerRing";

  const middle = new THREE.Mesh(
    new THREE.CylinderGeometry(1.42, 1.48, 0.24, 56),
    materials.greenDark,
  );
  middle.position.y = 0.28;
  middle.name = "MachineBase_GreenRing";

  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(1.34, 1.41, 0.24, 56),
    materials.ivoryDark,
  );
  plinth.position.y = 0.48;
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
    new THREE.BoxGeometry(0.94, 0.045, 0.035),
    statusStripMaterial,
  );
  statusStrip.position.set(0.08, 0.31, 1.47);

  const footGeometry = new THREE.CylinderGeometry(0.12, 0.14, 0.12, 18);
  const feet = [
    [-1.02, 0.02, 0.82],
    [1.02, 0.02, 0.82],
    [-1.02, 0.02, -0.82],
    [1.02, 0.02, -0.82],
  ].map(([x, y, z]) => {
    const foot = new THREE.Mesh(footGeometry, materials.rubber);
    foot.position.set(x, y, z);
    group.add(foot);
    return foot;
  });

  group.add(lower, middle, plinth, statusStrip);
  return { group, lower, middle, plinth, feet, statusStripMaterial };
}
