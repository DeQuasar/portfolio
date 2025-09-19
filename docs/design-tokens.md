# Design Tokens (Initial Draft)

Pulled from the current Stitch export for refinement. Update values once color/typography decisions are finalized.

## Color Palette
| Token | Hex | Usage |
| --- | --- | --- |
| `color.background` | `#F7F9F7` | Page background |
| `color.surface` | `#FFFFFF` | Cards/sections |
| `color.surfaceMuted` | `#F1F4F1` | Alternating section background |
| `color.text.primary` | `#333333` | Body text |
| `color.text.muted` | `#5F6671` | Muted copy |
| `color.primary.start` | `#4A6C4D` | Gradient start, CTA background |
| `color.primary.end` | `#6E8B6D` | Gradient end, hover states |
| `color.accent` | `#F9A03F` | Highlights/pills (if desired) |
| `color.border` | `#D7DED7` | Section dividers |

## Typography
| Token | Font | Size | Line Height | Weight | Usage |
| --- | --- | --- | --- | --- | --- |
| `type.h1` | Lora | 72px (clamp to 48–72) | 1.1 | 700 | Hero headline |
| `type.h2` | Lora | 36px | 1.2 | 700 | Section headings |
| `type.h3` | Source Sans Pro | 24px | 1.3 | 600 | Card titles |
| `type.body` | Source Sans Pro | 18px | 1.6 | 400 | Body copy |
| `type.small` | Source Sans Pro | 16px | 1.5 | 400 | Secondary text |
| `type.label` | Source Sans Pro | 14px | 1.5 | 600 | Pills, badges |

## Spacing
| Token | Pixels | Usage |
| --- | --- | --- |
| `space.xs` | 8px | Small gaps inside pills/components |
| `space.sm` | 12px | Inline spacing |
| `space.md` | 20px | Card padding, row gaps |
| `space.lg` | 32px | Section padding small screens |
| `space.xl` | 48px | Section padding desktop |
| `space.2xl` | 64px | Hero top/bottom margins |

## Radii & Elevation
| Token | Value | Usage |
| --- | --- | --- |
| `radius.sm` | 8px | Buttons, pills |
| `radius.lg` | 24px | Cards, modals |
| `radius.pill` | 999px | Rounded CTAs |
| `elevation.sm` | `0 4px 6px -1px rgba(74,108,77,0.15)` | Card hover |
| `elevation.md` | `0 10px 15px -3px rgba(74,108,77,0.15)` | Sticky header |

## Component Hooks
- `cta.primary`: gradient background from `color.primary.start` → `color.primary.end`, white text, `radius.pill`, `space.sm` vertical padding, `space.lg` horizontal.
- `cta.secondary`: white surface, border `color.border`, text `color.primary.start`, same sizing as primary.
- `metric-pill`: background `color.primary.start` at 16% opacity, text `color.primary.start`, padding `space.sm` × `space.md`, radius `radius.pill`.

## Next Actions
- Decide whether to keep the green gradient or swap to a palette that better matches Anthony's brand; update tokens accordingly.
- Align font stack with available web fonts (consider Figtree + Inter if Lora/Source Sans Pro don’t feel on-brand).
- Once finalized, mirror these values in a `src/design/tokens.ts` file for the Vue implementation.
