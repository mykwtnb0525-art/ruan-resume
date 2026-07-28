import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

globalThis.ProgressEvent ??= class ProgressEvent {
  constructor(type, init = {}) {
    this.type = type;
    Object.assign(this, init);
  }
};

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const modelPath = path.join(
  projectRoot,
  "public",
  "models",
  "archive-gashapon.glb",
);
const buffer = await readFile(modelPath);
const arrayBuffer = buffer.buffer.slice(
  buffer.byteOffset,
  buffer.byteOffset + buffer.byteLength,
);
const loader = new GLTFLoader();
const gltf = await new Promise((resolve, reject) => {
  loader.parse(arrayBuffer, "", resolve, reject);
});

const requiredNodes = [
  "ArchiveGashaponMachine",
  "MechanicalDial",
  "CapsuleCarousel",
  "OutputDoorPivot",
  "OutputTray",
  "OutputCapsule",
  "OutputCapsuleTop",
  "OutputCapsuleBottom",
  "OutputCapsuleSeam",
];
const nodes = requiredNodes.map((name) => ({
  name,
  found: Boolean(gltf.scene.getObjectByName(name)),
}));
const materials = new Set();
let meshCount = 0;
gltf.scene.traverse((object) => {
  if (!object.isMesh) return;
  meshCount += 1;
  const objectMaterials = Array.isArray(object.material)
    ? object.material
    : [object.material];
  objectMaterials.forEach((material) => materials.add(material.name));
});
const bounds = new THREE.Box3().setFromObject(gltf.scene);
const size = bounds.getSize(new THREE.Vector3());
const result = {
  modelPath,
  bytes: buffer.byteLength,
  meshCount,
  nodes,
  allRequiredNodesPresent: nodes.every((node) => node.found),
  materials: [...materials].filter(Boolean).sort(),
  dimensions: {
    width: Number(size.x.toFixed(3)),
    height: Number(size.y.toFixed(3)),
    depth: Number(size.z.toFixed(3)),
  },
};
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!result.allRequiredNodesPresent) process.exitCode = 1;
