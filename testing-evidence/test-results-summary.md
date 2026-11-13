# PawConnect Test Results Summary

## Automated execution totals

| Test suite | Executed | Passed | Failed | Blocked | Not run |
|---|---:|---:|---:|---:|---:|
| Full Playwright browser matrix | 185 | 185 | 0 | 0 | 0 |
| Real system Playwright workflow | 7 | 7 | 0 | 0 | 0 |
| Backend unit tests | 32 | 32 | 0 | 0 | 0 |
| Backend API integration | 1 | 1 | 0 | 0 | 0 |
| **Automated total** | **225** | **225** | **0** | **0** | **0** |

## UAT status

The acceptance plan contains 24 human UAT cases. Human execution, tester identity, actual observations. See [UAT_TEST_CASES.md](./acceptance-testing/UAT_TEST_CASES.md) and [UAT_REPORT.md](./acceptance-testing/UAT_REPORT.md).

## Automated execution evidence

- [Full Playwright log](./acceptance-testing/full-playwright.log)
- [Full Playwright JSON results](../testing/playwright-results.json)
- [Full Playwright HTML report](../testing/playwright-report/index.html)
- [Real system log](./acceptance-testing/automated-system-check.log)
- [Real system JSON results](./system-testing/playwright-results.json)
- [Real system HTML report](./system-testing/playwright-report/index.html)
- [Backend unit log](./acceptance-testing/backend-unit.log)
- [Backend integration log](./acceptance-testing/backend-integration.log)
- [Isolated database setup log](./acceptance-testing/full-e2e-db-setup.log)
