# Fonts

Clickazo uses three families, all currently loaded from **Google Fonts** via the `@import` at the top of `../colors_and_type.css`. None require substitution — they're the real brand fonts.

| Role | Family | Weights used | Where |
|---|---|---|---|
| `--font-sans` | **Outfit** | 300–900 (variable) | Everything by default. h1 = 800, headings 700, body 400. |
| `--font-mono` | **JetBrains Mono** | 400–800 | Prices, SKUs, the uppercase eyebrow label, spec tables, technical detail. |
| `--font-serif` | **Instrument Serif** | 400 (+ italic) | Editorial accent only — big drop headlines, pull-quotes. Never body/UI. |

## For production

Replace the Google Fonts `@import` with self-hosted `.woff2` files for performance and offline use:

1. Download the families (e.g. from Google Webfonts Helper or the Google Fonts download).
2. Drop the `.woff2` files in this folder.
3. Swap the `@import` line in `colors_and_type.css` for `@font-face` blocks pointing at `fonts/…woff2`.

The CSS variables (`--font-sans`, `--font-mono`, `--font-serif`) already list system fallbacks, so layout degrades gracefully if a font fails to load.
