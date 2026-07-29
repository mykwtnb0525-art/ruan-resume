import * as THREE from "three";

export function createCapsuleSystem() {
  const group = new THREE.Group();
  group.name = "OutputCapsule";

  const topMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x91a79e,
    emissive: 0x9c85bc,
    emissiveIntensity: 0.12,
    roughness: 0.42,
    metalness: 0.08,
    transparent: true,
    opacity: 0.62,
    transmission: 0.08,
  });
  const bottomMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xc2a8b6,
    emissive: 0x79698f,
    emissiveIntensity: 0.1,
    roughness: 0.42,
    metalness: 0.08,
    transparent: true,
    opacity: 0.62,
    transmission: 0.08,
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
  const membraneMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xb9b6c9,
    emissive: 0x9c85bc,
    emissiveIntensity: 0.08,
    transparent: true,
    opacity: 0.22,
    roughness: 0.28,
    transmission: 0.18,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const membraneLeft = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.36,
      24,
      14,
      Math.PI / 2,
      Math.PI,
      0,
      Math.PI,
    ),
    membraneMaterial,
  );
  const membraneRight = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.36,
      24,
      14,
      -Math.PI / 2,
      Math.PI,
      0,
      Math.PI,
    ),
    membraneMaterial.clone(),
  );
  membraneLeft.name = "OutputCapsuleMembraneLeft";
  membraneRight.name = "OutputCapsuleMembraneRight";
  group.add(top, bottom, seam, membraneLeft, membraneRight);
  group.visible = false;

  return {
    group,
    top,
    bottom,
    seam,
    membrane: { left: membraneLeft, right: membraneRight },
    topMaterial,
    bottomMaterial,
  };
}
