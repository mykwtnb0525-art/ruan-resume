import * as THREE from "three";

const CAPSULE_STYLES = [
  [0xcfc4b2, 0x6b1924],
  [0x777571, 0xc9bba4],
  [0x17372f, 0xb9aa93],
  [0x426d6d, 0x182e2e],
  [0x735c78, 0xc7b8c9],
  [0x77726a, 0x2e302f],
];

function capsuleMaterial(color, transparent = false) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: transparent ? 0.28 : 0.46,
    metalness: transparent ? 0.08 : 0.18,
    transparent,
    opacity: transparent ? 0.7 : 1,
  });
}

export function createCapsuleInstances(count = 24) {
  const group = new THREE.Group();
  group.name = "CapsuleInstances";

  const topGeometry = new THREE.SphereGeometry(
    0.245,
    18,
    10,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2,
  );
  const bottomGeometry = new THREE.SphereGeometry(
    0.245,
    18,
    10,
    0,
    Math.PI * 2,
    Math.PI / 2,
    Math.PI / 2,
  );
  const seamGeometry = new THREE.TorusGeometry(0.245, 0.018, 7, 18);
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
      capsuleMaterial(0x292421),
      actualCount,
    );

    for (let localIndex = 0; localIndex < actualCount; localIndex += 1) {
      const index = styleIndex * perStyle + localIndex;
      const layer = Math.floor(index / 8);
      const slot = index % 8;
      const angle = slot * (Math.PI / 4) + layer * 0.42;
      const radius = 0.34 + (slot % 3) * 0.22;
      dummy.position.set(
        Math.cos(angle) * radius,
        -0.53 + layer * 0.47 + (slot % 2) * 0.06,
        Math.sin(angle) * radius * 0.62,
      );
      dummy.rotation.set(
        (index % 4) * 0.32,
        angle * 0.45,
        (index % 5) * 0.27,
      );
      const scale = 0.86 + (index % 3) * 0.075;
      dummy.scale.set(scale, scale * 0.84, scale);
      dummy.updateMatrix();
      top.setMatrixAt(localIndex, dummy.matrix);
      bottom.setMatrixAt(localIndex, dummy.matrix);
      seam.setMatrixAt(localIndex, dummy.matrix);
    }

    [top, bottom, seam].forEach((mesh) => {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.castShadow = true;
      group.add(mesh);
      capsuleMeshes.push(mesh);
    });
  });

  return { group, capsuleMeshes };
}
