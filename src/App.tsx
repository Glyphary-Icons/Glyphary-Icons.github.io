import { Header } from "./components/Header";
import { useRoute } from "./hooks/useHashRoute";
import { useTheme } from "./hooks/useTheme";
import { HomePage } from "./pages/HomePage";
import { LibrariesPage } from "./pages/LibrariesPage";
import { SetPage } from "./pages/SetPage";

export default function App() {
  const route = useRoute();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        activePage={route.page === "set" ? "libraries" : route.page}
      />

      <main className="main">
        {route.page === "set" ? (
          <SetPage
            key={`${route.setId}:${route.category ?? "all"}:${route.query ?? ""}`}
            setId={route.setId}
            initialCategory={route.category}
            initialQuery={route.query}
          />
        ) : route.page === "libraries" ? (
          <LibrariesPage />
        ) : (
          <HomePage />
        )}
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <p>
            Every icon set is open source — licenses are credited on each set page. Names and
            marks belong to their respective authors.
          </p>            <p className="footer-note">
            Glyphary runs entirely in your browser. No accounts, no tracking, no uploads.
          </p>
        </div>
      </footer>
    </div>
  );
}
