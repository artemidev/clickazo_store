# Clickazo Design System (CZ)

**Clickazo** is an ecommerce store for developers and tech people. The catalog is gear with a wink: code-joke t-shirts and hoodies, speed-cube Rubik's cubes, programmer mugs ("It works on my machine"), desk and keyboard accessories, dev-themed gym gear, phones, and tech gadgets. The store name is **Clickazo** ("click" + the Spanish augmentative *-azo* — *a big, satisfying click*). The mark is a cursor pointer.

The brand is **confident, modern, and a little playful** — streetwear energy applied to a tech store. It ships with **full light + dark theme parity** (dark is a first-class citizen, not an afterthought), and is built on a **shadcn-style token model over Tailwind**. The signature color is **electric lime** on warm near-black and warm paper.

## Sources & inspiration

No codebase or Figma was attached — this system was created from a brief plus three reference sites the user admired. We borrowed *feelings*, not pixels:

- **Princeton Tec** — https://princetontec.com/ — admired for its **bold hero section** and confident product-forward layout. We took the hero confidence and big imagery; we explicitly **rejected its beige palette** (wrong energy for a dev store).
- **Mushroom Compadres** — https://mushroomcompadres.com/ — admired for its **product cards that come alive on hover** (image swap / lift / quick-add reveal). This drives our product-card interaction spec.
- **Don Fuego Cannabis** — https://www.donfuegocannabis.com/ — admired for its **premium dark theme**. This anchors our dark-mode look: deep warm near-black, glowing accent.

If you later get a real storefront codebase (Shopify/Next.js) or a Figma file, attach it via the Import menu and we'll re-anchor the UI kit to it.

---

## Index (this folder)

| File | What's in it |
|---|---|
| `README.md` | this file — context, content, visual foundations, iconography |
| `SKILL.md` | design-skill instructions (also a Claude Code Agent Skill) |
| `colors_and_type.css` | all CSS variables (color/type/space/radius/shadow/motion) + base styles, **light + dark** |
| `fonts/README.md` | typeface notes (all three fonts are on Google Fonts — no substitutions) |
| `assets/logo/` | Clickazo wordmark (light + dark) and standalone cursor mark |
| `preview/` | design-system cards — type, color, spacing, components, brand |
| `ui_kits/storefront/` | the Clickazo storefront UI kit + click-through prototype (home, listing, product, cart) |

No slide templates exist — none were provided. Add later if needed.

---

## CONTENT FUNDAMENTALS

Clickazo copy is **playful, plain-spoken, and a bit nerdy** — like a developer friend with good taste who also happens to run a great shop. It is never corporate, never breathless, never "BUY NOW!!!".

### Voice rules

- **Second person, active.** "Build your cart," not "Customers may add items to their cart."
- **Short. Punchy. Confident.** "Ships free over $50." beats "We are pleased to offer complimentary shipping on orders exceeding fifty dollars."
- **Sentence case everywhere** — buttons, nav, headers, product titles. "Add to cart," "New drops," "Your bag." Never "Add To Cart" or "ADD TO CART" (the only all-caps allowed is the **mono eyebrow label**, see below).
- **Nerd humor, lightly applied.** Product copy can pun ("Compiles under pressure" on a hoodie). UI chrome stays clear and functional — don't make people decode a joke to check out.
- **Specific beats vague.** "12 left" > "almost gone." "Ships Tue, May 31" > "ships soon." "$28" > "affordable."
- **No hype punctuation.** No "!!!", no ALL CAPS shouting, no "🔥 DEAL 🔥". A single em dash for emphasis is plenty.

### Casing & punctuation

- **Sentence case** for everything readable. **UPPERCASE** is reserved for the mono eyebrow/label device (`NEW DROP`, `SKU CZ-114`, `FREE SHIPPING`) — tracked `+0.12em`, JetBrains Mono.
- **Prices** are mono, tabular figures, with the currency sign tight: `$28`, `$28.00`, `$120`. Sale prices show the old price struck through in muted gray, the new price in the sale red.
- **Oxford comma: yes.** Em dashes tight (`word—word`). Ellipsis only when truncating (`Loading…`).
- **Numerals for everything quantified** in UI ("3 left", "4.8 ★", "2-day shipping"). Spell out zero–nine in prose.
- **No trailing periods** on buttons, chips, nav, or labels under ~6 words. Full stops on real sentences.

### "I" vs "you" vs "we"

- **"You / your"** for the shopper. Default. "Your bag", "Track your order".
- **"We"** for Clickazo, sparingly — shipping, policies, empty states ("We'll email you when it's back.").
- **"I"** essentially never.

### Emoji

- **Not in product UI.** No emoji in buttons, nav, product titles, cart, or checkout. If we need a fire/star/cart icon we ship a real **Lucide** SVG, not 🔥⭐🛒 — emoji render inconsistently and can't be color-tuned to the theme.
- **Okay, sparingly, in marketing/editorial moments** (a launch banner, a blog post). One per surface, max. Never load-bearing.

### Example copy (good ↔ bad)

| Spot | ✅ Clickazo | ❌ Not Clickazo |
|---|---|---|
| Hero CTA | "Shop the new drop" | "BUY NOW & SAVE!!! 🔥" |
| Product (tee) | "Compiles under pressure — heavyweight cotton tee" | "Premium High-Quality Amazing T-Shirt For Programmers" |
| Stock | "Only 4 left" | "Hurry, almost sold out!!" |
| Empty cart | "Your bag's empty. Go find something good." | "Oops! You have no items in your shopping cart." |
| Shipping | "Free over $50 · ships in 1–2 days" | "We offer competitive shipping rates on all orders." |
| Sale badge | "−30%" | "MEGA SALE BLOWOUT" |

---

## VISUAL FOUNDATIONS

### Palette

One signature accent + one secondary + neutrals + ecommerce status hues. Modify with the neutral ramp and opacity — **don't invent new tints**.

- **`#C2F23C` electric lime** — *the* brand color. Primary CTA fill, logo, highlights, the dark-theme glow. **Text on lime is always ink `#14160F`**, never white. Hover lightens to `#CDF45C`, press deepens to `#A8D914`. As link/text on a light bg, use `--lime-ink #45600A` for legibility (raw lime fails contrast as text).
- **`#7B61FF` electric violet** — secondary accent: links, focus ring, "new" badges, info. Brightens in dark mode (`#9B86FF`).
- **`#14160F` ink** — warm, faintly green near-black. Light-theme text; also the dark-theme deep bg lives near here (`#0E0F0B`).
- **`#F6F7F1` paper** — warm off-white. Light-theme page. Cards sit on **pure `#FFFFFF`** to lift off the paper. *Never* a cold blue-white.
- **Status:** `#1FBF6B` green (in stock / success), `#F4A720` amber (low stock / warning), `#FF4D4D` red (**sale / price drop** / destructive / error), `#2E8FF5` blue (shipping / info).
- **Neutral ramp:** a 14-step warm, faintly-green gray scale (`--ink-950 … --ink-50 / --paper`) drives every border, surface, and muted text. See `colors_and_type.css`.

**Rule:** a row hover is `rgb(20 22 15 / 0.04)`, not a fresh gray. Borders are alpha-ink (`rgb(20 22 15 / 0.12)`), so they adapt to any surface.

### Type

Three families, clear jobs:

- **Outfit** (`--font-sans`) — *everything by default*. A geometric, friendly, modern sans. Variable 300–900. Headings are **800 (black)** for h1, **700** down the scale, tracked tight (`-1.5%` to `-3%` on display). Body is 400 at 16px / 1.6.
- **JetBrains Mono** (`--font-mono`) — the **technical voice**: prices, SKUs, the uppercase eyebrow label, spec tables, "code" details on products. On-brand for a dev store and used liberally as a deliberate device.
- **Instrument Serif** (`--font-serif`) — **editorial accent only**: a big drop headline, a pull-quote, an "about the maker" moment. High-contrast, elegant, a counterpoint to all the geometry. Never body text, never UI chrome.

Scale: display 84 · h1 60 · h2 44 · h3 32 · h4 24 · h5 19 · h6 16 · lead 21 · body 16 · sm 14 · xs 12.5 · mono-label 12. Don't go below 12.5px.

### Backgrounds

- **Flat warm color.** Paper in light, deep warm near-black in dark. No mesh gradients, no rainbow blurs.
- **Big product photography** is the hero device (Princeton-Tec confidence) — full-bleed or large media panels, products on clean seamless backdrops, **warm-neutral color grade** (not cool, not b&w, not heavy grain).
- **Lime as a flood color** is allowed for high-energy panels (a "new drop" banner, a sale strip) — lime fill, ink text. Use it as a *punch*, one block per view, not everywhere.
- **Subtle dotted/grid texture** is permitted on large empty panels (a faint `--border`-colored dot grid) as a nod to graph paper / pixels — low contrast, decorative only.
- **No glassmorphism by default.** One exception: the **sticky header** may use a translucent surface + `backdrop-filter: blur(12px)` so content scrolls under it. Menus and modals are solid.

### Animation

- **Smooth, quick, no theatrics.** `--ease-out cubic-bezier(0.22,1,0.36,1)`, 140–240ms for UI (hover, menu, drawer).
- **Product cards (the signature interaction):** on hover the card **lifts** (`translateY(-6px)` + `--shadow-pop`), the **image gently zooms** (`scale(1.05)`, ~400ms), and a **"Add to cart" / quick-add row reveals** from the bottom. This is the Mushroom-Compadres moment — make it feel alive but never janky.
- **Add-to-cart confirmation** uses the **spring ease** (`--ease-spring`) — the cart count badge pops, the button briefly flips to a check. Spring is reserved for these positive confirmations.
- **Cart drawer** slides in from the right, 240ms ease-out, with a dimmed backdrop (no blur).
- **Reduced motion respected** — `prefers-reduced-motion` collapses everything to instant/opacity. Already wired in the base CSS.

### Hover / press states

- **Buttons — primary (lime):** hover lightens to `--primary-hover` and lifts `translateY(-1px)` with a soft shadow; press returns to `translateY(0)` and deepens to `--primary-press`. No scale.
- **Secondary / outline buttons:** hover fills with `rgb(ink/0.04)` and the border darkens; press goes `0.08`.
- **Ghost / icon buttons:** hover = subtle ink wash, no border.
- **Cards / list rows:** hover lift (product cards) or a `0.04` wash (list rows).
- **Focus:** 2px violet ring, 2px offset, always visible, never removed.
- **Disabled:** 45% opacity, `cursor: not-allowed`, hue unchanged.

### Borders

- **1px alpha-ink** (`rgb(20 22 15 / 0.12)`) is the default hairline — cards, inputs, dividers. It auto-adapts on dark surfaces (becomes alpha-paper).
- **`--border-strong`** (`0.24`) for input borders, emphasised dividers, and hover.
- We don't use heavy black keylines; borders are quiet. Emphasis comes from fill + the lime accent, not thick strokes.

### Shadows & elevation

- **Light theme: soft, neutral, layered.** `--shadow-sm` for resting cards, `--shadow-md` for menus/popovers, `--shadow-lg`/`xl` for modals & drawers. `--shadow-pop` is the product-card hover lift.
- **`--glow-lime`** — a 1px lime ring + soft lime bloom. Used for **active/selected** chips and the focused primary CTA on dark.
- **Dark theme: shadows nearly vanish** (everything's on black). Elevation is communicated by **lighter surfaces + borders + the lime glow** instead. The CSS swaps shadow tokens automatically under `[data-theme="dark"]`.
- **No inset shadows** except input wells where helpful.

### Corner radii

Modern commerce — rounder than a dev tool, not bubbly. Buttons/inputs/chips **10px**, cards **14px**, feature cards & modals **20px**, hero panels & big media **28px**, pills/avatars **999px**. Small inline things (code, tags) **6px**. We avoid both hard 0px corners and oversized 32px+ "blobby" radii.

### Cards

- **Product card:** white surface (`--surface`), 1px hairline border, **14px** radius, `--shadow-sm` at rest → lifts to `--shadow-pop` + `translateY(-6px)` on hover. Square or 4:5 product image on a neutral fill, title (16px medium), price (mono bold), star rating, and a quick-add affordance that reveals on hover. Sale items show a `−30%` red chip top-left and a struck old price.
- **Content / feature card:** `--surface`, 20px radius, generous padding, optional lime or violet accent corner.
- **Cards never stack the "sticker" hard-shadow** — that's not this brand. Elevation is soft.

### Capsules vs gradients

- **Pills/chips** (filters, tags, badges, the cart count) are solid-fill capsules, `999px`, often mono text. The active filter chip is ink-fill / paper-text or lime-fill / ink-text.
- **Image overlays:** when text sits on product photography, use a **solid color strip or a capsule**, or a bottom **protection gradient** (ink → transparent) on full-bleed hero imagery only. Don't fade text directly over busy photos.

### Layout

- **Sticky translucent header** (blurred), everything else scrolls. Cart is a right-side drawer.
- **Content max-width:** `1280px` storefront shell, `1120px` for product detail, `680px` for prose/policy pages.
- **Gutters:** 16px mobile, 24px tablet, 40–48px desktop.
- **Product grid:** 2 cols mobile, 3 tablet, 4 desktop; 24px gap.
- **Vertical rhythm** on the 4px scale; section spacing in multiples of 8 (commonly 64–96px between marketing sections).

### Imagery color vibe

- **Warm-neutral, true-to-life.** Products on clean seamless backdrops (paper, soft gray, or a flat lime/violet panel for hero pieces). No cool blue cast, no b&w, no heavy film grain, no AI-gradient mush. Lifestyle shots are warm and bright.

---

## ICONOGRAPHY

Clickazo uses **[Lucide](https://lucide.dev/)** as the icon system. It matches the brand: clean, consistent 2px stroke, rounded caps, monoline, optically aligned — and it's CDN-loadable / available as React components. The Clickazo logo mark *is* Lucide's `mouse-pointer-2` cursor, so the icon set and the brand mark share a lineage.

### Rules

- **Lucide is the default and only set.** Load via CDN (`<script src="https://unpkg.com/lucide@latest"></script>`) and call `lucide.createIcons()`, or inline the SVG. Don't hand-roll icons when a Lucide one exists.
- **Stroke weight 2px** (Lucide default) — don't override.
- **Sizes 16 / 20 / 24** only. 16 inline with text, 20 in buttons/nav, 24 for section heads. Never in-between.
- **Color `currentColor`** always — the icon inherits its parent's text color so it adapts across light/dark.
- **Hit target 44×44 minimum** around any tappable icon, even when the glyph is 20px.
- **Common storefront set:** `search`, `shopping-bag`, `heart`, `user`, `menu`, `x`, `chevron-down`, `chevron-right`, `star`, `truck`, `shield-check`, `minus`, `plus`, `check`, `sun`, `moon`, `filter`, `sliders-horizontal`, `arrow-right`, `mouse-pointer-2`.

### Emoji & unicode

- **Emoji: not used as icons.** Ever. (See Content Fundamentals.)
- **Unicode is fine when typographic, not pictographic:** `→ ← ↑ ↓ • — … × ✓ ★` in labels/copy is good (`"Next →"`, `"4.8 ★"`). Pictographic unicode (`🔥 ⚡ 🛒`) is not — ship a Lucide SVG.

### Logo / mark

- **Wordmark:** "Clickazo" in Outfit 800, tracked `-1.4`. Mark to the left in a 14px-radius lime tile. Light version uses ink text; dark version uses paper text. Files in `assets/logo/`.
- **Mark alone:** a lime rounded-square tile with the ink cursor pointer + a faint click-ripple arc. Use at small sizes (favicon, avatar, app icon).
- **Clear space:** keep at least the height of the mark's tile clear on all sides. Don't recolor the lime, don't add gradients, don't outline.

---

## Open items / things to swap later

- **Self-hosted fonts** — currently loaded from Google Fonts (Outfit, JetBrains Mono, Instrument Serif). Drop `.woff2` files in `fonts/` and update the `@import` in `colors_and_type.css` for production performance.
- **Real product photography** — the UI kit uses neutral image placeholders / drop-zones. Swap in real shots (warm-graded, seamless backdrops) when available.
- **Logo wordmark as SVG** — the standalone SVG lockups use live `<text>` (renders best where Outfit is loaded). Outline the text to paths for a fully portable asset.
- **No real backend** — the storefront UI kit is a cosmetic click-through, not production commerce code.
