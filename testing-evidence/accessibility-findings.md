# PawConnect Accessibility Findings

## Automated sources

- Playwright axe checks are included in the full browser matrix.
- Lighthouse reports are stored under [testing/lighthouse](../testing/lighthouse).
- The Lighthouse run covered homepage, animal browsing, and login.

## Lighthouse scores

| Page | Performance | Accessibility | Best practices |
|---|---:|---:|---:|
| Homepage | 87 | 95 | 96 |
| Animal browsing | 90 | 86 | 96 |
| Login | 92 | 82 | 96 |

## Findings requiring follow-up

- Color-contrast findings were reported across pages. The Playwright accessibility gate intentionally excludes known contrast findings from its structural assertion, so this remains a product accessibility follow-up rather than a silently passing finding.
- Animal browsing reported heading-order and unlabeled-select findings in the Lighthouse run.
- Login reported an unnamed button and touch-target sizing findings in the Lighthouse run.
- Browser runs repeatedly logged empty image `src` warnings; these did not fail the tests but create unnecessary requests and console noise.
- Accessibility scores are not equivalent to human accessibility acceptance. Keyboard, screen-reader, zoom, and assistive-technology review remain UAT gaps.

## Evidence

- [Lighthouse summary](../testing/lighthouse/summary.md)
- [Homepage Lighthouse report](../testing/lighthouse/homepage.html)
- [Animals Lighthouse report](../testing/lighthouse/animals.html)
- [Login Lighthouse report](../testing/lighthouse/login.html)
- [Full Playwright report](./playwright-report/index.html)
