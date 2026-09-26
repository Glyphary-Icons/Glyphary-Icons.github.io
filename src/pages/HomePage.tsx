import { SetCard } from "../components/SetCard";
import { summaries } from "../data/sets";

const totalIcons = summaries.reduce((sum, set) => sum + set.count, 0);
const featured = summaries[0];

const STEPS = [
  {
    num: "01",
    title: "Browse",
    text: "Open a set and search a few thousand icons by name, instantly.",
  },
  {
    num: "02",
    title: "Recolor",
    text: "Pick a swatch or type any hex value — the whole grid updates live.",
  },
  {
    num: "03",
    title: "Export",
    text: "Download SVG, render a PNG at 16–512 px, or grab the entire set as a zip.",
  },
];

export function HomePage() {
  return (
    <>
      <section className="hero container">
        <p className="eyebrow">Open-source SVG icon sets</p>
        <h1 className="hero-title">
          Find the icon.
          <br />
          Take it in <span className="accent-text">any color</span>.
        </h1>
        <p className="hero-lede">
          Browse {totalIcons.toLocaleString("en-US")} icons across {summaries.length} curated
          libraries, recolor them instantly, and export clean SVG or crisp PNG. No account, no
          upload — everything happens in your browser.
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="#/libraries">
            Browse libraries
          </a>
          <a className="button button-ghost" href={`#/set/${featured.id}`}>
            Open {featured.name} →
          </a>
        </div>
      </section>

      <section className="container section" id="icon-sets">
        <div className="section-head">
          <div>
            <h2>Popular icon sets</h2>
            <p className="section-subtitle">Versatile libraries for everyday interface work.</p>
          </div>
          <a className="text-link" href="#/libraries">
            View all libraries →
          </a>
        </div>
        <div className="sets-grid">
          {summaries
            .filter((set) => !["pixel-icon-library", "devicon", "flag-icons", "circle-flags", "skill-icons", "pride-flags"].includes(set.id))
            .map((set) => (
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
            <h2>Grab your icons</h2>
            <p>Every set is open source. Credit is a click away on each set page.</p>
          </div>
          <a className="button button-primary" href={`#/set/${featured.id}`}>
            Start with {featured.name}
          </a>
        </div>
      </section>
    </>
  );
}
