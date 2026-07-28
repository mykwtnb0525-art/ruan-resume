export const MACHINE_DIMENSIONS = {
  width: 2.95,
  height: 5.45,
  depth: 2.72,
  bodyHeight: 2.32,
  chamberWidth: 2.64,
  chamberHeight: 2.05,
  chamberDepth: 2.64,
  dialRadius: 0.5,
  outputWidth: 0.94,
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
  const ivory = new THREE.MeshStandardMaterial({
    color: MACHINE_PALETTE.ivory,
    roughness: 0.56,
    metalness: 0.38,
    emissive: 0x160b08,
    emissiveIntensity: 0.035,
  });
  ivory.name = "MachineIvory";
  const ivoryDark = new THREE.MeshStandardMaterial({
    color: MACHINE_PALETTE.ivoryDark,
    roughness: 0.66,
    metalness: 0.3,
  });
  ivoryDark.name = "MachineIvoryDark";
  const green = new THREE.MeshStandardMaterial({
    color: MACHINE_PALETTE.green,
    roughness: 0.48,
    metalness: 0.46,
  });
  green.name = "MachineGreen";
  const greenDark = new THREE.MeshStandardMaterial({
    color: MACHINE_PALETTE.greenDark,
    roughness: 0.68,
    metalness: 0.28,
  });
  greenDark.name = "MachineGreenDark";
  const wine = new THREE.MeshStandardMaterial({
    color: MACHINE_PALETTE.wine,
    roughness: 0.52,
    metalness: 0.24,
    emissive: 0x3a080e,
    emissiveIntensity: 0.05,
  });
  wine.name = "MachineWine";
  const metal = new THREE.MeshStandardMaterial({
    color: MACHINE_PALETTE.metal,
    roughness: 0.3,
    metalness: 0.86,
  });
  metal.name = "MachineDarkMetal";
  const steel = new THREE.MeshStandardMaterial({
    color: MACHINE_PALETTE.steel,
    roughness: 0.27,
    metalness: 0.9,
  });
  steel.name = "MachineSteel";
  const brass = new THREE.MeshStandardMaterial({
    color: MACHINE_PALETTE.brass,
    roughness: 0.36,
    metalness: 0.78,
  });
  brass.name = "MachineBrass";
  const rubber = new THREE.MeshStandardMaterial({
    color: MACHINE_PALETTE.rubber,
    roughness: 0.84,
    metalness: 0.08,
  });
  rubber.name = "MachineRubber";
  const glass = new THREE.MeshPhysicalMaterial({
    color: MACHINE_PALETTE.glass,
    roughness: 0.2,
    metalness: 0,
    transparent: true,
    opacity: 0.34,
    transmission: 0.34,
    thickness: 0.82,
    ior: 1.38,
    depthWrite: false,
    side: THREE.DoubleSide,
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
