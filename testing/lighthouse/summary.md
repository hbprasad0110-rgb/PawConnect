# PawConnect Lighthouse Performance Summary

Run against the production frontend preview at `http://127.0.0.1:4173` using Lighthouse 13.6.0 with Performance, Accessibility, and Best Practices categories enabled.

| Page | Performance | Accessibility | Best practices | FCP | LCP | Speed Index | TBT | CLS |
| --- | ---: | ---: | ---: | --- | --- | --- | --- | --- |
| Homepage `/` | 87 | 95 | 96 | 1.6 s | 3.8 s | 3.0 s | 0 ms | 0 |
| Animal browsing `/animals` | 90 | 86 | 96 | 1.6 s | 3.5 s | 2.5 s | 0 ms | 0 |
| Login `/login` | 92 | 82 | 96 | 1.6 s | 3.3 s | 1.6 s | 0 ms | 0 |

## Identified issues

- LCP is above the 2.5 s “good” threshold on all pages: 3.8 s homepage, 3.5 s animals, and 3.3 s login.
- The homepage LCP image is discovered late; preload or otherwise prioritize the hero image and consider serving an optimized local responsive image.
- The production JavaScript bundle is large (`729.23 kB` minified, `184.11 kB` gzip); introduce route-level code splitting with dynamic imports.
- Lighthouse reports missing source maps for the large first-party JavaScript bundle.
- Accessibility findings include insufficient color contrast across pages.
- Animal browsing has heading-order and unlabeled-select findings.
- Login has an unnamed button and insufficient touch-target sizing findings.
- Browser console errors were recorded during the run; review the API/network failures and empty image sources before production deployment.

## Reports

- [Homepage HTML](./homepage.html) · [Homepage JSON](./homepage.json)
- [Animal browsing HTML](./animals.html) · [Animal browsing JSON](./animals.json)
- [Login HTML](./login.html) · [Login JSON](./login.json)
