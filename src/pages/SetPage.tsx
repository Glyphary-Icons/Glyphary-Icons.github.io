import { useEffect, useMemo, useRef, useState } from "react";
import type { IconEntry, IconManifest } from "../types";
import { findSummary, loadManifest } from "../data/sets";
import { ColorPicker } from "../components/ColorPicker";
import { IconGrid } from "../components/IconGrid";
import { IconPanel } from "../components/IconPanel";
import { downloadZip } from "../lib/download";
import { setSupportsRecolor } from "../lib/color";

interface SetPageProps {
  setId: string;
  initialCategory?: string;
  initialQuery?: string;
}

export function SetPage({ setId, initialCategory, initialQuery }: SetPageProps) {
  const summary = findSummary(setId);
  const [manifest, setManifest] = useState<IconManifest | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState(initialQuery ?? "");
  const [category, setCategory] = useState(
    initialCategory === "categories" || initialCategory === "skill-icons"
      ? "all"
      : initialCategory === "skills"
        ? "original"
        : initialCategory ?? "all",
  );
  const [topicMode, setTopicMode] = useState(initialCategory === "categories");
  const [skillMode, setSkillMode] = useState(initialCategory === "skills");
  const [flagMode, setFlagMode] = useState(
    initialCategory === "country-flags" || initialCategory === "circle-flags",
  );
  const [skillIconMode, setSkillIconMode] = useState(initialCategory === "skill-icons");
  const [color, setColor] = useState("inherit");
  const [selected, setSelected] = useState<IconEntry | null>(null);
  const [zipping, setZipping] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!summary) return undefined;
    let alive = true;
    setManifest(null);
    setLoadError(null);
    loadManifest(summary.id)
      .then((loaded) => {
        if (alive) setManifest(loaded);
      })
      .catch((err: unknown) => {
        if (alive) setLoadError(err instanceof Error ? err.message : "Could not load this set.");
      });
    return () => {
      alive = false;
    };
  }, [summary, attempt]);

  const visible = useMemo(() => {
    if (!manifest) return [];
    const needle = query.trim().toLowerCase();
    return manifest.icons.filter((icon) => {
      if (topicMode && icon.category !== "categories") return false;
      if (skillMode && !["original", "plain", "line"].includes(icon.category ?? "")) return false;
      if (flagMode && icon.category !== (setId === "circle-flags" ? "circle-flags" : "country-flags")) return false;
      if (skillIconMode && !["dark", "light", "standard"].includes(icon.category ?? "")) return false;
      if (skillIconMode && category !== "all" && icon.category !== category) return false;
      if (!topicMode && !skillMode && !flagMode && !skillIconMode && category !== "all" && icon.category !== category) return false;
      if (!needle) return true;
      const terms = needle.split(/[\s,]+/).filter(Boolean);
      return terms.every(
        (term) => icon.name.toLowerCase().includes(term) || icon.tags.some((tag) => tag.toLowerCase().includes(term)),
      );
    });
  }, [manifest, query, category, topicMode, skillMode, flagMode, skillIconMode, setId]);

  if (!summary) {
    return (
      <section className="container section">
        <div className="empty-state">
          <h1>Set not found</h1>
          <p>That icon set doesn’t exist on Glyphary.</p>
          <a className="button button-primary" href="#/libraries">
            Back to libraries
          </a>
        </div>
      </section>
    );
  }

  const handleZip = () => {
    if (!manifest) return;
    setZipError(null);
    setZipping(true);
    // Defer so the busy state paints before the (synchronous) zip work runs.
    window.setTimeout(() => {
      try {
        downloadZip(
          manifest.icons.map((icon) => ({
            path: `${icon.category ? `${icon.category}/` : ""}${icon.name}.svg`,
            svg: icon.svg,
          })),
          color,
          `${summary.id}-icons.zip`,
          [
            `${summary.name} — ${manifest.count} icons exported from Glyphary`,
            `License: ${summary.license}${summary.licenseUrl ? ` (${summary.licenseUrl})` : ""}`,
            ...(summary.sourceUrl ? [`Source: ${summary.sourceUrl}`] : []),
            ...(summary.attribution
              ? [
                  `Attribution: ${summary.attribution}`,
                  `Changes: color-adjustable SVGs normalized and recolored by Glyphary (${color === "inherit" ? "currentColor (inherits theme)" : color}).`,
                ]
              : []),
            `Color: ${color === "inherit" ? "currentColor (inherits theme)" : color}`,
            "",
          ].join("\n"),
        );
      } catch (err) {
        setZipError(err instanceof Error ? err.message : "Could not build the zip.");
      } finally {
        setZipping(false);
      }
    }, 30);
  };

  return (
    <>
      <section className="container set-page">
        <a className="back-link" href="#/libraries">
          ← All libraries
        </a>

        <div className="set-head">
          <div className="set-head-main">
            <div className="set-title-row">
              <h1>{summary.name}</h1>
              <span className="chip">{summary.license}</span>
              {summary.categories.length > 1 && (
                <span className="chip">{summary.categories.join(" · ")}</span>
              )}
            </div>
            <p className="set-desc">{summary.description}</p>
            <p className="set-sub">
              {summary.licenseUrl ? (
                <a href={summary.licenseUrl} target="_blank" rel="noreferrer noopener">
                  {summary.license} license ↗
                </a>
              ) : (
                <span>{summary.license}</span>
              )}
              {summary.attribution && summary.sourceUrl && (
                <>
                  <span aria-hidden="true">·</span>
                  <a href={summary.sourceUrl} target="_blank" rel="noreferrer noopener">
                    Icons by {summary.attribution} ↗
                  </a>
                </>
              )}
              {summary.sourceUrl && (
                <>
                  <span aria-hidden="true">·</span>
                  <a href={summary.sourceUrl} target="_blank" rel="noreferrer noopener">
                    Project site ↗
                  </a>
                </>
              )}
            </p>
          </div>
          <div className="set-head-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={handleZip}
              disabled={!manifest || zipping}
            >
              {zipping ? "Packing…" : "Download set (.zip)"}
            </button>
            <span className="hint">
              {setSupportsRecolor(summary.id) ? `${color === "inherit" ? "theme color" : color} · ` : ""}
              {summary.count.toLocaleString("en-US")} SVGs
            </span>
          </div>
        </div>

        {zipError && (
          <p className="panel-error" role="alert">
            {zipError}
          </p>
        )}

        <div className="toolbar">
          <div className="search-wrap">
            <SearchIcon />
            <input
              className="search-input"
              type="search"
              placeholder={`Search ${["Flag Icons", "Circle Flags"].includes(summary.name) ? "by country or code" : summary.count.toLocaleString("en-US")}…`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search icons"
            />
          </div>

          {(summary.filterCategories ?? summary.categories).length > 1 && !skillMode && !flagMode && !skillIconMode && !topicMode && (
            <div className="chips" role="group" aria-label="Icon category filter">
              {["all", ...(summary.filterCategories ?? summary.categories)].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`chip chip-button${category === option ? " is-active" : ""}`}
                  onClick={() => {
                    setCategory(option);
                    setTopicMode(false);
                    setSkillMode(false);
                    setFlagMode(false);
                    setSkillIconMode(false);
                  }}
                  aria-pressed={category === option}
                >
                  {option === "all" ? "All types" : option}
                </button>
              ))}
            </div>
          )}

          {setSupportsRecolor(summary.id) && (
            <ColorPicker value={color} onChange={setColor} idPrefix="toolbar" />
          )}
        </div>

        {skillIconMode && manifest && (
          <div className="topic-categories" aria-label="Skill icon theme filter">
            {["all", "dark", "light", "standard"].map((variant) => (
              <button
                className={`chip chip-button${category === variant ? " is-active" : ""}`}
                key={variant}
                type="button"
                onClick={() => {
                  setCategory(variant);
                  setQuery("");
                }}
              >                {variant === "all" ? "All themes" : variant}
              </button>
            ))}
          </div>
        )}

        {skillMode && manifest && (
          <div className="topic-categories" aria-label="Developer icon variants">
            {["original", "plain", "line"].map((variant) => (
              <button
                className={`chip chip-button${category === variant ? " is-active" : ""}`}
                key={variant}
                type="button"
                onClick={() => {
                  setCategory(variant);
                  setQuery("");
                }}
              >
                {variant}
              </button>
            ))}
          </div>
        )}

        {topicMode && manifest && (
          <div className="topic-categories" aria-label="Topic illustration categories">
            {(summary.browseCategories ?? []).map((topic) => (
              <button
                className={`chip chip-button${query === topic.replaceAll("-", " ") ? " is-active" : ""}`}
                key={topic}
                type="button"
                onClick={() => {
                  setCategory("all");
                  setTopicMode(true);
                  setSkillMode(false);
                  setFlagMode(false);
                  setSkillIconMode(false);
                  setQuery(topic.replaceAll("-", " "));
                }}
              >
                {topic.replaceAll("-", " ")}
              </button>
            ))}
          </div>
        )}

        <p className="results-note">
          {manifest
            ? `${visible.length.toLocaleString("en-US")} of ${manifest.count.toLocaleString("en-US")} icons`
            : "Loading set…"}
        </p>

        {!manifest && !loadError && <SkeletonGrid />}

        {loadError && (
          <div className="empty-state">
            <p>{loadError}</p>
            <button type="button" className="button" onClick={() => setAttempt((n) => n + 1)}>
              Try again
            </button>
          </div>
        )}

        {manifest && visible.length === 0 && (
          <div className="empty-state">
            <p>
              No icons match <strong>“{query}”</strong>
              {topicMode
                ? " in topic illustrations"
                : skillMode
                  ? ` in ${category}`
                  : flagMode
                    ? ` in ${setId === "circle-flags" ? "circle flags" : "country flags"}`
                    : skillIconMode && category !== "all"
                      ? ` in ${category} skill icons`
                      : category !== "all"
                      ? ` in ${category}`
                      : ""}.
            </p>
            <button
              type="button"
              className="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
                setTopicMode(false);
                setSkillMode(false);
                setFlagMode(false);
                setSkillIconMode(false);
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        {manifest && visible.length > 0 && (
          <IconGrid
            icons={visible}
            color={color}
            onSelect={(icon, trigger) => {
              restoreFocusRef.current = trigger;
              setSelected(icon);
            }}
          />
        )}
      </section>

      {selected && (
        <IconPanel
          icon={selected}
          set={summary}
          color={color}
          onColorChange={setColor}
          onClose={() => {
            setSelected(null);
            restoreFocusRef.current?.focus();
          }}
        />
      )}
    </>
  );
}

function SkeletonGrid() {
  return (
    <div className="icon-grid" aria-hidden="true">
      {Array.from({ length: 18 }, (_, index) => (
        <div className="skeleton-cell" key={index} />
      ))}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      className="search-icon"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </svg>
  );
}
