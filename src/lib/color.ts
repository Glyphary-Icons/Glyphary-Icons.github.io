export const INHERIT = "inherit";

const RECOLORABLE_SET_IDS = new Set([
  "feather",
  "lucide",
  "heroicons",
  "bootstrap-icons",
  "phosphor",
  "pixel-icon-library",
]);

/** True only when every icon in a set uses the app's currentColor paint. */
export function setSupportsRecolor(setId: string): boolean {
  return RECOLORABLE_SET_IDS.has(setId);
}

export const PRESET_COLORS = [
  "#141418",
  "#ffffff",
  "#e5484d",
  "#f5a623",
  "#22a06b",
  "#2f54c9",
  "#8e4ec6",
] as const;

/** Inline the chosen color, or leave `currentColor` intact for theme inheritance. */
export function applyColor(svg: string, color: string): string {
  if (color === INHERIT) return svg;
  return svg.split("currentColor").join(color);
}

/** Resolve "inherit" against the live theme foreground (used for raster export). */
export function themeForeground(): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--fg")
    .trim();
  return value || "#141418";
}

export function normalizeHex(input: string): string | null {
  const text = input.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(text)) return text.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(text)) {
    const [r, g, b] = text.slice(1).split("");
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return null;
}
