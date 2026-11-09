import type { SetSummary } from "../types";
import { CategoryPills } from "./CategoryPills";
import { IconGlyph } from "./IconGlyph";

export function SetCard({ set }: { set: SetSummary }) {
  return (
    <a className="set-card" href={`#/set/${set.id}`}>
      <div className="set-card-preview">
        {set.preview.map((svg, index) => (
          <IconGlyph key={index} svg={svg} size={26} />
        ))}
      </div>
      <div className="set-card-title">
        <h3>{set.name}</h3>
        <span className="set-card-count">{set.count.toLocaleString("en-US")}</span>
      </div>
      <p className="set-card-desc">{set.description}</p>
      <div className="set-card-meta">
        <span className="chip">{set.style === "stroke" ? "Stroke" : "Solid"}</span>
        <CategoryPills categories={set.categories} />
        <span className="chip chip-muted">{set.license}</span>
      </div>
    </a>
  );
}
