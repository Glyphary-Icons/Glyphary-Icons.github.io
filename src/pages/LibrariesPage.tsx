import { useMemo, useState } from "react";
import { summaries } from "../data/sets";
import type { SetSummary } from "../types";
import { IconGlyph } from "../components/IconGlyph";
import phosphorLogo from "@phosphor-icons/core/assets/regular/phosphor-logo.svg?raw";
import deviconLogo from "devicon/icons/devicon/devicon-original.svg?raw";
import circleFlagsLogo from "circle-flags/logo.svg?raw";

const OFFICIAL_LOGOS: Record<string, string> = {
  phosphor: phosphorLogo,
  devicon: deviconLogo,
  "circle-flags": circleFlagsLogo,
};

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

function categoryRoute(set: SetSummary): string | undefined {
  if (set.id === "devicon") return "skills";
  if (set.id === "flag-icons") return "country-flags";
  if (set.id === "circle-flags") return "circle-flags";
  if (set.id === "skill-icons") return "skill-icons";
  return undefined;
}

function countDescription(set: SetSummary): string {
  if (set.id === "devicon") return "Programming languages & tools";
  if (set.id === "flag-icons") return "Countries & territories";
  if (set.id === "circle-flags") return "Circular country & region flags";
  if (set.id === "skill-icons") return "Programming & technology";
  if (set.id === "pride-flags") return "Community pride flags";
  return `${set.count.toLocaleString("en-US")} icons`;
}

function brandInitials(name: string): string {
  return name.split(/\\s+/).map((word) => word[0]).slice(0, 2).join("").toUpperCase();
}

function matchesSearch(query: string, ...values: string[]): boolean {
  return !query || values.some((value) => value.toLowerCase().includes(query));
}

function SearchIcon() {
  return (
    <svg className="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </svg>
  );
}

function LibraryCard({ set, specialty = false }: { set: SetSummary; specialty?: boolean }) {
  const previews = cardPreviews(set);
  const logo = OFFICIAL_LOGOS[set.id];
  const category = categoryRoute(set);
  const href = `#/set/${set.id}${category ? `/${category}` : ""}`;
  const countLabel = countDescription(set);

  return (
    <a className={`library-card${specialty ? " library-card-specialty" : ""}`} href={href}>
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

const SPECIALTY_IDS = new Set(["devicon", "flag-icons", "circle-flags", "skill-icons", "pride-flags"]);

export function LibrariesPage() {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const mainLibraries = useMemo(
    () =>
      summaries.filter(
        (set) => !SPECIALTY_IDS.has(set.id) && matchesSearch(needle, set.name, set.description),
      ),
    [needle],
  );
  const specialtyLibraries = useMemo(
    () => summaries.filter((set) => SPECIALTY_IDS.has(set.id) && matchesSearch(needle, set.name, set.description)),
    [needle],
  );

  return (
    <section className="container libraries-page">
      <div className="library-intro">
        <p className="eyebrow">Browse the collection</p>
        <h1>Icon libraries</h1>
        <p>
          Browse versatile, all-in-one icon sets first. Developer skill logos, country flags, and the
          community pride flag collection live in their own specialty section.
        </p>
        <div className="library-search-wrap">
          <SearchIcon />
          <input
            className="search-input"
            type="search"
            placeholder="Search libraries…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search icon libraries"
          />
        </div>
      </div>

      {mainLibraries.length > 0 && (
        <section className="library-group" aria-labelledby="main-libraries-heading">
          <div className="library-group-head">
            <div>
              <h2 id="main-libraries-heading">Main libraries</h2>
              <p>All-in-one collections for everyday interface and product design.</p>
            </div>
            <span className="section-note">{mainLibraries.length} libraries</span>
          </div>
          <div className="library-cards">
            {mainLibraries.map((set) => (
              <LibraryCard key={set.id} set={set} />
            ))}
          </div>
        </section>
      )}

      {specialtyLibraries.length > 0 && (
        <section className="library-group specialty-library-group" aria-labelledby="specialty-libraries-heading">
          <div className="library-group-head">
            <div>
              <p className="eyebrow">Separate, focused collections</p>
              <h2 id="specialty-libraries-heading">Specialty libraries</h2>
              <p>Purpose-built collections that don’t belong in the general icon sets.</p>
            </div>
            <span className="section-note">{specialtyLibraries.length} libraries</span>
          </div>
          <div className="library-cards">
            {specialtyLibraries.map((set) => (
              <LibraryCard key={set.id} set={set} specialty />
            ))}
          </div>
        </section>
      )}

      {mainLibraries.length === 0 && specialtyLibraries.length === 0 && (
        <div className="empty-state">
          <p>No libraries match “{query}”.</p>
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
