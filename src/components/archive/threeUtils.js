import * as THREE from "three";

export function createRoundedBoxGeometry(width, height, depth, radius = 0.16) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(
    x + width,
    y + height,
    x + width - r,
    y + height,
  );
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.035,
    bevelThickness: 0.035,
    curveSegments: 8,
  });
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();
  return geometry;
}

export function createTextTexture(lines, options = {}) {
  const {
    background = "#ded1bb",
    color = "#251f1c",
    accent = "#9f1e2d",
    width = 512,
    height = 256,
  } = options;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  context.fillStyle = background;
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "rgba(33,29,27,.35)";
  context.lineWidth = 5;
  context.strokeRect(14, 14, width - 28, height - 28);
  context.fillStyle = accent;
  context.fillRect(30, 30, 12, height - 60);
  context.fillStyle = color;
  context.font = "700 34px monospace";
  context.fillText(lines[0], 68, 78);
  context.font = "21px monospace";
  lines.slice(1).forEach((line, index) => {
    context.fillText(line, 68, 122 + index * 38);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 2;
  return texture;
}

export function disposeObject(root) {
  root.traverse((object) => {
    object.geometry?.dispose();
    if (!object.material) return;
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    materials.forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value?.isTexture) value.dispose();
      });
      material.dispose();
    });
  });
}
