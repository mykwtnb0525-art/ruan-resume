const clamp01 = (value) => Math.min(1, Math.max(0, value));

function evaluateStep(step, chapter) {
  const progress = chapter[step.progress] || 0;
  const local = clamp01((progress - step.start) / step.duration);
  return step.from + (step.to - step.from) * local;
}

export function applyLightingRig({
  machine,
  chapter,
  config,
  lightingEnabled,
}) {
  const values = new Map();
  const colors = new Map();

  config.machine.lightSequence.forEach((step) => {
    const value = evaluateStep(step, chapter);
    values.set(
      step.target,
      step.blend === "add"
        ? (values.get(step.target) || 0) + value
        : value,
    );
    if (step.color) colors.set(step.target, step.color);
  });

  if (values.has("ivory")) {
    machine.materials.ivory.emissiveIntensity = values.get("ivory");
  }
  if (values.has("wine")) {
    machine.materials.wine.emissiveIntensity = values.get("wine");
  }
  if (values.has("glassTransmission")) {
    machine.materials.glass.transmission = values.get("glassTransmission");
  }
  if (values.has("baseStatus")) {
    machine.materials.baseStatus.emissiveIntensity = values.get("baseStatus");
  }
  if (values.has("trayScan")) {
    machine.materials.trayScan.emissiveIntensity = values.get("trayScan");
  }

  ["statusRed", "statusCyan", "statusGreen"].forEach((target, index) => {
    if (values.has(target) && machine.materials.statusMaterials[index]) {
      machine.materials.statusMaterials[index].emissiveIntensity =
        values.get(target);
    }
  });

  if (colors.has("chamber")) {
    machine.lights.chamberLight.color.set(colors.get("chamber"));
  }
  machine.lights.chamberLight.intensity = lightingEnabled
    ? values.get("chamber") || 0
    : 0;
  machine.lights.trayLight.intensity = lightingEnabled
    ? values.get("trayPoint") || 0
    : 0;
}
