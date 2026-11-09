import { useMemo, useState } from "react";
import { customSets, librarySets, setHref } from "../data/sets";
import type { SetSummary } from "../types";
import { IconGlyph } from "../components/IconGlyph";
import { CollectionCard } from "../components/CollectionCard";
import { OFFICIAL_LOGOS } from "../data/logos";

const PREVIEW_COUNT = 6;
const MONOCHROME_LOGO_CATEGORIES: Record<string, string> = {
  devicon: "plain",
  phosphor: "regular",
};

function cardPreviews(set: SetSummary): string[] {
  const logoCategory = MONOCHROME_LOGO_CATEGORIES[set.id];
  if (logoCategory && set.categoryPreviews?.[logoCategory]) {
    return [set.categoryPreviews[logoCategory], ...set.preview]
      .filter((svg, index, all) => all.indexOf(svg) === index)
      .slice(0, PREVIEW_COUNT);
  }
  return set.preview.slice(0, PREVIEW_COUNT);
}

/** Secondary line for a card: what the library actually contains, never a repeat of the count. */
function countDescription(set: SetSummary): string {
  if (set.id === "devicon") return "Programming languages & tools";
  if (set.id === "flag-icons") return "Countries & territories";
  if (set.id === "circle-flags") return "Circular country & region flags";
  if (set.id === "skill-icons") return "Programming & technology";
  if (set.id === "pride-flags") return "Community pride flags";
  return set.style === "stroke" ? "Stroke icons" : "Solid icons";
}

function brandInitials(name: string): string {
  return name.split(/\s+/).map((word) => word[0]).slice(0, 2).join("").toUpperCase();
}

function matchesSearch(query: string, ...values: string[]): boolean {
  return !query || values.some((value) => value.toLowerCase().includes(query));
}

function matchesSet(query: string, set: SetSummary): boolean {
  return matchesSearch(query, set.name, set.description, ...set.categories);
}

function SearchIcon() {
  return (
    <svg className="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </svg>
  );
}

function LibraryCard({ set }: { set: SetSummary }) {
  const previews = cardPreviews(set);
  const logo = OFFICIAL_LOGOS[set.id];
  const countLabel = countDescription(set);

  return (
    <a className="library-card" href={setHref(set)}>
      <div className="library-card-heading">
        {logo ? (
          <span className={`library-card-logo library-card-logo-${set.id}`}>
            <IconGlyph svg={logo} size={30} />
          </span>
        ) : (
          <span className="library-card-monogram" aria-hidden="true">{brandInitials(set.name)}</span>
        )}
        <h3>{set.name}</h3>
      </div>
      <p className="library-card-description">{set.description}</p>
      <div className="library-card-meta">
        <span>{set.count.toLocaleString("en-US")} · {countLabel}</span>
        <span className="chip">{set.license}</span>
      </div>
      <div className="library-card-preview-row" aria-label={`${set.name} icon previews`}>
        {previews.map((svg, index) => (
          <span className="library-card-preview-icon" key={`${set.id}-preview-${index}`}>
            <IconGlyph svg={svg} size={23} />
          </span>
        ))}
      </div>
    </a>
  );
}

export function LibrariesPage() {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const custom = useMemo(
    () => customSets.filter((set) => matchesSet(needle, set)),
    [needle],
  );
  const libraries = useMemo(
    () => librarySets.filter((set) => matchesSet(needle, set)),
    [needle],
  );
  const totalSets = customSets.length + librarySets.length;

  return (
    <section className="container libraries-page">
      <div className="library-intro">
        <p className="eyebrow">The whole collection</p>
        <h1>Custom icon sets & libraries</h1>
        <p>
          Glyphary's own pride flag library and the focused custom collections come first.
          General-purpose icon libraries follow, so everything is one search away.
        </p>
        <div className="library-search-wrap">
          <SearchIcon />
          <input
            className="search-input"
            type="search"
            placeholder="Search by name, style, or category…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape" && query) {
                event.preventDefault();
                setQuery("");
              }
            }}
            aria-label="Search icon libraries"
          />
        </div>
        {needle && (
          <p className="library-result-note" role="status">
            {custom.length + libraries.length} of {totalSets} collections match “{query.trim()}”.
          </p>
        )}
      </div>

      {custom.length > 0 && (
        <section className="library-group custom-library-group" aria-labelledby="custom-sets-heading">
          <div className="library-group-head">
            <div>
              <p className="eyebrow">Made by Glyphary &amp; focused packs</p>
              <h2 id="custom-sets-heading">Custom icon sets</h2>
              <p>Pride flags drawn in-house, plus flags, developer logos, and community packs.</p>
            </div>
            <span className="section-note">{custom.length} collections</span>
          </div>
          <div className="custom-grid">
            {custom.map((set, index) => (
              <CollectionCard
                key={set.id}
                set={set}
                href={setHref(set)}
                featured={index === 0}
                badge={index === 0 ? "Made by Glyphary" : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {libraries.length > 0 && (
        <section className="library-group" aria-labelledby="main-libraries-heading">
          <div className="library-group-head">
            <div>
              <p className="eyebrow">Community-maintained</p>
              <h2 id="main-libraries-heading">Open-source libraries</h2>
              <p>All-in-one collections for everyday interface and product design.</p>
            </div>
            <span className="section-note">{libraries.length} libraries</span>
          </div>
          <div className="library-cards">
            {libraries.map((set) => (
              <LibraryCard key={set.id} set={set} />
            ))}
          </div>
        </section>
      )}

      {custom.length === 0 && libraries.length === 0 && (
        <div className="empty-state">
          <p>No libraries match “{query}”.</p>
          <p className="empty-state-hint">Try “flags”, “stroke”, or “developer”.</p>
          <button type="button" className="button" onClick={() => setQuery("")}>
            Clear search
          </button>
        </div>
      )}

      <div className="library-footer-note">
        <span>Everything runs in your browser.</span>
        <span>Licenses and attributions are shown with each library.</span>
      </div>
    </section>
  );
}
