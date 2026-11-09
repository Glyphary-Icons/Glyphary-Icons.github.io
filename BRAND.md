# Glyphary brand guidelines

Glyphary is an icon library. The brand borrows its visual language from the artwork it
ships, so everything below is drawn with the same **monoline stroke** the icons use: one
uniform weight, round caps, round joins, no fills.

## Mark

The mark is a geometric **G**: a circular ring opened at the upper right, closed by a
horizontal bar that reaches into the centre of the bowl.

| Property | Value |
| --- | --- |
| Canvas | `24 × 24` |
| Ring centre | `12, 12` |
| Ring radius | `9.6` |
| Ring opening | `52°`, ending at `308°` |
| Bar | from the right edge (`21.6, 12`) to `9.6, 12` |
| Stroke | `2.4`, round cap/join |
| Colour | `currentColor`, tinted with the accent (`--accent`) |

The mark inherits colour, so it works on light and dark surfaces without a second file.
It reads down to 16px; below that use the app icon rather than the bare mark.

## Wordmark

The wordmark is **bespoke lettering**, not a typeface you can type with. It was drawn
against the same grid as the mark so the two never drift apart.

| Property | Value |
| --- | --- |
| Cap height | `30` |
| x-height | `10` |
| Baseline | `30` |
| Descender | `38` |
| Stroke | `2.8`, round cap/join |
| Tracking | `2.4` |
| Bowls | true circles, `r 9.4`, centre `y 19.4` |
| Ascender | `l`, `h` reach `y 0` |
| Descenders | `p` `y 38`, `y` `y 38` |

Letterforms are single-story and geometric: `a` is a circle with a right stem, `r` is a
stem with a short shoulder, `y` is two straight diagonals. Never re-set the name in a
system font where the wordmark belongs — the lettering is the identity.

## Lockup and header usage

Mark + wordmark, mark scaled `30 / 24` so its G matches the cap height, separated by `11`
units. Total canvas is `216.2 × 38` for the name as it stands.

The site header shows the **wordmark alone**. The mark is itself a G, so pairing it with a
wordmark that also opens with G doubles the letter and reads as two logos. The mark is
reserved for the app icon, favicon, and standalone glyph placements; the lockup is only for
surfaces where the mark clearly registers as an icon next to the name, such as a wide
social card.

## Typeface

Two roles, deliberately split:

- **Display / brand voice — Space Grotesk.** Used for headings and brand-adjacent type.
  Self-hosted latin subset (variable `300–700`) at `public/fonts/space-grotesk-latin.woff2`
  via `--font-brand`. Chosen because its geometric skeleton and quirky terminals sit
  comfortably beside the monoline wordmark. Licensed under the SIL Open Font License 1.1
  (`public/fonts/OFL.txt`); no third-party font request is made at runtime.
- **UI text — system sans** (`--font-sans`). Body copy stays on the platform face for
  fidelity, speed, and because a document about icons should not compete with its subject.

Monospaced numbers, code, and hex values use `--font-mono`.

## Colour

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--accent` | `#2f54c9` | `#8aa4ff` | mark, lockup, primary actions |
| `--fg` | `#16161a` | `#f2f2f0` | text |
| `--bg` | `#fbfbfa` | `#0e0e11` | page |

The accent is a single blue on purpose: the product displays every colour in the
spectrum, so the brand itself stays out of the way.

## Clear space and minimum sizes

- Clear space on all sides: **25% of the mark height** (`6` units on the 24 grid).
- Minimum mark: **16px**. Minimum lockup height: **18px** (≈ 103px wide).
- Minimum wordmark width alone: **72px**.

## Do

- Use `currentColor` and let the accent token drive the colour.
- Place the lockup on flat, quiet surfaces.
- Rebuild assets from the geometry above if the name ever changes.

## Don't

- Don't add gradients, shadows, outlines, or a second weight.
- Don't rotate, skew, or stretch the mark; don't re-space the wordmark by hand.
- Don't recolour the mark outside the palette, or place it on busy imagery.
- Don't set "Glyphary" in Space Grotesk as a substitute for the wordmark.

## Files

| Path | What it is |
| --- | --- |
| `src/brand/glyphary-mark.svg` | mark, monochrome, `currentColor` |
| `src/brand/glyphary-wordmark.svg` | bespoke wordmark |
| `src/brand/glyphary-lockup.svg` | horizontal lockup (wide placements, not the header) |
| `public/favicon.svg` | app icon / favicon: white G on an accent tile |
| `public/fonts/space-grotesk-latin.woff2` | brand typeface, latin subset |
