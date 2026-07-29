import * as THREE from "three";
import { easeInOut } from "./MachineRig.js";

const toRadians = (degrees) => THREE.MathUtils.degToRad(degrees || 0);

function cubicBezier(points, progress, target) {
  const [p0, p1, p2, p3] = points;
  const inverse = 1 - progress;
  target
    .copy(p0)
    .multiplyScalar(inverse ** 3)
    .addScaledVector(p1, 3 * inverse ** 2 * progress)
    .addScaledVector(p2, 3 * inverse * progress ** 2)
    .addScaledVector(p3, progress ** 3);
}

export function createCapsuleReleasePath(config) {
  return config.capsule.releasePath.map(
    ([x, y, z]) => new THREE.Vector3(x, y, z),
  );
}

export function applyCapsuleMaterialPreset(capsule, config) {
  if (!capsule?.top || !capsule?.bottom || !capsule?.seam) return;
  if (config.capsule.materialPreset !== "faded-eco-future") return;

  capsule.top.material = new THREE.MeshPhysicalMaterial({
    name: "Capsule01FadedSage",
    color: 0x91a79e,
    emissive: 0x9c85bc,
    emissiveIntensity: 0.12,
    transparent: true,
    opacity: 1,
    roughness: 0.2,
    metalness: 0.04,
    transmission: 0.64,
    ior: 1.4,
    thickness: 0.08,
    envMapIntensity: 0.85,
  });
  capsule.bottom.material = new THREE.MeshPhysicalMaterial({
    name: "Capsule01FadedRose",
    color: 0xc2a8b6,
    emissive: 0x79698f,
    emissiveIntensity: 0.1,
    transparent: true,
    opacity: 1,
    roughness: 0.2,
    metalness: 0.04,
    transmission: 0.62,
    ior: 1.4,
    thickness: 0.08,
    envMapIntensity: 0.85,
  });
  capsule.seam.material = new THREE.MeshStandardMaterial({
    name: "Capsule01OxidizedSilver",
    color: 0xb6b1a8,
    emissive: 0x9c85bc,
    emissiveIntensity: 0.08,
    transparent: true,
    opacity: 0.9,
    roughness: 0.36,
    metalness: 0.5,
  });
}

export function createOpeningRig(capsule, config) {
  if (
    !capsule?.group ||
    config.capsule.openingType !== "membrane-split"
  ) {
    return null;
  }
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xb9b6c9,
    emissive: 0x9c85bc,
    emissiveIntensity: 0.08,
    transparent: true,
    opacity: 0.2,
    roughness: 0.2,
    metalness: 0.02,
    transmission: 0.62,
    ior: 1.4,
    thickness: 0.07,
    envMapIntensity: 0.85,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const left = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.36,
      24,
      14,
      Math.PI / 2,
      Math.PI,
      0,
      Math.PI,
    ),
    material,
  );
  const right = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.36,
      24,
      14,
      -Math.PI / 2,
      Math.PI,
      0,
      Math.PI,
    ),
    material.clone(),
  );
  left.name = "OutputCapsuleMembraneLeft";
  right.name = "OutputCapsuleMembraneRight";
  capsule.group.add(left, right);
  return { left, right };
}

export function applyCapsuleRig({
  machine,
  chapter,
  now,
  config,
  releasePath,
  position,
}) {
  const { landing, identifyMotion, openingParams } = config.capsule;
  const dispense = chapter.dispense;
  const capsuleVisible = chapter.identify > 0 && chapter.commit < 1;
  machine.capsule.group.visible = capsuleVisible;

  if (capsuleVisible) {
    if (dispense > 0) {
      cubicBezier(releasePath, easeInOut(dispense), position);
    } else {
      position.copy(releasePath[0]);
      position.x +=
        Math.sin(now * 0.0011) *
        (identifyMotion.hoverAmplitude || 0) *
        chapter.identify;
      position.y +=
        chapter.identify * identifyMotion.offset[1] +
        Math.sin(now * 0.0016) * 0.01;
    }
    if (chapter.land > 0 && chapter.land < 1) {
      position.y +=
        Math.sin(chapter.land * Math.PI * landing.bounces) *
        landing.bounceHeight;
      position.x += chapter.land * landing.lateralSlide;
    } else if (chapter.land >= 1) {
      position.x += landing.lateralSlide;
    }
    position.y += chapter.land * landing.lift;
    position.z += chapter.land * landing.depth;
    machine.capsule.group.position.copy(position);

    const [finalX, finalY, finalZ] = landing.finalRotationDeg;
    const identifyY = identifyMotion.rotationDeg[1] * chapter.identify;
    machine.capsule.group.rotation.set(
      toRadians(finalX) * dispense,
      toRadians(identifyY) +
        toRadians(finalY - identifyMotion.rotationDeg[1]) * dispense,
      toRadians(finalZ) * dispense,
    );
  }

  const capsuleOpen = easeInOut(chapter.capsuleOpen);
  const capsuleEmphasis = Math.max(
    chapter.identify,
    chapter.dispense,
    chapter.open,
  );
  machine.capsule.top.material.emissiveIntensity =
    0.12 + capsuleEmphasis * 0.34;
  machine.capsule.bottom.material.emissiveIntensity =
    0.1 + capsuleEmphasis * 0.26;

  if (config.capsule.openingType === "membrane-split") {
    const topRotation = openingParams.topRotationDeg || [0, 0, 0];
    const bottomRotation = openingParams.bottomRotationDeg || [0, 0, 0];
    machine.capsule.top.position.y =
      capsuleOpen * (openingParams.topLift || 0);
    machine.capsule.bottom.position.y =
      -capsuleOpen * (openingParams.bottomDrop || 0);
    machine.capsule.top.rotation.set(
      capsuleOpen * toRadians(topRotation[0]),
      capsuleOpen * toRadians(topRotation[1]),
      capsuleOpen * toRadians(topRotation[2]),
    );
    machine.capsule.bottom.rotation.set(
      capsuleOpen * toRadians(bottomRotation[0]),
      capsuleOpen * toRadians(bottomRotation[1]),
      capsuleOpen * toRadians(bottomRotation[2]),
    );
    machine.capsule.seam.material.opacity = 0.9 * (1 - capsuleOpen);
    machine.capsule.seam.material.transparent = capsuleOpen > 0;
    if (machine.capsule.membrane) {
      const offset = openingParams.membraneOffset || 0;
      const rotation = toRadians(openingParams.membraneRotationDeg || 0);
      machine.capsule.membrane.left.position.x = -capsuleOpen * offset;
      machine.capsule.membrane.right.position.x = capsuleOpen * offset;
      machine.capsule.membrane.left.rotation.z = capsuleOpen * rotation;
      machine.capsule.membrane.right.rotation.z = -capsuleOpen * rotation;
      machine.capsule.membrane.left.material.opacity =
        0.22 * (1 - chapter.open * 0.7);
      machine.capsule.membrane.right.material.opacity =
        0.22 * (1 - chapter.open * 0.7);
    }
  }

  return { capsuleOpen, capsuleVisible };
}
