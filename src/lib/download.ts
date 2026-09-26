import { strToU8, zipSync } from "fflate";
import { applyColor, themeForeground } from "./color";

export interface Attribution {
  author: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
}

function svgWithCredit(svg: string, color: string, credit?: Attribution): string {
  const recolored = applyColor(svg, color);
  if (!credit) return recolored;
  const details = [
    `${credit.author} icon, from ${credit.sourceUrl}.`,
    `Licensed under ${credit.license}: ${credit.licenseUrl}.`,
    "SVG normalized and recolored by Glyphary.",
  ].join(" ");
  const safe = details.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return recolored.replace(/(<svg\b[^>]*>)/, `$1<metadata>${safe}</metadata>`);
}

function triggerDownload(url: string, filename: string): void {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function downloadSvg(
  svg: string,
  color: string,
  filename: string,
  credit?: Attribution,
): void {
  const blob = new Blob([svgWithCredit(svg, color, credit)], {
    type: "image/svg+xml;charset=utf-8",
  });
  triggerDownload(URL.createObjectURL(blob), filename);
}

export async function downloadPng(
  svg: string,
  color: string,
  size: number,
  filename: string,
  credit?: Attribution,
): Promise<void> {
  // Standalone SVG has no theme, so resolve "inherit" to the current foreground.
  const resolved = color === "inherit" ? themeForeground() : color;
  const credited = svgWithCredit(svg, resolved, credit);
  const markup = credited
    .replace("<svg ", `<svg width="${size}" height="${size}" `)
    .replace("<svg>", `<svg width="${size}" height="${size}">`);

  const sourceUrl = URL.createObjectURL(
    new Blob([markup], { type: "image/svg+xml;charset=utf-8" }),
  );

  try {
    const image = await loadImage(sourceUrl);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable in this browser.");
    ctx.drawImage(image, 0, 0, size, size);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) throw new Error("PNG encoding failed.");
    const finalBlob = credit ? await addPngAttribution(blob, credit) : blob;
    triggerDownload(URL.createObjectURL(finalBlob), filename);
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

export function downloadZip(
  files: { path: string; svg: string }[],
  color: string,
  filename: string,
  readme: string,
): void {
  const entries: Record<string, Uint8Array> = { "README.txt": strToU8(readme) };
  for (const file of files) {
    entries[file.path] = strToU8(applyColor(file.svg, color));
  }
  const zipped = zipSync(entries, { level: 6 });
  const blob = new Blob([zipped as unknown as BlobPart], {
    type: "application/zip",
  });
  triggerDownload(URL.createObjectURL(blob), filename);
}

export async function copySvg(
  svg: string,
  color: string,
  credit?: Attribution,
): Promise<void> {
  const text = svgWithCredit(svg, color, credit);
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  if (!ok) throw new Error("Copy failed.");
}

async function addPngAttribution(blob: Blob, credit: Attribution): Promise<Blob> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  // PNG layout: signature (8), then IHDR (25 bytes). Insert tEXt after IHDR.
  const insertAt = 33;
  if (bytes.length < insertAt || bytes[1] !== 80 || bytes[2] !== 78 || bytes[3] !== 71) {
    return blob;
  }
  const text = new TextEncoder().encode(
    `Attribution\u0000${credit.author} icon from ${credit.sourceUrl}. ${credit.license}: ${credit.licenseUrl}. Recolored by Glyphary.`,
  );
  const chunk = new Uint8Array(12 + text.length);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, text.length, false);
  chunk.set([116, 69, 88, 116], 4); // tEXt
  chunk.set(text, 8);
  view.setUint32(8 + text.length, pngCrc32(chunk.subarray(4, 8 + text.length)), false);
  const result = new Uint8Array(bytes.length + chunk.length);
  result.set(bytes.subarray(0, insertAt), 0);
  result.set(chunk, insertAt);
  result.set(bytes.subarray(insertAt), insertAt + chunk.length);
  return new Blob([result], { type: "image/png" });
}

function pngCrc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not render the SVG."));
    image.src = src;
  });
}
