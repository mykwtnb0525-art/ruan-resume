import * as THREE from "three";
import { MACHINE_DIMENSIONS, MACHINE_PALETTE } from "./machineConfig.js";

export function createMachineLights() {
  const group = new THREE.Group();
  group.name = "MachineLights";

  const colors = [
    MACHINE_PALETTE.red,
    MACHINE_PALETTE.cyan,
    MACHINE_PALETTE.greenLight,
  ];
  const statusMaterials = colors.map((color, index) => {
    const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.035,
        roughness: 0.3,
        metalness: 0.14,
      });
    material.name = ["MachineStatusRed", "MachineStatusCyan", "MachineStatusGreen"][
      index
    ];
    return material;
  });
  statusMaterials.forEach((material, index) => {
    const socket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.085, 0.045, 18),
      new THREE.MeshStandardMaterial({
        color: 0x282725,
        roughness: 0.36,
        metalness: 0.86,
      }),
    );
    socket.rotation.x = Math.PI / 2;
    socket.position.set(
      -0.25 + index * 0.25,
      2.72,
      1.56,
    );
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.052, 14, 10),
      material,
    );
    bulb.position.copy(socket.position);
    bulb.position.z += 0.035;
    group.add(socket, bulb);
  });

  const chamberLight = new THREE.PointLight(MACHINE_PALETTE.cyan, 0, 4.2, 2);
  chamberLight.name = "MachineChamberLight";
  chamberLight.position.set(0, 4.65, 0.18);
  const trayLight = new THREE.PointLight(MACHINE_PALETTE.red, 0, 2.8, 2);
  trayLight.name = "MachineTrayLight";
  trayLight.position.set(0, 0.92, 1.62);
  group.add(chamberLight, trayLight);

  return { group, statusMaterials, chamberLight, trayLight };
}
