# Portfolio Build Plan

## Snapshot
- Target audience: hiring managers/recruiters for senior full-stack (Vue + Laravel) roles.
- Narrative pillars: full-stack ownership, production stability, measurable impact, mentorship/tooling leadership.
- Primary CTAs: `Download Résumé`, `Email Anthony` (secondary).

## Checklist
- [x] Define intent and pull résumé metrics for narrative fuel.
- [ ] Collect supporting evidence (screens, repo notes, anonymized metrics) for each highlight/deep-dive project.
- [x] Draft section briefs (hero, highlight reel, deep dives, skills, about, contact).
- [ ] Generate layout variants with AI co-pilot (e.g., Google Stitch) using briefs.
- [ ] Refine chosen layout in Stitch editor or alternate design tool (Penpot/Lunacy) if Figma unavailable.
- [ ] Craft authentic copy (AI-assisted draft, human-edited) per section.
- [ ] Validate attention, contrast, and accessibility on key screens.
- [ ] Extract design tokens, map Vue component structure.
- [ ] Implement Vue SFCs with static-site generation and markdown/CMS-powered content.
- [ ] QA (responsive, Lighthouse, manual review) and peer feedback.
- [ ] Deploy and schedule quarterly refresh cadence.

## Section Briefs

### Hero
- Goal: Position Anthony as a senior full-stack engineer delivering resilient Vue + Laravel platforms.
- Key proof points: 6+ years shipping end-to-end features; supports 25+ production repos; 70% query speed boost on analytics feature.
- Visual notes: focus on metric pills over stock art; include location (Ridgeway, VA) and remote-friendly note.

### Highlight Reel (3 cards)
1. **Incident-Ready App Portfolio (Clevyr, 2023–present)**
   - Role: Senior full-stack engineer maintaining 25+ products.
   - Proof: Leads SLA incident triage, dependency automation, Sentry rollout.
   - Stack tags: Laravel, Vue 3, Sentry, CI/CD.
2. **Lease Analytics Dashboard (Leasecake, 2022–2023)**
   - Role: Team lead across backend and frontend delivery.
   - Proof: Rewrote time-series queries for ~70% faster response; mentored teammate building Vue UI.
   - Stack tags: Laravel, Vue 3, PostgreSQL.
3. **Digital Intake Platform (Confidential mental health client, 2020–2022)**
   - Role: Architect and lead engineer.
   - Proof: Delivered secure intake MVP, guided four-person team, ongoing enhancements.
   - Stack tags: Laravel, Vue 3, Inertia, Tailwind.

### Deep-Dive Projects
- **Incident-Resilient Platform Portfolio (Clevyr)**
  - Context: Diverse client applications with strict SLAs and shared tooling gaps.
  - Contribution: Coordinated dependency updates, introduced Sentry and Laravel Shift, handled production incidents end-to-end.
  - Impact: Faster incident resolution, predictable upgrade cadence, improved error visibility.
  - Notes: Emphasize cross-team leadership and tooling adoption wins.
- **Lease Analytics Dashboard (Leasecake)**
  - Context: Customer-facing lease intelligence tool hampered by slow analytics queries.
  - Contribution: Re-architected Laravel backend with recursive SQL; defined Vue architecture, mentored UI dev.
  - Impact: ~70% faster queries, smoother release pipeline, better data storytelling.
  - Notes: Highlight collaboration with product/design, data modeling depth.
- **Digital Mental Health Intake (Confidential)**
  - Context: Manual onboarding flow needed regulated, secure replacement.
  - Contribution: Led full-stack build of intake system, designed APIs, frontend experience, and team process.
  - Impact: On-time launch, compliant patient flow, maintainable enhancements post-MVP.
  - Notes: Stress empathy for regulated environments and mentorship of four-person team.

### Skill Stack
- **Backend & Platforms:** Laravel, PHP, PostgreSQL, MySQL, API design, Docker, GitHub Actions, CI/CD, Renovate automation.
- **Frontend Experience:** Vue 3, Inertia, Vite, TailwindCSS, SCSS, component architecture, accessibility.
- **Quality & Observability:** Sentry, PHPUnit, Pest, Vitest, PHPStan/Larastan, Laravel Pint, code review facilitation.
- Optional mention (if desired later): exploring Nuxt 3 / Astro; omit until confirmed.

### About
- Tone: Confident, collaborative, grounded in production ownership.
- Message pillars: full-stack problem solving, mentorship, passion for stabilizing complex systems, comfort partnering with product/support.
- Personal hook: reliable incident responder who enjoys mentoring and improving tooling across teams.
- Availability: open to senior/staff full-stack roles (remote-friendly, East Coast time).

### Contact / Résumé
- Primary CTA: Download résumé (PDF).
- Secondary CTA: Email (tonypro999@gmail.com); include GitHub (`dequasar`) and optionally LinkedIn.
- Supporting copy: "Currently open to senior/staff full-stack opportunities." Include "Last updated" timestamp once published.

## Evidence Backlog
- Gather anonymized metrics/screenshots for each highlight and deep-dive project.
- Collect testimonials or peer quotes, even paraphrased, to use as pull quotes.
- Confirm which proprietary details require NDA/generalization before copywriting.

## Next Actions
1. Assemble evidence assets per project (metrics, visual artifacts, quick blurbs).
2. Prompt Stitch (or chosen copilot) using section briefs to produce layout options.
3. Review outputs, select two variants for Figma refinement.
4. Stand up Nuxt 3 static site with `@nuxt/content` (markdown) or pair Vue/Vite build with git-based CMS (e.g., Netlify CMS) before implementing components.
