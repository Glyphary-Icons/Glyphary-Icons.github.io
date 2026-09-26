import type { Theme } from "../hooks/useTheme";

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  activePage: "home" | "libraries";
}

export function Header({ theme, onToggleTheme, activePage }: HeaderProps) {
  const nextLabel = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <header className="header">
      <div className="container header-inner">
        <a className="brand" href="#/">
          <svg
            className="brand-mark"
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="currentColor"
            aria-hidden="true"
          >
            <rect x="2.5" y="2.5" width="8.5" height="8.5" rx="2.4" />
            <rect x="13" y="2.5" width="8.5" height="8.5" rx="2.4" opacity="0.35" />
            <rect x="2.5" y="13" width="8.5" height="8.5" rx="2.4" opacity="0.35" />
            <rect x="13" y="13" width="8.5" height="8.5" rx="2.4" />
          </svg>
          <span className="brand-name">Glyphary</span>
        </a>

        <nav className="header-actions" aria-label="Site">
          <a
            className={`header-link${activePage === "home" ? " is-active" : ""}`}
            href="#/"
            aria-current={activePage === "home" ? "page" : undefined}
          >
            Home
          </a>
          <a
            className={`header-link${activePage === "libraries" ? " is-active" : ""}`}
            href="#/libraries"
            aria-current={activePage === "libraries" ? "page" : undefined}
          >
            Libraries
          </a>
          <button
            type="button"
            className="icon-button"
            onClick={onToggleTheme}
            aria-label={nextLabel}
            title={nextLabel}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </nav>
      </div>
    </header>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}
