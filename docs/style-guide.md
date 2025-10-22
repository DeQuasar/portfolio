# Portfolio UI Style Guide

A snapshot of the current design tokens and component conventions used across the portfolio. Reference this document before adding new UI or Tailwind utilities so the system stays cohesive.

---

## 1. Foundations

### 1.1 Color Palette
| Token | Hex | Usage |
| --- | --- | --- |
| `--color-sage-50` | `#F7F9F7` | App background, card surfaces |
| `--color-sage-100` | `#F1F4F1` | Subtle backgrounds, section dividers |
| `--color-sage-200` | `#D7DED7` | Borders, dashed outlines |
| `--color-sage-300` | `#B8C6B9` | Muted icons, secondary text |
| `--color-sage-500` | `#4A6C4D` | Brand accent for CTAs and icons |
| `--color-sage-600` | `#3F5B43` | Primary buttons, headings |
| `--color-sage-700` | `#2F4632` | Body text, high-contrast elements |
| Success tooltip gradient | `linear-gradient(140deg, #5F8F69, #2F5236)` | Copy-feedback bubble |
| Error tooltip gradient | `linear-gradient(140deg, #E05D7B, #91283F)` | Error tooltip state |

> Neutrals outside this palette should default to Tailwind grays (`slate-*`) unless a new token is introduced.

### 1.2 Typography
| Token | Font stack | Tailwind utility | Usage |
| --- | --- | --- | --- |
| `--font-display` | `"Lora", serif` | `font-display` | Page titles, hero headings |
| `--font-body` | `"Source Sans Pro", system-ui, sans-serif` | `font-body` | Body copy, UI labels |

Type scale guidelines:
- Hero title: `text-[clamp(2.25rem,5vw,3.25rem)]`, weight `600`.
- Section headings: `text-2xl`–`3xl`, weight `600`.
- Body copy: `text-base`/`text-lg` with `leading-relaxed`.

### 1.3 Spacing & Layout
- Core sections sit inside flex or grid containers with `gap-4` / `gap-6` on desktop.
- Buttons/pills use `rounded-full` with horizontal padding multiples of 4px (`px-5`, `px-6`).
- Global container padding: desktop `px-6` → `px-10`, mobile `px-4`.
- Shadow token: `--shadow-card: 0 20px 40px -20px rgba(74, 108, 77, 0.35)`; apply via `shadow-card` utility when defining new surfaces.

---

## 2. Components

### 2.1 Buttons (`components/ui/AppButton.vue`)
| Variant | Classes | Notes |
| --- | --- | --- |
| `primary` | `bg-sage-600 text-white px-6 py-3 shadow-md hover:bg-sage-700 hover:shadow-lg` | Primary CTA, high emphasis |
| `secondary` | `border border-sage-300 bg-white/85 text-sage-600 px-5 py-2.5` | Low emphasis with opaque white |
| `ghost` | `border border-dashed border-sage-300 bg-white/60 text-sage-500 px-4 py-2` | Tertiary / minimal |
| `icon` | `h-12 w-12 rounded-full border border-sage-300 bg-white/80` | Icon-only actions |
| `minimal` | `px-4 py-2 text-sage-500 hover:text-sage-700` | Text links styled as buttons |

Shared base: `inline-flex`, `gap-2`, `rounded-full`, `focus-visible:ring-sage-500/45`.

### 2.2 Links (`components/ui/AppLink.vue`)
Uses the same variant vocabulary as buttons, with default variant `secondary`. Include `_blank` links with `rel="noopener noreferrer"` (handled automatically).

| Variant | Notes |
| --- | --- |
| `cta` | Gradient pill used for the résumé download; has built-in uppercase tracking and lift on hover. |
| `icon` | Circular social/email icon buttons; pair with 24×24 SVGs. |

### 2.3 Tooltip (Hero CTA)
- Render the bubble with Tailwind utilities: `inline-grid grid-cols-[auto_1fr] items-center gap-3 rounded-2xl border px-3.5 py-2.5`.
- Gradients come from the `tooltipPresets` map in `components/hero/Hero.vue`; expose the active preset via `data-variant="success|error"` for tests.
- The icon badge is a `h-8 w-8` circle that inherits the preset background and shadow.
- The arrow uses the same preset background/border and is positioned with the floating-ui middleware.
- Reuse the `.tooltip-fade-*` transition helpers for enter/leave states.

### 2.4 Section Header (`components/ui/SectionHeader.vue`)
- Use for section intros; supports `eyebrow`, `title`, optional `description`, and `align` (left/center).
- Set `accent="double-bar"` for the dual divider used in Experience/Skill Stack.
- Override slots (`#title`, `#description`) when you need custom markup, e.g., hero headlines.

### 2.5 Card Surface (`components/ui/CardSurface.vue`)
- Wrap content that needs the standard white surface + `shadow-card`.
- Props: `padding` (`none|sm|md|lg`), `rounded` (`md|lg|xl`), and `hoverable` for hover shadow transitions.
- Pass additional utilities via the `class` attribute; they compose with the base surface styles.

### 2.6 Pill (`components/ui/Pill.vue`)
- Inline pill chips with `tone` (`sage|neutral`), `size` (`sm|md`), and optional uppercase styling.
- Default usage renders the sage competency chips; use `tone="neutral"` for secondary groupings.

### 2.7 Cards & Sections
- Cards inherit `shadow-card`, `rounded-[2rem]`, and background mix `bg-white/85`.
- Section metrics chips: `border border-sage-200/80`, `rounded-full`, `px-4 py-2`.

---

## 3. Interaction Patterns
- Animations opt-in via utility classes (`animate-fade-up`). Honor `prefers-reduced-motion`—already wired in utilities.
- Copy interactions: `useClipboard` races the native API with a 300ms timeout and falls back to `execCommand`. Tooltip state updates via `tooltipVariant`/`tooltipHeading`.
- Focus: all interactive elements use `focus-visible:ring-2` with sage offsets.

---

## 4. Working With Tailwind
- Tailwind config currently relies on the default theme plus tokens defined in `@theme` inside `assets/css/tailwind.css`.
- When introducing new palette entries or shadows, add them to the `@theme` block first, then expose utilities or CSS variables as needed.
- Prefer Tailwind spacing/typography utilities for new layout work; only drop into custom CSS when a shared token or animation is required.

---

## 5. Next Steps
1. Prefer the shared primitives (`SectionHeader`, `CardSurface`, `Pill`) before introducing new layout markup.
2. If a pattern repeats across pages, graduate it into `components/ui/` with clear props and document it here.
