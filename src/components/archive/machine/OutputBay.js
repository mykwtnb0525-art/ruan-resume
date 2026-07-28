import * as THREE from "three";
import { createRoundedBoxGeometry } from "../threeUtils.js";
import { MACHINE_DIMENSIONS } from "./machineConfig.js";

export function createOutputBay(materials) {
  const group = new THREE.Group();
  group.name = "OutputBay";
  group.position.set(0, 0.78, 1.43);

  const frame = new THREE.Mesh(
    createRoundedBoxGeometry(1.06, 0.72, 0.24, 0.1),
    materials.metal,
  );
  const cavity = new THREE.Mesh(
    createRoundedBoxGeometry(0.86, 0.52, 0.28, 0.08),
    materials.rubber,
  );
  cavity.position.z = 0.15;

  const doorPivot = new THREE.Group();
  doorPivot.name = "OutputDoorPivot";
  doorPivot.position.set(0, 0.29, 0.31);
  const door = new THREE.Mesh(
    createRoundedBoxGeometry(0.76, 0.42, 0.08, 0.055),
    materials.greenDark,
  );
  door.position.y = -0.2;
  doorPivot.add(door);

  const trayGroup = new THREE.Group();
  trayGroup.name = "OutputTray";
  trayGroup.position.set(0, -0.32, 0.23);
  trayGroup.userData.closedZ = 0.23;
  trayGroup.rotation.x = -0.1;
  const tray = new THREE.Mesh(
    createRoundedBoxGeometry(MACHINE_DIMENSIONS.outputWidth, 0.16, 0.84, 0.07),
    materials.steel,
  );
  tray.position.z = 0.36;
  const groove = new THREE.Mesh(
    new THREE.TorusGeometry(0.37, 0.025, 8, 28, Math.PI),
    materials.rubber,
  );
  groove.rotation.x = Math.PI / 2;
  groove.position.set(0, 0.11, 0.49);

  const railGeometry = createRoundedBoxGeometry(0.07, 0.17, 0.94, 0.025);
  [-0.54, 0.54].forEach((x) => {
    const rail = new THREE.Mesh(railGeometry, materials.brass);
    rail.position.set(x * 0.78, 0.1, 0.36);
    trayGroup.add(rail);
  });

  const scanMaterial = new THREE.MeshStandardMaterial({
    color: 0x163536,
    emissive: 0x00d7e8,
    emissiveIntensity: 0.04,
    roughness: 0.34,
    metalness: 0.25,
  });
  scanMaterial.name = "MachineTrayScan";
  const scanLine = new THREE.Mesh(
    createRoundedBoxGeometry(0.92, 0.025, 0.035, 0.01),
    scanMaterial,
  );
  scanLine.position.set(0, 0.12, 0.32);

  trayGroup.add(tray, groove, scanLine);
  group.add(frame, cavity, doorPivot, trayGroup);
  return {
    group,
    frame,
    cavity,
    doorPivot,
    door,
    trayGroup,
    tray,
    scanMaterial,
  };
}
