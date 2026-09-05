export const MACHINE_DIMENSIONS = {
  width: 2.82,
  height: 6.12,
  depth: 2.34,
  bodyHeight: 2.48,
  chamberWidth: 2.58,
  chamberHeight: 2.2,
  chamberDepth: 2.16,
  dialRadius: 0.45,
  outputWidth: 0.9,
};

export const MACHINE_PALETTE = {
  ivory: 0xb9aa93,
  ivoryDark: 0x746957,
  green: 0x17372f,
  greenDark: 0x0b211c,
  wine: 0x55131c,
  rubber: 0x11100f,
  metal: 0x373532,
  steel: 0x77726a,
  brass: 0x776548,
  glass: 0x29413f,
  cyan: 0x00d7e8,
  red: 0x9f1e2d,
  greenLight: 0x8cff45,
};

export function createMachineMaterials(THREE) {
  const presets = ARCHIVE_VISUAL_BASELINE.materials;
  const ivory = new THREE.MeshStandardMaterial({
    color: presets.MachineIvory.color,
    roughness: presets.MachineIvory.roughness,
    metalness: presets.MachineIvory.metalness,
    envMapIntensity: presets.MachineIvory.envMapIntensity,
    emissive: 0x160b08,
    emissiveIntensity: 0.035,
  });
  ivory.name = "MachineIvory";
  const ivoryDark = new THREE.MeshStandardMaterial({
    color: presets.MachineIvoryDark.color,
    roughness: presets.MachineIvoryDark.roughness,
    metalness: presets.MachineIvoryDark.metalness,
    envMapIntensity: presets.MachineIvoryDark.envMapIntensity,
  });
  ivoryDark.name = "MachineIvoryDark";
  const green = new THREE.MeshStandardMaterial({
    color: presets.MachineGreen.color,
    roughness: presets.MachineGreen.roughness,
    metalness: presets.MachineGreen.metalness,
    envMapIntensity: presets.MachineGreen.envMapIntensity,
  });
  green.name = "MachineGreen";
  const greenDark = new THREE.MeshStandardMaterial({
    color: presets.MachineGreenDark.color,
    roughness: presets.MachineGreenDark.roughness,
    metalness: presets.MachineGreenDark.metalness,
    envMapIntensity: presets.MachineGreenDark.envMapIntensity,
  });
  greenDark.name = "MachineGreenDark";
  const wine = new THREE.MeshStandardMaterial({
    color: presets.MachineWine.color,
    roughness: presets.MachineWine.roughness,
    metalness: presets.MachineWine.metalness,
    envMapIntensity: presets.MachineWine.envMapIntensity,
    emissive: 0x3a080e,
    emissiveIntensity: 0.05,
  });
  wine.name = "MachineWine";
  const metal = new THREE.MeshStandardMaterial({
    color: presets.MachineDarkMetal.color,
    roughness: presets.MachineDarkMetal.roughness,
    metalness: presets.MachineDarkMetal.metalness,
    envMapIntensity: presets.MachineDarkMetal.envMapIntensity,
  });
  metal.name = "MachineDarkMetal";
  const steel = new THREE.MeshStandardMaterial({
    color: presets.MachineSteel.color,
    roughness: presets.MachineSteel.roughness,
    metalness: presets.MachineSteel.metalness,
    envMapIntensity: presets.MachineSteel.envMapIntensity,
  });
  steel.name = "MachineSteel";
  const brass = new THREE.MeshStandardMaterial({
    color: presets.MachineBrass.color,
    roughness: presets.MachineBrass.roughness,
    metalness: presets.MachineBrass.metalness,
    envMapIntensity: presets.MachineBrass.envMapIntensity,
  });
  brass.name = "MachineBrass";
  const rubber = new THREE.MeshStandardMaterial({
    color: MACHINE_PALETTE.rubber,
    roughness: 0.84,
    metalness: 0.08,
  });
  rubber.name = "MachineRubber";
  const glass = new THREE.MeshPhysicalMaterial({
    color: presets.MachineSmokedGlass.color,
    roughness: presets.MachineSmokedGlass.roughness,
    metalness: 0,
    transparent: true,
    opacity: 1,
    transmission: presets.MachineSmokedGlass.transmission,
    thickness: presets.MachineSmokedGlass.thickness,
    ior: presets.MachineSmokedGlass.ior,
    attenuationColor: new THREE.Color(
      presets.MachineSmokedGlass.attenuationColor,
    ),
    attenuationDistance: presets.MachineSmokedGlass.attenuationDistance,
    envMapIntensity: presets.MachineSmokedGlass.envMapIntensity,
    depthWrite: false,
    depthTest: true,
    side: THREE.FrontSide,
  });
  glass.name = "MachineSmokedGlass";

  return {
    ivory,
    ivoryDark,
    green,
    greenDark,
    wine,
    metal,
    steel,
    brass,
    rubber,
    glass,
  };
}
import { ARCHIVE_VISUAL_BASELINE } from "../visual/visualBaseline.js";
