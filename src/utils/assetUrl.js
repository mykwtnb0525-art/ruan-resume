const viteBase = import.meta.env?.BASE_URL || "/ruan-resume/";

export function assetUrl(path) {
  return `${viteBase}${String(path).replace(/^\/+/, "")}`;
}

export const archivePaperTexture = `url("${assetUrl(
  "assets/archive-paper-bg.png",
)}")`;
