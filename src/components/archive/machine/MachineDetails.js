import * as THREE from "three";
import { createRoundedBoxGeometry, createTextTexture } from "../threeUtils.js";
import { MACHINE_DIMENSIONS } from "./machineConfig.js";

export function createMachineDetails(materials) {
  const group = new THREE.Group();
  group.name = "MachineDetails";
  const frontZ = 1.53;

  const screwGeometry = new THREE.CylinderGeometry(0.045, 0.045, 0.035, 14);
  [
    [-0.5, 1.08],
    [0.5, 1.08],
    [-0.5, 2.38],
    [0.5, 2.38],
  ].forEach(([x, y]) => {
    const screw = new THREE.Mesh(screwGeometry, materials.steel);
    screw.rotation.x = Math.PI / 2;
    screw.position.set(x, y, frontZ);
    group.add(screw);
  });

  const ventGeometry = createRoundedBoxGeometry(0.58, 0.035, 0.035, 0.012);
  for (let index = 0; index < 6; index += 1) {
    const vent = new THREE.Mesh(ventGeometry, materials.rubber);
    vent.position.set(0.92, 1.2 + index * 0.11, 1.18);
    vent.rotation.y = 0.64;
    group.add(vent);
  }

  const maintenance = new THREE.Mesh(
    createRoundedBoxGeometry(0.86, 0.58, 0.035, 0.045),
    materials.greenDark,
  );
  maintenance.position.set(-0.92, 1.63, 1.18);
  maintenance.rotation.y = -0.64;
  group.add(maintenance);

  const signFrame = new THREE.Mesh(
    createRoundedBoxGeometry(1.66, 0.58, 0.18, 0.1),
    materials.brass,
  );
  signFrame.position.set(0, 5.42, 0.22);
  const signFace = new THREE.Mesh(
    createRoundedBoxGeometry(1.5, 0.42, 0.06, 0.07),
    materials.wine,
  );
  signFace.position.set(0, 5.42, 0.33);

  const signArch = new THREE.Mesh(
    new THREE.TorusGeometry(0.76, 0.07, 10, 40, Math.PI),
    materials.metal,
  );
  signArch.position.set(0, 5.42, 0.14);

  const labelMaterial =
    typeof document === "undefined"
      ? new THREE.MeshStandardMaterial({
          color: 0xd5c29f,
          roughness: 0.58,
          metalness: 0.18,
        })
      : new THREE.MeshBasicMaterial({
          map: createTextTexture(
            [
              "MEMORY ARCHIVE",
              "INSERT · SHARE · CONNECT",
              "KR / UNIT 01",
            ],
            {
              width: 768,
              height: 260,
              background: "#30192d",
              color: "#ead8b8",
              accent: "#a6763d",
            },
          ),
          transparent: true,
          toneMapped: false,
        });
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(1.38, 0.34),
    labelMaterial,
  );
  label.position.set(0, 5.42, 0.368);

  const outputPlate = new THREE.Mesh(
    createRoundedBoxGeometry(0.88, 0.58, 0.08, 0.06),
    materials.ivory,
  );
  outputPlate.position.set(0, 0.64, 1.69);
  outputPlate.rotation.x = -0.08;

  const keyRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.12, 0.035, 8, 24),
    materials.brass,
  );
  keyRing.position.set(0.75, 1.8, 1.28);
  keyRing.rotation.y = 0.28;
  const keyStem = new THREE.Mesh(
    createRoundedBoxGeometry(0.07, 0.48, 0.05, 0.02),
    materials.brass,
  );
  keyStem.position.set(0.75, 1.5, 1.28);
  keyStem.rotation.z = -0.12;

  group.add(
    signFrame,
    signFace,
    signArch,
    label,
    outputPlate,
    keyRing,
    keyStem,
  );
  return { group, label, outputPlate, signFrame };
}
