import * as THREE from "three";
import { createCapsuleSystem } from "./CapsuleSystem.js";
import { createCapsuleChamber } from "./machine/CapsuleChamber.js";
import { createMachineBase } from "./machine/MachineBase.js";
import { createMachineBody } from "./machine/MachineBody.js";
import { createMachineDetails } from "./machine/MachineDetails.js";
import { createMachineLights } from "./machine/MachineLights.js";
import { createMachineMaterials } from "./machine/machineConfig.js";
import { createMechanicalDial } from "./machine/MechanicalDial.js";
import { createOutputBay } from "./machine/OutputBay.js";
import { createTextTexture } from "./threeUtils.js";

export function createGashaponMachine(config) {
  const group = new THREE.Group();
  group.name = "ArchiveGashaponMachine";
  group.position.fromArray(config.machine.position);
  group.userData.baseScale = config.machine.scale ?? 1;
  group.scale.setScalar(group.userData.baseScale);
  const materials = createMachineMaterials(THREE);
  const base = createMachineBase(materials);
  const body = createMachineBody(materials);
  const chamber = createCapsuleChamber(
    materials,
    config.machine.capsuleCount,
  );
  const dial = createMechanicalDial(materials);
  const outputBay = createOutputBay(materials);
  const details = createMachineDetails(materials);
  const lights = createMachineLights();

  const capsule = createCapsuleSystem();
  capsule.group.scale.setScalar(0.88);
  group.add(capsule.group);

  group.add(
    base.group,
    body.group,
    chamber.group,
    dial.group,
    outputBay.group,
    details.group,
    lights.group,
  );

  group.traverse((object) => {
    if (!object.isMesh) return;
    object.castShadow = object.material !== materials.glass;
    object.receiveShadow = object.material !== materials.glass;
  });

  return {
    group,
    base,
    body,
    chamber,
    capsules: chamber.capsules,
    handle: dial.group,
    dial,
    outputBay,
    tray: outputBay.trayGroup,
    capsule,
    lights,
    materials: {
      ...materials,
      statusMaterials: lights.statusMaterials,
      baseStatus: base.statusStripMaterial,
      trayScan: outputBay.scanMaterial,
    },
  };
}

function materialByName(root, name) {
  let match = null;
  root.traverse((object) => {
    if (match || !object.material) return;
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    match = materials.find((material) => material.name === name) || null;
  });
  return match;
}

export function bindGashaponGLTF(root, config) {
  const group =
    root.getObjectByName("ArchiveGashaponMachine") ||
    root.getObjectByName("KR_MemoryArchive_Gashapon") ||
    root;
  group.position.fromArray(config.machine.position);
  group.userData.baseScale = config.machine.scale ?? 1;
  group.scale.setScalar(group.userData.baseScale);
  group.traverse((object) => {
    if (!object.isMesh) return;
    object.castShadow = object.material?.name !== "MachineSmokedGlass";
    object.receiveShadow = object.material?.name !== "MachineSmokedGlass";
  });

  const archiveLabel = group.getObjectByName("MachineArchiveLabel");
  if (archiveLabel && typeof document !== "undefined") {
    const previousMaterial = archiveLabel.material;
    archiveLabel.material = new THREE.MeshBasicMaterial({
      map: createTextTexture(
        ["MEMORY ARCHIVE", "INSERT · SHARE · CONNECT", "KR / UNIT 01"],
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
    previousMaterial?.dispose?.();
  }

  const outputCapsule = group.getObjectByName("OutputCapsule");
  const capsule = {
    group: outputCapsule,
    top: group.getObjectByName("OutputCapsuleTop"),
    bottom: group.getObjectByName("OutputCapsuleBottom"),
    seam: group.getObjectByName("OutputCapsuleSeam"),
  };
  const outputBay = {
    doorPivot: group.getObjectByName("OutputDoorPivot"),
    trayGroup: group.getObjectByName("OutputTray"),
  };
  const lights = {
    chamberLight: group.getObjectByName("MachineChamberLight"),
    trayLight: group.getObjectByName("MachineTrayLight"),
  };

  return {
    group,
    base: group.getObjectByName("MachineBase"),
    body: group.getObjectByName("MachineBody"),
    chamber: group.getObjectByName("CapsuleChamber"),
    capsules: group.getObjectByName("CapsuleCarousel"),
    handle: group.getObjectByName("MechanicalDial"),
    dial: { group: group.getObjectByName("MechanicalDial") },
    outputBay,
    tray: outputBay.trayGroup,
    capsule,
    lights,
    materials: {
      ivory: materialByName(group, "MachineIvory"),
      green: materialByName(group, "MachineGreen"),
      wine: materialByName(group, "MachineWine"),
      metal: materialByName(group, "MachineDarkMetal"),
      glass: materialByName(group, "MachineSmokedGlass"),
      baseStatus: materialByName(group, "MachineBaseStatus"),
      trayScan: materialByName(group, "MachineTrayScan"),
      statusMaterials: [
        materialByName(group, "MachineStatusRed"),
        materialByName(group, "MachineStatusCyan"),
        materialByName(group, "MachineStatusGreen"),
      ].filter(Boolean),
    },
  };
}
