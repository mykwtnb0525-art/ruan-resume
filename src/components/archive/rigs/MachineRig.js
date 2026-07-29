import * as THREE from "three";

const clamp01 = (value) => Math.min(1, Math.max(0, value));

export const easeInOut = (value) =>
  value < 0.5
    ? 2 * value * value
    : 1 - Math.pow(-2 * value + 2, 2) / 2;

export function evaluateDialAngle(progress, dialMotion) {
  const resistancePoint = dialMotion.resistancePoint ?? 0.88;
  const degrees = dialMotion.degrees;
  if (progress <= resistancePoint) {
    return easeInOut(progress / resistancePoint) * degrees;
  }
  return (
    degrees -
    easeInOut((progress - resistancePoint) / (1 - resistancePoint)) *
      (dialMotion.reboundDegrees || 0)
  );
}

export function applyMachineRig({ machine, chapter, now, config }) {
  const dialMotion = config.machine.dialMotion;
  const direction = dialMotion.direction === "clockwise" ? -1 : 1;
  machine.handle.rotation.z = THREE.MathUtils.degToRad(
    direction * evaluateDialAngle(chapter.activate, dialMotion),
  );

  const trayMotion = config.machine.trayMotion;
  const trayStart = trayMotion?.activationStart ?? 0.72;
  const bayProgress = easeInOut(
    Math.max(
      chapter.dispense,
      clamp01((chapter.activate - trayStart) / (1 - trayStart)),
    ),
  );
  machine.outputBay.doorPivot.rotation.x =
    -bayProgress * (trayMotion?.doorAngle ?? 1.05);
  const closedTrayZ =
    machine.outputBay.trayGroup.userData.closedZ ??
    machine.outputBay.trayGroup.position.z;
  machine.outputBay.trayGroup.position.z =
    closedTrayZ + bayProgress * (trayMotion?.extension ?? 0.2);

  const rotor = config.machine.rotorMotion;
  if (rotor) {
    machine.capsules.rotation.y =
      THREE.MathUtils.degToRad(rotor.identifyDegrees) * chapter.identify +
      chapter.activate * Math.PI * rotor.activeTurns +
      Math.sin(now * rotor.idleFrequency) *
        rotor.idleAmplitude *
        (1 - chapter.dispense);
    machine.capsules.rotation.z =
      Math.sin(now * rotor.wobbleFrequency) *
      rotor.wobbleAmplitude *
      Math.max(chapter.identify, chapter.prime, chapter.activate);
  }

  return { bayProgress };
}
