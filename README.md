# Glyphary

A minimal light/dark website for browsing open-source SVG icon sets and downloading
individual icons or whole sets in custom colors, as SVG or PNG.

Everything runs client-side — no backend, no database, no accounts, no analytics.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server (binds `0.0.0.0`, reads `PORT`) |
| `npm run build` | Production build to `dist/` |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm run manifests` | Regenerate manifests (sets `PRIDE_FLAGS_DIR` to refresh Pride Flags) |

## How it works

- `scripts/build-manifests.mjs` reads third-party icon packages from `node_modules`
  (Feather, Lucide, Heroicons, Bootstrap Icons, Phosphor, Devicon, Flag Icons, Circle Flags,
  Skill Icons, and HackerNoon's Pixel Icon Library), plus the separately maintained Glyphary Pride
  Flags repository. It normalizes SVGs as needed and writes one JSON manifest per set into
  `public/manifests/`. Each set is fetched lazily on its own route. The pride collection source is
  checked out separately by the manual manifest-refresh workflow.
- `src/data/summaries.json` holds the small card metadata rendered on the home page.
- Recoloring is a `currentColor` substitution; SVG export keeps `currentColor` when the
  "theme color" option is selected, PNG export rasterizes through a canvas at 16–512 px,
  and whole-set downloads are zipped in the browser with `fflate`.
- Light/dark theming is CSS custom properties on `[data-theme]`, seeded by an inline
  script in `index.html` (no theme flash) and persisted in `localStorage`.

## GitHub automation

- `.github/workflows/deploy-pages.yml` builds the site and deploys it to GitHub Pages on pushes to `main` or manual runs. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.
- `.github/workflows/rebuild-manifests.yml` can be run manually from the Actions tab. It checks out the separate pride flag repository, regenerates manifests and summaries, then opens a pull request for review. It does not commit refreshed manifest data directly to `main`.

## Adding an icon set

1. `npm i -D <icon-package>`.
2. Add a entry to the `SETS` array in `scripts/build-manifests.mjs`.
3. `npm run manifests`.

## Attribution

Glyphary Pride Flags are independently authored SVG compositions maintained in the
[separate pride-flag-icons repository](https://github.com/Glyphary-Icons/pride-flag-icons).
Community flag concepts and names are not claimed as Glyphary property, and color conventions may
vary. The collection's license is included in that repository. The Pixel Icon Library SVGs are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
and require attribution to HackerNoon, a link to the license, and an indication of changes.
Glyphary's exports carry attribution in SVG metadata and PNG text metadata; whole-set zip
downloads include a credit and license note in their README. SVGs are normalized for `currentColor`
recoloring, and exports report that modification.
