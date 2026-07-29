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
import {
  applyCapsuleMaterialPreset,
  createOpeningRig,
} from "./rigs/CapsuleRig.js";
import { createTextTexture } from "./threeUtils.js";

export function createGashaponMachine(config, chapterConfig) {
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
  applyCapsuleMaterialPreset(capsule, chapterConfig);
  capsule.membrane = createOpeningRig(capsule, chapterConfig);
  capsule.group.scale.setScalar(chapterConfig.capsule.size);
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

function tuneFormalMachineMaterials(group) {
  const palette = {
    MachineIvory: {
      color: 0xc0ae96,
      env: 0.68,
      roughness: 0.53,
      metalness: 0.09,
    },
    MachineIvoryDark: {
      color: 0x9d8873,
      env: 0.58,
      roughness: 0.61,
      metalness: 0.08,
    },
    MachineGreen: {
      color: 0x4b6358,
      env: 0.75,
      roughness: 0.45,
      metalness: 0.14,
    },
    MachineGreenDark: {
      color: 0x30493f,
      env: 0.62,
      roughness: 0.54,
      metalness: 0.14,
    },
    MachineWine: {
      color: 0x61333b,
      env: 0.66,
      roughness: 0.52,
      metalness: 0.16,
    },
    MachineBrass: {
      color: 0x8d6a42,
      env: 1.02,
      roughness: 0.3,
      metalness: 0.9,
    },
    MachineSteel: {
      color: 0x655f59,
      env: 0.82,
      roughness: 0.36,
      metalness: 0.78,
    },
    MachineDarkMetal: {
      color: 0x292522,
      env: 0.72,
      roughness: 0.39,
      metalness: 0.72,
    },
    MachineSmokedGlass: {
      color: 0xc2d0ca,
      env: 1.08,
      roughness: 0.1,
      metalness: 0,
    },
  };

  group.traverse((object) => {
    if (!object.isMesh || !object.material) return;
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    materials.forEach((material) => {
      const tuning = palette[material.name];
      if (!tuning) return;
      material.color?.set(tuning.color);
      if ("envMapIntensity" in material) {
        material.envMapIntensity = tuning.env;
      }
      material.roughness = tuning.roughness;
      material.metalness = tuning.metalness;
      if (material.name === "MachineSmokedGlass") {
        material.transparent = true;
        material.opacity = 1;
        material.transmission = 0.88;
        material.ior = 1.47;
        material.thickness = 0.18;
        material.attenuationColor?.set(0xd4b8a9);
        material.attenuationDistance = 2.6;
        material.depthWrite = false;
      }
      material.needsUpdate = true;
    });
  });
}

export function bindGashaponGLTF(root, config, chapterConfig) {
  const group =
    root.getObjectByName("ArchiveGashaponMachine") ||
    root.getObjectByName("KR_MemoryArchive_Gashapon") ||
    root;
  group.position.fromArray(config.machine.position);
  group.userData.baseScale = config.machine.scale ?? 1;
  group.scale.setScalar(group.userData.baseScale);
  tuneFormalMachineMaterials(group);
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
    archiveLabel.position.z += 0.035;
    archiveLabel.renderOrder = 10;
    previousMaterial?.dispose?.();
  }

  const outputCapsule = group.getObjectByName("OutputCapsule");
  const capsule = {
    group: outputCapsule,
    top: group.getObjectByName("OutputCapsuleTop"),
    bottom: group.getObjectByName("OutputCapsuleBottom"),
    seam: group.getObjectByName("OutputCapsuleSeam"),
  };
  applyCapsuleMaterialPreset(capsule, chapterConfig);
  capsule.membrane = createOpeningRig(capsule, chapterConfig);
  capsule.group.scale.setScalar(chapterConfig.capsule.size);
  capsule.group.visible = false;
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
      brass: materialByName(group, "MachineBrass"),
      steel: materialByName(group, "MachineSteel"),
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
