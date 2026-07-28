import * as THREE from "three";

export function createArchiveTunnel({ compact = false } = {}) {
  const group = new THREE.Group();
  group.name = "ArchiveTunnel";
  const materials = [];

  const frameMaterial = new THREE.LineBasicMaterial({
    color: 0x7f726a,
    transparent: true,
    opacity: 0.24,
  });
  const railMaterial = new THREE.LineBasicMaterial({
    color: 0x9f1e2d,
    transparent: true,
    opacity: 0.14,
  });
  materials.push(frameMaterial, railMaterial);

  const frames = [];
  const frameCount = compact ? 8 : 16;
  for (let index = 0; index < frameCount; index += 1) {
    const z = 1 + index * (17 / frameCount);
    frames.push(
      -5.8, -3.2, z, 5.8, -3.2, z,
      5.8, -3.2, z, 5.8, 3.2, z,
      5.8, 3.2, z, -5.8, 3.2, z,
      -5.8, 3.2, z, -5.8, -3.2, z,
    );
  }
  const frameGeometry = new THREE.BufferGeometry();
  frameGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(frames, 3),
  );
  group.add(new THREE.LineSegments(frameGeometry, frameMaterial));

  const rails = [];
  [-4.4, -2.2, 0, 2.2, 4.4].forEach((x) => {
    rails.push(x, -3.2, 0, x, -3.2, 18);
    rails.push(x, 3.2, 0, x, 3.2, 18);
  });
  [-2.1, -0.7, 0.7, 2.1].forEach((y) => {
    rails.push(-5.8, y, 0, -5.8, y, 18);
    rails.push(5.8, y, 0, 5.8, y, 18);
  });
  const railGeometry = new THREE.BufferGeometry();
  railGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(rails, 3),
  );
  group.add(new THREE.LineSegments(railGeometry, railMaterial));

  const paperGeometry = new THREE.PlaneGeometry(0.9, 0.62);
  const paperMaterial = new THREE.MeshBasicMaterial({
    color: 0xc8b5a4,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  materials.push(paperMaterial);
  const fragmentCount = compact ? 5 : 16;
  const fragments = new THREE.InstancedMesh(
    paperGeometry,
    paperMaterial,
    fragmentCount,
  );
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const position = new THREE.Vector3();
  for (let index = 0; index < fragmentCount; index += 1) {
    const side = index % 2 ? 1 : -1;
    position.set(
      side * (3.5 + (index % 4) * 0.45),
      -2.1 + ((index * 1.73) % 4.2),
      1.2 + ((index * 3.17) % 15.8),
    );
    quaternion.setFromEuler(
      new THREE.Euler(index * 0.19, side * 0.45, index * 0.13),
    );
    const size = 0.65 + (index % 3) * 0.18;
    scale.set(size, size, size);
    matrix.compose(position, quaternion, scale);
    fragments.setMatrixAt(index, matrix);
  }
  fragments.instanceMatrix.needsUpdate = true;
  group.add(fragments);

  return {
    group,
    materials,
    fragments,
    setVisibility(progress) {
      const opacity = Math.max(0.025, 1 - progress * 0.92);
      frameMaterial.opacity = 0.24 * opacity;
      railMaterial.opacity = 0.14 * opacity;
      paperMaterial.opacity = 0.12 * opacity;
    },
  };
}
