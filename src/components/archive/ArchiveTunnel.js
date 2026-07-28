import * as THREE from "three";

export function createArchiveTunnel({ compact = false } = {}) {
  const group = new THREE.Group();
  group.name = "ArchiveMemoryField";

  const fragments = new THREE.Group();
  fragments.name = "ArchiveMemoryFragments";
  group.add(fragments);

  const paperMaterials = [
    new THREE.MeshBasicMaterial({
      color: 0xc8ad91,
      transparent: true,
      opacity: 0.11,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    new THREE.MeshBasicMaterial({
      color: 0x9d7474,
      transparent: true,
      opacity: 0.09,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    new THREE.MeshBasicMaterial({
      color: 0x557d78,
      transparent: true,
      opacity: 0.07,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  ];

  const fragmentCount = compact ? 6 : 14;
  for (let index = 0; index < fragmentCount; index += 1) {
    const side = index % 2 ? 1 : -1;
    const width = 0.85 + (index % 4) * 0.22;
    const height = 0.62 + (index % 3) * 0.2;
    const fragment = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      paperMaterials[index % paperMaterials.length],
    );
    fragment.position.set(
      side * (3.1 + (index % 3) * 0.72),
      -2.15 + ((index * 1.63) % 4.3),
      3 + ((index * 3.37) % 23),
    );
    fragment.rotation.set(
      (index % 3 - 1) * 0.12,
      side * (0.44 + (index % 4) * 0.07),
      (index % 5 - 2) * 0.1,
    );
    fragment.userData.baseX = fragment.position.x;
    fragment.userData.baseZ = fragment.position.z;
    fragment.userData.drift = 0.45 + (index % 4) * 0.16;
    fragments.add(fragment);
  }

  const hazeMaterial = new THREE.MeshBasicMaterial({
    color: 0x7a3f54,
    transparent: true,
    opacity: 0.035,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  [-1, 1].forEach((side) => {
    const haze = new THREE.Mesh(
      new THREE.PlaneGeometry(5.5, 8),
      hazeMaterial,
    );
    haze.position.set(side * 4.8, 0.2, 13);
    haze.rotation.y = side * -0.46;
    group.add(haze);
  });

  return {
    group,
    materials: [...paperMaterials, hazeMaterial],
    fragments,
    setProgress({ collage, travel, arrival }) {
      fragments.children.forEach((fragment, index) => {
        const side = index % 2 ? 1 : -1;
        fragment.position.x =
          fragment.userData.baseX +
          side * travel * fragment.userData.drift * 2.2;
        fragment.position.z =
          fragment.userData.baseZ - travel * fragment.userData.drift * 3.2;
      });
      const fade = Math.max(0.18, 1 - arrival * 0.74);
      paperMaterials[0].opacity = (0.04 + collage * 0.12) * fade;
      paperMaterials[1].opacity = (0.03 + collage * 0.1) * fade;
      paperMaterials[2].opacity = (0.02 + travel * 0.09) * fade;
      hazeMaterial.opacity = (0.018 + travel * 0.052) * fade;
    },
  };
}
