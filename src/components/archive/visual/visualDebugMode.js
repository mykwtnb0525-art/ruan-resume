export const VISUAL_DEBUG_MODES = Object.freeze({
  MODEL: "MODEL",
  MATERIAL: "MATERIAL",
  FINAL: "FINAL",
});

const VALID_MODES = new Set(Object.values(VISUAL_DEBUG_MODES));

export function resolveVisualDebugMode() {
  if (!import.meta.env.DEV || typeof window === "undefined") {
    return VISUAL_DEBUG_MODES.FINAL;
  }

  const params = new URLSearchParams(window.location.search);
  const requested = (params.get("visualDebug") || "FINAL").toUpperCase();
  return VALID_MODES.has(requested)
    ? requested
    : VISUAL_DEBUG_MODES.FINAL;
}
