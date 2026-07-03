# Development Sources Index

**Audience:** Developers and maintainers updating [stakeholder-timeline.md](./stakeholder-timeline.md).  
**Not** for vineyard owners—use the stakeholder timeline for presentations.

This page maps each **shipped milestone** to where the technical record lives in the repo.

| # | Milestone (layman title) | Approx. date | Primary sources |
|---|--------------------------|--------------|-----------------|
| 1 | Digital vineyard directory | Early 2026 | `ede8734` Initial app; [module-scope.md](./module-scope.md) Sprint 1 |
| 2 | Task tracking | Early 2026 | `21986d2`; [module-scope.md](./module-scope.md) Sprint 2 |
| 3 | Equipment records | Early 2026 | `9b49043`; Sprint 3 |
| 4 | Irrigation logging | Early 2026 | `9b49043`; Sprint 4 |
| 5 | Interactive map | Early 2026 | `9b49043`; Sprint 5 |
| 6 | Real Cooper Estate map | Jul 2026 | `038bf91`; [OVERSIGHT.md](../OVERSIGHT.md) Sprint 7 |
| 7 | Field-friendly mobile | Jul 2026 | `c564561`; Sprint 6 |
| 8 | Complete the basics (Op 1–4) | Jul 2026 | `373e3cb`; [next-development-plan.md](./next-development-plan.md) Track 1 |
| 9 | Estate intelligence (Sprint 8) | Jul 2026 | `5980e9f`, `c004712`; [sprint-8-plan.md](./sprint-8-plan.md) |
| 10 | Professional ops hubs (Op 5–9) | Jul 2026 | `7320da8`; OVERSIGHT Op-5–9 |
| 11 | Custom task types + bulk | Jul 2026 | `e1b6b6c`; OVERSIGHT task types |
| 12 | Soft delete recovery | Jul 2026 | `d15683f`; OVERSIGHT soft delete |
| 13 | Task notifications | Jul 2026 | `d9a53d6`; OVERSIGHT notifications |
| 14 | GPS field progress | Jul 2026 | `f610e24`; [module-scope.md](./module-scope.md) GPS section |
| 15 | Field log polish | Jul 2026 | `180ca0c`; OVERSIGHT field log |
| 16 | Multi-block tasks | Jul 2026 | `05ce760`; [module-scope.md](./module-scope.md) multi-block |
| 17 | Recent conveniences | Jul 2026 | `a3fae04`; pump edit, select-all, varietal filter |

## Maintainer files

| File | Purpose |
|------|---------|
| [OVERSIGHT.md](../OVERSIGHT.md) | Reverse-chronological deploy and feature log |
| [roadmap.md](./roadmap.md) | Sprint checklist (developer) |
| [module-scope.md](./module-scope.md) | Module-by-module shipped scope |
| [next-development-plan.md](./next-development-plan.md) | Operational UI audit and Op track |
| [product-vision.md](./product-vision.md) | Mission and audience |

## Updating the stakeholder timeline

When shipping a user-visible feature:

1. Add an entry to [stakeholder-timeline.md](./stakeholder-timeline.md) (oldest→newest order in the timeline section, or append as newest milestone).
2. Add a row to this index with commit hash and OVERSIGHT section.
3. Update “What you can do today” if the feature is a good owner demo.
4. Keep language plain—no framework or schema names in the stakeholder doc.

## Route verification

All routes cited in the stakeholder doc should exist under `src/app/(app)/`. Quick check:

```bash
find src/app/\(app\) -name page.tsx | sort
```
