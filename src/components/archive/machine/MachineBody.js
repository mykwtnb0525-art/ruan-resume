import * as THREE from "three";
import { createRoundedBoxGeometry } from "../threeUtils.js";
import { MACHINE_DIMENSIONS } from "./machineConfig.js";

export function createMachineBody(materials) {
  const group = new THREE.Group();
  group.name = "MachineBody";

  const body = new THREE.Mesh(
    createRoundedBoxGeometry(
      2.36,
      MACHINE_DIMENSIONS.bodyHeight,
      2.14,
      0.28,
    ),
    materials.ivory,
  );
  body.position.y = 1.75;
  body.name = "MachineBody_TaperedShell";

  const frontPanel = new THREE.Mesh(
    createRoundedBoxGeometry(1.08, 1.5, 0.11, 0.1),
    materials.green,
  );
  frontPanel.position.set(-0.03, 1.77, 1.1);
  frontPanel.name = "MachineBody_FrontPanel";

  const console = new THREE.Mesh(
    createRoundedBoxGeometry(1.3, 0.36, 0.16, 0.075),
    materials.ivoryDark,
  );
  console.position.set(-0.03, 2.72, 1.1);
  console.name = "MachineBody_CoinConsole";

  const leftSidePanel = new THREE.Mesh(
    createRoundedBoxGeometry(0.34, 1.62, 0.09, 0.055),
    materials.greenDark,
  );
  leftSidePanel.position.set(-1.12, 1.74, 0.43);
  leftSidePanel.rotation.y = -0.24;

  const rightSidePanel = leftSidePanel.clone();
  rightSidePanel.position.x *= -1;
  rightSidePanel.rotation.y *= -1;

  const shoulder = new THREE.Mesh(
    new THREE.CylinderGeometry(1.34, 1.25, 0.24, 56),
    materials.metal,
  );
  shoulder.position.y = 3.06;
  shoulder.name = "MachineBody_ChamberShoulder";

  const backSpine = new THREE.Mesh(
    createRoundedBoxGeometry(0.42, 1.88, 0.12, 0.055),
    materials.metal,
  );
  backSpine.position.set(0, 1.78, -1.11);

  const frontTrimGeometry = createRoundedBoxGeometry(0.055, 1.72, 0.06, 0.02);
  [-0.63, 0.57].forEach((x) => {
    const trim = new THREE.Mesh(frontTrimGeometry, materials.brass);
    trim.position.set(x, 1.77, 1.17);
    group.add(trim);
  });

  const serviceSeam = new THREE.Mesh(
    createRoundedBoxGeometry(1.76, 0.025, 0.035, 0.008),
    materials.metal,
  );
  serviceSeam.position.set(0, 0.83, 1.115);

  group.add(
    body,
    frontPanel,
    console,
    leftSidePanel,
    rightSidePanel,
    shoulder,
    backSpine,
    serviceSeam,
  );

  return {
    group,
    body,
    frontPanel,
    console,
    shoulder,
  };
}
