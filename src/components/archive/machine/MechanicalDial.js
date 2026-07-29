import * as THREE from "three";
import { MACHINE_DIMENSIONS } from "./machineConfig.js";

export function createMechanicalDial(materials) {
  const group = new THREE.Group();
  group.name = "MechanicalDial";
  group.position.set(-0.03, 1.82, 1.22);

  const mount = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 0.17, 40),
    materials.metal,
  );
  mount.rotation.x = Math.PI / 2;

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(MACHINE_DIMENSIONS.dialRadius, 0.075, 12, 42),
    materials.steel,
  );
  ring.position.z = 0.13;

  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(0.27, 0.27, 0.27, 32),
    materials.wine,
  );
  core.rotation.x = Math.PI / 2;
  core.position.z = 0.18;

  const arm = new THREE.Mesh(
    new THREE.BoxGeometry(0.13, 0.61, 0.13),
    materials.metal,
  );
  arm.position.set(0, -0.02, 0.3);

  const grip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.12, 0.31, 20),
    materials.ivory,
  );
  grip.rotation.x = Math.PI / 2;
  grip.position.set(0, -0.37, 0.33);

  const pointer = new THREE.Mesh(
    new THREE.ConeGeometry(0.075, 0.19, 3),
    materials.brass,
  );
  pointer.position.set(0, 0.51, 0.16);
  pointer.rotation.z = Math.PI;

  const tickGeometry = new THREE.BoxGeometry(0.018, 0.1, 0.02);
  const ticks = new THREE.InstancedMesh(tickGeometry, materials.brass, 24);
  const dummy = new THREE.Object3D();
  for (let index = 0; index < 24; index += 1) {
    const angle = (index / 24) * Math.PI * 2;
    dummy.position.set(Math.sin(angle) * 0.51, Math.cos(angle) * 0.51, 0.14);
    dummy.rotation.z = -angle;
    dummy.updateMatrix();
    ticks.setMatrixAt(index, dummy.matrix);
  }
  ticks.instanceMatrix.needsUpdate = true;

  group.add(mount, ticks, ring, core, arm, grip, pointer);
  return { group, mount, ring, core, arm, grip, ticks };
}
