# Evidence Matrix

Organizes the proof points, placeholders, and confidentiality notes for each section so we can feed AI tools without inventing data.

## Highlight Reel

| Card | Working Title | Impact Metric | Asset Ideas | Stack Tags | Confidentiality Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | Incident-Ready App Portfolio | Maintained 25+ repos; handled SLA incidents within target windows; standardized Sentry rollout | Screenshot of monitoring dashboard (anonymized), git graph (blurred names), Sentry adoption chart | Laravel, Vue 3, Sentry, GitHub Actions, Renovate | Replace client names with "Enterprise clients"; redact repo names |
| 2 | Lease Analytics Dashboard | ~70% faster time-series queries; mentored teammate for UI delivery | Mockup of analytics dashboard (recreate anonymized chart), diagram of recursive SQL flow | Laravel, Vue 3, PostgreSQL, Jest/Vitest | Use generic tenant data; avoid referencing proprietary datasets |
| 3 | Digital Mental Health Intake | Launched secure intake MVP; sustained enhancements; led 4-person team | Flow diagram of patient intake, screenshot of anonymized intake form | Laravel, Vue 3, Inertia, TailwindCSS, Docker | Describe client as "Mental health network"; remove HIPAA-sensitive labels |

## Deep-Dive Sections

| Project | Problem Summary | Contribution Highlights | Impact Metric(s) | Evidence Assets | NDA Considerations |
| --- | --- | --- | --- | --- | --- |
| Incident-Resilient Platform Portfolio | Multiple client apps with aging deps and ad-hoc incident handling | Automated dependency updates, implemented Sentry + Laravel Shift, led incident triage | Faster incident resolution (qualitative), smoother upgrade cadence | Dependency update log snapshot, before/after incident response timeline | Aggregate metrics; avoid specific client SLAs |
| Lease Analytics Dashboard | Lease intel tool constrained by slow queries | Rebuilt backend queries with recursive SQL; defined Vue architecture; mentored teammate | ~70% faster queries; improved release cadence | Performance benchmark chart, architecture sketch | Scrub customer names/data values |
| Digital Mental Health Intake | Manual onboarding not compliant/scalable | Architected API + Vue front end; led 4-person team; ensured compliance | On-time launch; ongoing enhancements | Swimlane diagram of intake process, code snippet showing validation pipeline | Replace org name with "Mental health provider"; no patient data |

## About Section Inputs

- Mentorship: mentored juniors/seniors at Clevyr; led four-person squad on mental health intake project.
- Incident culture: first responder for production issues across portfolio.
- Cross-team: partnered with support/product to scope fixes and feature requests.

## Skill Stack Notes

- Backend emphasis: highlight recursive SQL expertise, API design for regulated workflows, CI/CD stewardship.
- Frontend emphasis: Vue 3 migrations, component architecture, accessibility-minded layouts.
- Tooling leadership: Sentry adoption, Laravel Shift rollouts, Renovate automation.

## Open Items

- Confirm anonymized metric wording (acceptable ranges vs. exact numbers).
- Identify any testimonials or peer quotes safe to paraphrase.
- Decide whether to recreate UI screenshots or use stylized mockups.
