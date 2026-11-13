# PawConnect Automated UAT-Supporting Test Results

## Scope and interpretation

This file records machine-executed evidence supporting the 24 human UAT cases in [UAT_TEST_CASES.md](./UAT_TEST_CASES.md). These results do **not** constitute human UAT approval. Human tester, human observation, human status, and business sign-off remain blank/not-run in the UAT plan.

## Execution summary

| Suite | Environment / scope | Result |
|---|---|---|
| Full Playwright matrix | React + Express test server; Chromium, Firefox, WebKit, tablet, mobile; real system workflow excluded from this parallel matrix to protect shared DB data | 185 passed, 0 failed |
| Real system workflow | React + Express + MySQL `pawconnect_test`; serial Chrome workflow | 7 passed, 0 failed |
| Backend unit tests | Express/domain/security/validation unit coverage | 32 passed, 0 failed |
| Backend API integration | Isolated `pawconnect_test`; registration through adoption completion | 1 passed, 0 failed |
| **Total automated executions** | **Distinct suite executions, not unique requirements** | **225 passed, 0 failed, 0 blocked** |

## Per-case automated results

`PASS` below means automated supporting evidence passed for the stated scope. It is not a human UAT sign-off. `NOT-RUN` means no automated result was available for the complete acceptance scenario; the case remains for human execution.

| Test ID | Requirement / scenario | Actual automated result | Status | Evidence |
|---|---|---|---|---|
| UAT-ADP-001 | Registration | Real SYS-002 registration and existing workflow registration passed. | PASS | [system log](../system-testing/system-test-run.log), [full Playwright log](./full-playwright.log) |
| UAT-ADP-002 | Registration validation | Required-field and short phone/address validation passed in the browser suite. | PASS | [full Playwright log](./full-playwright.log) |
| UAT-ADP-003 | Duplicate registration | Real SYS-003 duplicate email rejection and API integration duplicate registration passed. | PASS | [system log](../system-testing/system-test-run.log), [backend integration log](./backend-integration.log) |
| UAT-ADP-004 | Valid/invalid login | Mocked browser valid/invalid login and real system invalid login passed. | PASS | [full Playwright log](./full-playwright.log), [system log](../system-testing/system-test-run.log) |
| UAT-ADP-005 | Animal search/filter | Browser search/filter and empty-state recovery passed across the configured matrix. | PASS | [full Playwright log](./full-playwright.log) |
| UAT-ADP-006 | Animal profile/medical information | Browser detail navigation and real Buddy profile/medical information checks passed. | PASS | [full Playwright log](./full-playwright.log), [system log](../system-testing/system-test-run.log) |
| UAT-ADP-007 | Adoption application submission | Real Buddy/Luna submission and mocked validation/submission scenarios passed. | PASS | [system log](../system-testing/system-test-run.log), [full Playwright log](./full-playwright.log) |
| UAT-ADP-008 | Application validation/duplicate protection | Empty-form browser validation and duplicate-application API integration checks passed. | PASS | [full Playwright log](./full-playwright.log), [backend integration log](./backend-integration.log) |
| UAT-ADP-009 | Application status/withdrawal | API integration exercised application status and withdrawal; browser status coverage passed. | PASS | [backend integration log](./backend-integration.log), [full Playwright log](./full-playwright.log) |
| UAT-ADP-010 | Appointment scheduling | Real appointment request and mocked booking workflow passed. | PASS | [system log](../system-testing/system-test-run.log), [full Playwright log](./full-playwright.log) |
| UAT-ADP-011 | Appointment conflict prevention | Mocked browser conflict scenario and backend overlapping-appointment integration check passed. | PASS | [full Playwright log](./full-playwright.log), [backend integration log](./backend-integration.log) |
| UAT-ADP-012 | Appointment cancellation | Appointment state-machine tests passed for cancellation; no separate human/browser cancellation execution was recorded. | PASS | [backend unit log](./backend-unit.log) |
| UAT-ADP-013 | Profile management | Browser profile update and protected-profile checks passed across the matrix. | PASS | [full Playwright log](./full-playwright.log) |
| UAT-ADP-014 | Password reset security | Password-reset request and invalid/expired-token browser checks passed. | PASS | [full Playwright log](./full-playwright.log), [backend unit log](./backend-unit.log) |
| UAT-ADP-015 | Logout/session management | Real logout/protected-route workflow and mocked expiry/security checks passed. | PASS | [system log](../system-testing/system-test-run.log), [full Playwright log](./full-playwright.log) |
| UAT-ADP-016 | Adoption history | Real adopter history check and API adoption workflow passed. | PASS | [system log](../system-testing/system-test-run.log), [backend integration log](./backend-integration.log) |
| UAT-ADM-001 | Administrator access/dashboard | Admin smoke workflow and role-protection checks passed. | PASS | [full Playwright log](./full-playwright.log), [backend unit log](./backend-unit.log) |
| UAT-ADM-002 | Animal management | No existing automated test directly covered add/edit animal acceptance flow; implementation is not a test result. | NOT-RUN | Human execution required. |
| UAT-ADM-003 | Medical-record maintenance | No existing automated test directly covered add/edit medical-record acceptance flow; implementation is not a test result. | NOT-RUN | Human execution required. |
| UAT-ADM-004 | Application approval/rejection | Real admin decision flow and mocked approval/rejection checks passed. | PASS | [system log](../system-testing/system-test-run.log), [full Playwright log](./full-playwright.log) |
| UAT-ADM-005 | Appointment administration | Real confirm/complete flow and backend appointment state transitions passed. | PASS | [system log](../system-testing/system-test-run.log), [backend unit log](./backend-unit.log) |
| UAT-ADM-006 | Adoption completion/history | Real finalization/history flow and backend end-to-end integration passed. | PASS | [system log](../system-testing/system-test-run.log), [backend integration log](./backend-integration.log) |
| UAT-ADM-007 | Role/record protection | Browser role guards and backend authentication/role tests passed. | PASS | [full Playwright log](./full-playwright.log), [backend unit log](./backend-unit.log) |
| UAT-COM-001 | Navigation/usability | Navigation, responsive viewport, overflow, and accessibility checks passed in the full matrix. | PASS | [full Playwright log](./full-playwright.log) |

## Failure investigation and rerun

The first full-matrix attempt ran the real serial database workflow in all five browser projects. That caused shared test-data mutation and exposed four test-only failures: two strict heading locators and two later runs finding an already-adopted animal. The application workflow itself had already passed in the dedicated serial system configuration.

Test-only corrections:

- Excluded `system-real-workflow.spec.ts` from the parallel browser matrix; it remains executed by `playwright.system.config.ts` as a dedicated serial real-system suite.
- Made the Buddy heading locator exact.

After the corrections, the full matrix was rerun and passed **185/185**. The dedicated real-system suite remained **7/7 passed**.

## Evidence index

- [Full Playwright log](./full-playwright.log)
- [Full Playwright HTML report](../../testing/playwright-report/index.html)
- [Full Playwright JSON results](../../testing/playwright-results.json)
- [Real system log](../system-testing/system-test-run.log)
- [Real system HTML report](../system-testing/playwright-report/index.html)
- [Backend unit log](./backend-unit.log)
- [Backend integration log](./backend-integration.log)
- [Full-matrix database setup log](./full-e2e-db-setup.log)
