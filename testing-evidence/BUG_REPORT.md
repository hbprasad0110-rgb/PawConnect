# PawConnect Bug and Finding Report

| Bug ID | Area | Description | Severity | Status | Evidence / classification |
|---|---|---|---|---|---|
| BUG-001 | Test infrastructure | The real database workflow was initially included in all five parallel browser projects. Shared test-data mutation caused four test-only failures and serially skipped dependent cases. | Medium | FIXED | Corrected `frontend/playwright.config.ts` to exclude the real workflow from the parallel matrix; dedicated system config remains serial. This was a test defect, not an application defect. See [full Playwright log](./acceptance-testing/full-playwright.log). |
| BUG-002 | Browser console / image handling | Browser runs repeatedly logged an empty `src` image warning. Functional tests still passed, but the warning can trigger unnecessary requests and noise. | Low | OPEN | [Regression summary](../testing/regression-summary.md) and [full Playwright log](./acceptance-testing/full-playwright.log). |
| BUG-003 | Accessibility | Lighthouse reported contrast, heading-order, unlabeled-select, unnamed-button, and touch-target findings on the tested pages. | Medium | OPEN / VERIFY | [Accessibility findings](./accessibility-findings.md) and [Lighthouse summary](../testing/lighthouse/summary.md). |
| BUG-004 | Performance | LCP exceeded the 2.5-second “good” threshold on all three Lighthouse pages; the JavaScript bundle is large and route-level code splitting is recommended. | Medium | OPEN / IMPROVEMENT | [Lighthouse summary](../testing/lighthouse/summary.md). |

## Defect classification

- No application-functional failures were observed in the final automated runs.
- BUG-001 was fixed as a test configuration/data-isolation defect.
- BUG-002 through BUG-004 are retained findings or improvement items from browser/Lighthouse evidence and require product-owner triage.
