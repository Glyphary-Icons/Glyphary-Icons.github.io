import { useEffect, useRef, useState } from "react";
import type { IconEntry, SetSummary } from "../types";
import { applyColor, setSupportsRecolor } from "../lib/color";
import { copySvg, downloadPng, downloadSvg } from "../lib/download";
import { ColorPicker } from "./ColorPicker";
import { IconGlyph } from "./IconGlyph";

const PNG_SIZES = [16, 32, 64, 128, 256, 512];

interface IconPanelProps {
  icon: IconEntry;
  set: SetSummary;
  color: string;
  onColorChange: (color: string) => void;
  onClose: () => void;
}

export function IconPanel({ icon, set, color, onColorChange, onClose }: IconPanelProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [pngSize, setPngSize] = useState(256);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<"svg" | "png" | "copy" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileStem = `${set.id}-${icon.name}${icon.category ? `-${icon.category}` : ""}`;
  const credit = set.attribution && set.sourceUrl
    ? {
        author: set.attribution,
        sourceUrl: set.sourceUrl,
        license: set.license,
        licenseUrl: set.licenseUrl,
      }
    : undefined;

  useEffect(() => {
    dialogRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const run = async (kind: "svg" | "png" | "copy", action: () => void | Promise<void>) => {
    setError(null);
    setBusy(kind);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      className="panel-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="panel"
        role="dialog"
        aria-modal="true"
        aria-label={`${icon.name} — export options`}
        ref={dialogRef}
        tabIndex={-1}
      >
        <button type="button" className="panel-close" onClick={onClose} aria-label="Close">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="panel-preview">
          <div className="panel-preview-stage" style={{ color }}>
            <IconGlyph svg={icon.svg} size={96} />
          </div>
        </div>

        <div className="panel-body">
          <div className="panel-head">
            <div>
              <h2 className="panel-name">{icon.name}</h2>
              <p className="panel-meta">
                {set.name}
                {icon.category ? ` · ${icon.category}` : ""} · {set.license} license
              </p>
            </div>
            {set.sourceUrl && (
              <a
                className="panel-source"
                href={set.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                Source ↗
              </a>
            )}
          </div>            {setSupportsRecolor(set.id) && (
              <ColorPicker value={color} onChange={onColorChange} idPrefix="panel" />
            )}

          <div className="panel-actions">
            <button
              type="button"
              className="button button-primary"
              disabled={busy !== null}
              onClick={() =>
                run("svg", () => downloadSvg(icon.svg, color, `${fileStem}.svg`, credit))
              }
            >
              {busy === "svg" ? "Preparing…" : "Download SVG"}
            </button>

            <button
              type="button"
              className="button"
              disabled={busy !== null}
              onClick={() =>
                run("copy", async () => {
                  await copySvg(icon.svg, color, credit);
                  setCopied(true);
                })
              }
            >
              {copied ? "Copied" : busy === "copy" ? "Copying…" : "Copy SVG"}
            </button>

            <div className="png-group">
              <label className="select-wrap">
                <span className="sr-only">PNG size</span>
                <select
                  value={pngSize}
                  onChange={(event) => setPngSize(Number(event.target.value))}
                  aria-label="PNG size"
                >
                  {PNG_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size} px
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="button"
                disabled={busy !== null}
                onClick={() =>
                  run("png", () =>
                    downloadPng(icon.svg, color, pngSize, `${fileStem}-${pngSize}.png`, credit),
                  )
                }
              >
                {busy === "png" ? "Rendering…" : "Download PNG"}
              </button>
            </div>
          </div>

          {error && (
            <p className="panel-error" role="alert">
              {error}
            </p>
          )}

          <pre className="panel-code">
            <code>{applyColor(icon.svg, color)}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
