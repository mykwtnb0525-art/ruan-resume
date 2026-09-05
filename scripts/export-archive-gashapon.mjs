import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { createGashaponMachine } from "../src/components/archive/GashaponMachine.js";
import { chapter01 } from "../src/components/archive/config/chapter01.ts";

class NodeFileReader {
  constructor() {
    this.result = null;
    this.onloadend = null;
    this.onerror = null;
  }

  async readAsArrayBuffer(blob) {
    try {
      this.result = await blob.arrayBuffer();
      this.onloadend?.();
    } catch (error) {
      this.onerror?.(error);
    }
  }

  async readAsDataURL(blob) {
    try {
      const buffer = Buffer.from(await blob.arrayBuffer());
      this.result = `data:${blob.type};base64,${buffer.toString("base64")}`;
      this.onloadend?.();
    } catch (error) {
      this.onerror?.(error);
    }
  }
}

globalThis.FileReader ??= NodeFileReader;

const scriptPath = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(scriptPath), "..");
const outputPath = path.join(
  projectRoot,
  "public",
  "models",
  "archive-gashapon-web.glb",
);

const scene = new THREE.Scene();
scene.name = "KR_MemoryArchive_Gashapon";
const machine = createGashaponMachine({
  machine: {
    position: [0, 0, 0],
    capsuleCount: 32,
  },
}, chapter01);

machine.group.position.set(0, 0, 0);
machine.group.rotation.set(0, 0, 0);
machine.group.scale.setScalar(1);
machine.capsule.group.visible = true;
machine.capsule.group.position.set(-0.03, 0.5, 1.48);
machine.capsule.group.name = "OutputCapsule";
machine.dial.group.name = "MechanicalDial";
machine.outputBay.doorPivot.name = "OutputDoorPivot";
machine.outputBay.trayGroup.name = "OutputTray";
machine.chamber.capsules.name = "CapsuleCarousel";
scene.add(machine.group);

scene.traverse((object) => {
  if (!object.isMesh) return;
  object.geometry.computeBoundingBox();
  object.geometry.computeBoundingSphere();
});

const exporter = new GLTFExporter();
const binary = await exporter.parseAsync(scene, {
  binary: true,
  onlyVisible: false,
  trs: true,
  includeCustomExtensions: true,
});

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, Buffer.from(binary));

const box = new THREE.Box3().setFromObject(machine.group);
const size = box.getSize(new THREE.Vector3());
console.log(
  JSON.stringify(
    {
      outputPath,
      bytes: binary.byteLength,
      dimensions: {
        width: Number(size.x.toFixed(3)),
        height: Number(size.y.toFixed(3)),
        depth: Number(size.z.toFixed(3)),
      },
    },
    null,
    2,
  ),
);
