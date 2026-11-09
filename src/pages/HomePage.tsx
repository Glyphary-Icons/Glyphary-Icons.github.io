import { CollectionCard } from "../components/CollectionCard";
import { SetCard } from "../components/SetCard";
import { customIconCount, customSets, librarySets, setHref, totalIconCount } from "../data/sets";

const flagship = customSets[0];
const otherCustomSets = customSets.slice(1);
const flagshipShowcase = flagship?.showcase ?? [];

const STEPS = [
  {
    num: "01",
    title: "Browse",
    text: "Open a custom collection or a general library and search every icon by name, instantly.",
  },
  {
    num: "02",
    title: "Recolor",
    text: "Pick a swatch or type any hex value — monochrome icons update live across the grid.",
  },
  {
    num: "03",
    title: "Export",
    text: "Download SVG, render a PNG at 16–512 px, or grab an entire set as a zip.",
  },
];

function scrollToCustomSets() {
  document
    .getElementById("custom-collections")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function HomePage() {
  return (
    <>
      <section className="hero container">
        <p className="eyebrow">Custom icon sets by Glyphary</p>
        <h1 className="hero-title">
          Our own sets.
          <br />
          In <span className="accent-text">your colors</span>.
        </h1>
        <p className="hero-lede">
          Glyphary draws its own pride flag library and curates focused packs for flags,
          developer tools, and communities — {customIconCount.toLocaleString("en-US")} icons across{" "}
          {customSets.length} custom collections. Recolor and export in the browser: no account,
          no upload.
        </p>
        <div className="hero-actions">
          <button type="button" className="button button-primary" onClick={scrollToCustomSets}>
            Explore custom sets
          </button>
          <a className="button button-ghost" href="#/libraries">
            All libraries →
          </a>
        </div>

        <div className="hero-stats">
          <div>
            <strong>{customIconCount.toLocaleString("en-US")}</strong>
            <span>custom icons</span>
          </div>
          <div>
            <strong>{customSets.length}</strong>
            <span>custom collections</span>
          </div>
          <div>
            <strong>{totalIconCount.toLocaleString("en-US")}</strong>
            <span>icons in the catalog</span>
          </div>
        </div>

        {flagshipShowcase.length > 0 && flagship && (
          <div className="hero-ribbon-wrap">
            <div className="hero-ribbon" aria-hidden="true">
              {flagshipShowcase.map((svg, index) => (
                // SVGs come from trusted, pre-normalized manifests (see IconGlyph).
                <span
                  className="hero-ribbon-flag"
                  key={`hero-flag-${index}`}
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              ))}
            </div>
            <a className="hero-ribbon-caption" href={setHref(flagship)}>
              {flagship.name} — {flagship.count} flags, drawn in-house →
            </a>
          </div>
        )}
      </section>

      <section className="container section custom-section" id="custom-collections">
        <div className="section-head">
          <div>
            <p className="eyebrow">Custom icon sets</p>
            <h2>Built for the parts general libraries skip</h2>
            <p className="section-subtitle">
              A first-party pride flag library, plus flags, developer logos, and community packs in
              one consistent grid.
            </p>
          </div>
          <a className="text-link" href="#/libraries">
            All collections →
          </a>
        </div>

        <div className="custom-grid">
          {flagship && (
            <CollectionCard
              set={flagship}
              href={setHref(flagship)}
              featured
              badge="Made by Glyphary"
            />
          )}
          {otherCustomSets.map((set) => (
            <CollectionCard key={set.id} set={set} href={setHref(set)} />
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Open-source libraries</p>
            <h2>General-purpose icon sets</h2>
            <p className="section-subtitle">
              Community libraries for everyday interface work, alongside the custom collections.
            </p>
          </div>
          <a className="text-link" href="#/libraries">
            View all libraries →
          </a>
        </div>
        <div className="sets-grid">
          {librarySets.map((set) => (
            <SetCard key={set.id} set={set} />
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="steps">
          {STEPS.map((step) => (
            <div className="step" key={step.num}>
              <span className="step-num">{step.num}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="cta-band">
          <div>
            <h2>Custom sets, ready to download</h2>
            <p>
              Pride flags, country flags, and developer logos — recolor and export in a click.
              Licenses and credits sit on every set page.
            </p>
          </div>
          {flagship && (
            <a className="button button-primary" href={setHref(flagship)}>
              Open {flagship.name}
            </a>
          )}
        </div>
      </section>
    </>
  );
}
