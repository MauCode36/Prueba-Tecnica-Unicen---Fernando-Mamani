# UNICEN

The UNICEN design system, built from the official wordmark: a heavy, rounded, all-caps sans in deep navy, with a single orange dot set inside the **C**. Everything here grows from those two facts — a confident navy voice, and one warm point of focus.

> **Source and assumptions.** Only the wordmark (a JPG) was supplied. `navy` (#01274B) and `orange` (#ED6907) are sampled from it. The neutrals, dark theme, state colors, type scale, spacing and radii are **derived** and noted as such on each token. The typeface **Outfit** is a free close match to the wordmark, not the official brand font — replace it when the official face is known.

## Content fundamentals

- **Voice:** institutional but warm; direct, second person ("Inscríbete", "Conoce tu carrera").
- **Language:** Spanish first. Sentence case for headings and buttons; ALL CAPS only for short `label` eyebrows and the wordmark itself.
- **Brevity:** one idea per heading; keep buttons to 1–3 words.

## Visual foundations

### Color

| Role | Token | Rule |
| --- | --- | --- |
| Brand ink | `navy` | Headings, logo, primary buttons on light grounds. |
| The dot | `orange` | Used sparingly, like the dot in the C: one accent per view — a badge, an active indicator, the focus ring. Never body text on white (3.2:1). |
| Orange as text | `accent-text` | Darkened orange for eyebrows and inline highlights (5.2:1). |
| Grounds | `surface-100`, `surface-200`, `navy-tint` | White page, light raised surfaces, a navy wash for selection. |
| Brand fields | `brand-surface` + `on-brand` | Hero bands and footers in solid navy with white text. |
| Text | `ink`, `ink-muted` | Primary and secondary text. |
| Lines | `border`, `border-strong` | Hairlines vs. control boundaries (3:1). |

Ratio: mostly white and navy, orange under ~5% of any screen. Orange and navy differ strongly in lightness, so they stay distinguishable without relying on hue.

### Typography

One family, `sans` (Outfit). Bold (700) for `display`/`h1`, semibold (600) for `h2`/`h3`/`label`, regular for `body`/`small`. Tight, heavy headings echo the wordmark; keep body text regular for readability.

### Shape and space

- Corners are soft: `radius-md` (8px) for buttons and cards, `radius-lg` for large panels, `radius-full` for pills and dots.
- 4px base grid: `space-1` … `space-12`. Card padding `space-4`, section padding `space-8`.
- Flat surfaces; separate with `border` or a `surface-200` fill rather than heavy shadows.

### The dot motif

The orange dot inside the C is the brand's signature shape. Use a single `orange` disc (`radius-full`) as a marker — active nav item, unread indicator, bullet for key facts. One per component, never a scattered pattern.

## Iconography

No icon set was supplied. Until one is chosen, use a rounded-stroke outline set at 2px stroke in `ink`, with `orange` reserved for a single active/alert state.

## Logo

See the **Logos** asset group. Navy wordmark on white; keep clear space of at least the height of the orange dot on every side; never recolor the dot or the letters, stretch, or add effects.
