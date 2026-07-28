import * as THREE from "three";

export function createCapsuleSystem() {
  const group = new THREE.Group();
  group.name = "OutputCapsule";

  const topMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b2635,
    roughness: 0.34,
    metalness: 0.08,
    transparent: true,
  });
  const bottomMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8d0c2,
    roughness: 0.4,
    metalness: 0.04,
    transparent: true,
  });
  const top = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    topMaterial,
  );
  top.name = "OutputCapsuleTop";
  const bottom = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.34,
      28,
      16,
      0,
      Math.PI * 2,
      Math.PI / 2,
      Math.PI / 2,
    ),
    bottomMaterial,
  );
  bottom.name = "OutputCapsuleBottom";
  const seam = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.024, 8, 32),
    new THREE.MeshStandardMaterial({
      color: 0x292421,
      roughness: 0.5,
      metalness: 0.55,
    }),
  );
  seam.name = "OutputCapsuleSeam";
  seam.rotation.x = Math.PI / 2;
  group.add(top, bottom, seam);
  group.visible = false;

  return { group, top, bottom, seam, topMaterial, bottomMaterial };
}
