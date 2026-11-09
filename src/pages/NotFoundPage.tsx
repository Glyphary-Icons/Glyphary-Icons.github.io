interface NotFoundPageProps {
  path: string;
}

/** Rendered for any hash route the app does not recognise. */
export function NotFoundPage({ path }: NotFoundPageProps) {
  return (
    <section className="container section">
      <div className="empty-state">
        <p className="eyebrow">Error 404</p>
        <h1>Page not found</h1>
        <p>
          Nothing lives at <span className="hint">{path}</span>. The link may be out of date, or the
          collection may have been renamed.
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="#/">
            Back to Glyphary
          </a>
          <a className="button" href="#/libraries">
            Browse libraries
          </a>
        </div>
      </div>
    </section>
  );
}
