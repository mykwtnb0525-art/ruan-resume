import * as THREE from "three";
import { ARCHIVE_VISUAL_BASELINE } from "../visual/visualBaseline.js";

const CAPSULE_STYLES = [
  [0xd6c6b2, 0x9b5762],
  [0x8e8780, 0xc0b5a4],
  [0x5f786e, 0xb8aa93],
  [0x5f8480, 0x536e6b],
  [0x816f87, 0xc7b8c9],
  [0x9a958c, 0x656a66],
];

function capsuleMaterial(color, transparent = false) {
  const material = new THREE.MeshPhysicalMaterial({
    color,
    roughness: transparent ? 0.13 : 0.18,
    metalness: transparent ? 0.02 : 0.05,
    transparent: false,
    opacity: 1,
    transmission: transparent ? 0.2 : 0.1,
    thickness: 0.06,
    ior: 1.42,
    envMapIntensity: transparent ? 0.96 : 0.9,
    depthWrite: true,
    depthTest: true,
  });
  material.userData.archiveCapsuleMaterial = true;
  return material;
}

export function createCapsuleInstances(count = 32) {
  const group = new THREE.Group();
  group.name = "CapsuleInstances";

  const topGeometry = new THREE.SphereGeometry(
    0.205,
    22,
    12,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2,
  );
  const bottomGeometry = new THREE.SphereGeometry(
    0.205,
    22,
    12,
    0,
    Math.PI * 2,
    Math.PI / 2,
    Math.PI / 2,
  );
  const seamGeometry = new THREE.TorusGeometry(0.205, 0.014, 7, 22);
  seamGeometry.rotateX(Math.PI / 2);
  const perStyle = Math.ceil(count / CAPSULE_STYLES.length);
  const capsuleMeshes = [];
  const dummy = new THREE.Object3D();

  CAPSULE_STYLES.forEach(([topColor, bottomColor], styleIndex) => {
    const actualCount = Math.max(
      0,
      Math.min(perStyle, count - styleIndex * perStyle),
    );
    if (!actualCount) return;

    const top = new THREE.InstancedMesh(
      topGeometry,
      capsuleMaterial(topColor, styleIndex === 3 || styleIndex === 4),
      actualCount,
    );
    const bottom = new THREE.InstancedMesh(
      bottomGeometry,
      capsuleMaterial(bottomColor, styleIndex === 4),
      actualCount,
    );
    const seam = new THREE.InstancedMesh(
      seamGeometry,
      new THREE.MeshStandardMaterial({
        color: 0x4c4641,
        roughness: 0.34,
        metalness: 0.42,
        envMapIntensity: 0.78,
      }),
      actualCount,
    );

    for (let localIndex = 0; localIndex < actualCount; localIndex += 1) {
      const index = styleIndex * perStyle + localIndex;
      const layer = Math.floor(index / 8);
      const slot = index % 8;
      const angle = slot * (Math.PI / 4) + layer * 0.37;
      const radius = 0.28 + (slot % 3) * 0.22 + (layer % 2) * 0.035;
      dummy.position.set(
        Math.cos(angle) * radius,
        -0.66 + layer * 0.43 + (slot % 2) * 0.045,
        Math.sin(angle) * radius * 0.56,
      );
      dummy.rotation.set(
        (index % 4) * 0.32,
        angle * 0.45,
        (index % 5) * 0.27,
      );
      const scale = 0.88 + (index % 4) * 0.045;
      dummy.scale.set(scale, scale * 0.88, scale);
      dummy.updateMatrix();
      top.setMatrixAt(localIndex, dummy.matrix);
      bottom.setMatrixAt(localIndex, dummy.matrix);
      seam.setMatrixAt(localIndex, dummy.matrix);
    }

    [top, bottom, seam].forEach((mesh) => {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.castShadow = true;
      mesh.renderOrder =
        ARCHIVE_VISUAL_BASELINE.chamberCapsules.middle.renderOrder;
      group.add(mesh);
      capsuleMeshes.push(mesh);
    });
  });

  return { group, capsuleMeshes };
}
