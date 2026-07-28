import * as THREE from "three";
import { createRoundedBoxGeometry } from "../threeUtils.js";
import { MACHINE_DIMENSIONS } from "./machineConfig.js";

export function createMachineBody(materials) {
  const group = new THREE.Group();
  group.name = "MachineBody";

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(1.3, 1.51, MACHINE_DIMENSIONS.bodyHeight, 56),
    materials.ivory,
  );
  body.position.y = 1.73;
  body.name = "MachineBody_TaperedShell";

  const frontPanel = new THREE.Mesh(
    createRoundedBoxGeometry(1.22, 1.42, 0.12, 0.11),
    materials.green,
  );
  frontPanel.position.set(0, 1.72, 1.38);
  frontPanel.name = "MachineBody_FrontPanel";

  const console = new THREE.Mesh(
    createRoundedBoxGeometry(1.42, 0.42, 0.18, 0.09),
    materials.ivoryDark,
  );
  console.position.set(0, 2.73, 1.31);
  console.name = "MachineBody_CoinConsole";

  const leftSidePanel = new THREE.Mesh(
    createRoundedBoxGeometry(0.52, 1.42, 0.1, 0.07),
    materials.greenDark,
  );
  leftSidePanel.position.set(-1.14, 1.72, 0.77);
  leftSidePanel.rotation.y = -0.72;

  const rightSidePanel = leftSidePanel.clone();
  rightSidePanel.position.x *= -1;
  rightSidePanel.rotation.y *= -1;

  const shoulder = new THREE.Mesh(
    new THREE.CylinderGeometry(1.47, 1.37, 0.3, 56),
    materials.metal,
  );
  shoulder.position.y = 2.92;
  shoulder.name = "MachineBody_ChamberShoulder";

  const backSpine = new THREE.Mesh(
    createRoundedBoxGeometry(0.52, 1.72, 0.14, 0.06),
    materials.metal,
  );
  backSpine.position.set(0, 1.8, -1.39);

  group.add(
    body,
    frontPanel,
    console,
    leftSidePanel,
    rightSidePanel,
    shoulder,
    backSpine,
  );

  return {
    group,
    body,
    frontPanel,
    console,
    shoulder,
  };
}
