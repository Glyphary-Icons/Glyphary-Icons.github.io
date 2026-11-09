import { OFFICIAL_LOGOS } from "../data/logos";
import type { SetSummary } from "../types";
import { IconGlyph } from "./IconGlyph";

const FEATURED_TILES = 8;
const TILES = 6;

interface CollectionCardProps {
  set: SetSummary;
  href: string;
  /** Larger art area and typography, used for the flagship collection. */
  featured?: boolean;
  badge?: string;
}

/**
 * Art-forward card for the focused collections. The artwork itself carries the
 * section, so a mosaic of real icons replaces the usual library logo.
 */
export function CollectionCard({ set, href, featured = false, badge }: CollectionCardProps) {
  const tiles = (set.showcase?.length ? set.showcase : set.preview).slice(
    0,
    featured ? FEATURED_TILES : TILES,
  );
  const logo = OFFICIAL_LOGOS[set.id];

  return (
    <a className={`collection-card${featured ? " collection-card-featured" : ""}`} href={href}>
      <div className="collection-card-art">
        {tiles.map((svg, index) => (
          // SVGs come from trusted, pre-normalized manifests (see IconGlyph).
          <span
            className="collection-card-tile"
            key={`${set.id}-tile-${index}`}
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ))}
      </div>
      <div className="collection-card-body">
        <div className="collection-card-heading">
          {logo && (
            <span className={`collection-card-logo collection-card-logo-${set.id}`} aria-hidden="true">
              <IconGlyph svg={logo} size={20} />
            </span>
          )}
          <h3>{set.name}</h3>
          {badge && <span className="badge">{badge}</span>}
        </div>
        <p className="collection-card-description">{set.description}</p>
        <div className="collection-card-meta">
          <span>{set.count.toLocaleString("en-US")} icons</span>
          <span className="chip">{set.license}</span>
        </div>
      </div>
    </a>
  );
}
