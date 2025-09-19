# Layout Prompt Drafts

Prompts tailored for Google Stitch (or comparable UI copilot). Each includes the section structure, tone cues, and layout guidance informed by the briefs.

## Prompt A — Metric-Driven Single Page
"""
You are designing a single-page portfolio for a senior full-stack engineer (Vue + Laravel). Primary audience: tech recruiters. Emphasize authenticity—no stock photography or generic gradients.

Layout requirements:
- Sticky header with name, role, and two CTAs (Download Résumé, Email Anthony).
- Hero section: split layout with bold headline, subhead, and two metric pills. Light background, plenty of breathing room.
- Highlight reel: three horizontal cards on desktop, stacked on mobile. Each card shows project name, role, impact metric, tags for tech stack.
- Deep dives: two detailed sections with alternating layout (text left/image right, then flipped). Include problem, contribution, impact bullets, and stack capsule.
- Skill stack: grouped chips (Backend & Platforms, Frontend Experience, Quality & Observability) presented in responsive grid.
- About: short paragraph plus pull quote about mentoring/incident response.
- Contact: résumé button (prominent), email link, GitHub icon list.

Visual tone:
- Neutral light theme, accent color reserved for CTA and metric pills.
- Use modular grids (12-column desktop, 4-column mobile).
- Add subtle dividers and card shadows, but keep overall feel crafted, not templated.
- Include placeholders for anonymized screenshots/diagrams.

Deliver frames for desktop and mobile.
"""

## Prompt B — Sidebar Resume CTA
"""
Design a single-page hiring portfolio for Anthony, a senior full-stack engineer. The layout should feel editorial and intentional, avoiding template vibes.

Structure:
- Left sidebar (sticky on desktop) with name, role tagline, résumé button, contact links, and location (Ridgeway, VA). Sidebar collapses into top bar on mobile.
- Main content sections scroll vertically:
  1. Hero intro with headline and 2–3 metric highlights.
  2. Highlight reel grid (3 cards) summarizing key projects with impact numbers and tech tags.
  3. Deep-dive stories (Incident-Resilient Portfolio, Lease Analytics Dashboard, Digital Intake Platform) each in its own block with problem→solution→impact layout and optional NDA note.
  4. Skill matrix showing grouped capabilities with pill styling.
  5. About section featuring a personable paragraph and a callout badge for mentoring.
  6. Contact footer with résumé button, availability note, and email.

Design cues:
- Typography pairing: humanist sans for headings, clean sans for body, mono accent for code tags.
- Accent color: warm amber or teal used sparingly (headings, CTA).
- Introduce subtle background textures (noise, mesh) behind deep-dive sections.
- Provide clear space for custom graphics/screenshots; no filler stock imagery.

Output desktop + mobile frames, ready for Figma refinement.
"""

## Prompt C — Section Tabs Variant (Optional)
"""
Create a single-page portfolio with a segmented feel for a senior full-stack engineer.

Key requirements:
- Top hero with headline, subhead, and quick stat bar (3 inline stats).
- Immediately beneath, a horizontal tab bar with three tabs: Highlights, Projects, About. On desktop, tabs swap content in place; on mobile, convert to accordions.
- Highlights tab: three cards summarizing standout work with impact metrics.
- Projects tab: stacked case study blocks (Incident Portfolio, Lease Dashboard, Intake Platform) each with problem/contribution/impact and stack tags.
- About tab: skills matrix, personal blurb, and contact CTA.
- Persistent résumé button in header.

Style guidance:
- Light theme with high readability, strong grid discipline.
- Use soft gradients or color blocks sparingly to create separation between tabs.
- Provide placeholders for bespoke visuals; avoid AI-looking stock art.

Export desktop and mobile treatments.
"""

## Usage Notes
- Feed Prompt A and B first; evaluate which direction feels most authentic before exploring the tabbed variant.
- After Stitch generates variants, export the top 2 results for Figma, then customize typography, color tokens, iconography, and imagery manually.
