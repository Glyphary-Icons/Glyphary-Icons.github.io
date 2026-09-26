import type { KeyboardEvent } from "react";
import type { IconEntry } from "../types";
import { IconGlyph } from "./IconGlyph";

interface IconGridProps {
  icons: IconEntry[];
  color: string;
  onSelect: (icon: IconEntry, trigger: HTMLElement) => void;
}

export function IconGrid({ icons, color, onSelect }: IconGridProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    const grid = event.currentTarget;
    const cells = Array.from(grid.querySelectorAll<HTMLButtonElement>("button.icon-cell"));
    const current = cells.indexOf(document.activeElement as HTMLButtonElement);
    if (current < 0) return;

    const columns =
      getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length || 1;
    let next = current;
    if (event.key === "ArrowLeft") next = current - 1;
    if (event.key === "ArrowRight") next = current + 1;
    if (event.key === "ArrowUp") next = current - columns;
    if (event.key === "ArrowDown") next = current + columns;

    if (next >= 0 && next < cells.length) {
      event.preventDefault();
      cells[next].focus();
    }
  };

  return (
    <div className="icon-grid" onKeyDown={handleKeyDown}>
      {icons.map((icon) => (
        <button
          key={`${icon.category ?? "default"}-${icon.name}`}
          type="button"
          className="icon-cell"
          onClick={(event) => onSelect(icon, event.currentTarget)}
          aria-label={`Open ${icon.name}${icon.category ? ` (${icon.category})` : ""}`}
        >
          <span className="icon-cell-glyph" style={{ color }}>
            <IconGlyph svg={icon.svg} size={26} />
          </span>
          <span className="icon-cell-name">{icon.name}</span>
        </button>
      ))}
    </div>
  );
}
