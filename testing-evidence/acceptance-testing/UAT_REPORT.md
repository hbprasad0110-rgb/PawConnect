# PawConnect User Acceptance Test Report

## Report status

| Item | Value |
|---|---|
| Application | PawConnect |
| Scope | Adopter and administrator user acceptance |
| Test cases | 24 |
| Automated supporting PASS | 22 |
| Automated supporting FAIL | 0 |
| Automated supporting BLOCKED | 0 |
| Automated supporting NOT-RUN | 2 |
| Human PASS | 0 recorded |
| Human FAIL | 0 recorded |
| Human BLOCKED | 0 recorded |
| Tester |  |
| UAT execution date |  |
| Business owner approval |  |
| Final sign-off |  |


## Automated supporting checks

The existing automated suites were reviewed to avoid duplication. The following checks were executed:

- Full Playwright matrix: **185 passed, 0 failed**
- Real system workflow: **7 passed, 0 failed** against isolated `pawconnect_test`
- Backend unit tests: **32 passed, 0 failed**
- Backend API integration: **1 passed, 0 failed** against isolated `pawconnect_test`
- Combined automated executions: **225 passed, 0 failed, 0 blocked**
- Per-case mapping: [UAT_TEST_RESULTS.md](./UAT_TEST_RESULTS.md)
- Consolidated test report: [TEST_REPORT.md](../TEST_REPORT.md)
- Supporting logs: [full Playwright](./full-playwright.log), [backend unit](./backend-unit.log), [backend integration](./backend-integration.log), [real system](../system-testing/system-test-run.log)
- Reports: [full Playwright report](../../testing/playwright-report/index.html), [real system report](../system-testing/playwright-report/index.html)


## Requirements traceability

The acceptance cases cover the repository's documented adopter capabilities: account creation, sign-in, password reset, animal browse/filter/detail, applications, withdrawal, appointments, history, profile updates, logout, and session protection. They also cover administrator dashboard access, animal and medical-record maintenance, application decisions, appointment state changes, adoption completion, and history. Cross-cutting navigation and role/ownership protection are included separately.

Source references used for planning:

- [Project proposal](../../docs/CSE_5324_001_Project_Proposal_Fall_2026-Group4.pdf)
- [Project progress report](../../docs/CSE_5324_001_Project_Progress_Report_Fall_2026_Group4.pdf)
- [Repository requirements and feature summary](../../README.md)
- [Application routes](../../frontend/src/routes.ts)
- [Backend route implementation](../../backend/src/routes)
- [Existing frontend E2E tests](../../frontend/tests/e2e)
- [Existing backend tests](../../backend/tests)

