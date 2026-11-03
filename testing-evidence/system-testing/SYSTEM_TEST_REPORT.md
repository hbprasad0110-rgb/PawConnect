# PawConnect System Testing Report

## Scope

Real Playwright browser tests were executed against the React frontend and Express backend using the dedicated MySQL database `pawconnect_test`. The test database was dropped, recreated, migrated, and seeded before the final run. The test workflow uses unique adopter data per run and does not stub API calls.

## Execution summary

- Final result: **7 passed, 0 failed, 0 blocked**
- Duration: 16.9 seconds
- Browser: Playwright Desktop Chrome/Chromium
- Database setup result: `{"database":"pawconnect_test","users":4,"animals":12}`
- Production source changes: none for this system-testing implementation

## Test cases

| ID | Description | Expected result | Actual result | Status | Evidence |
|---|---|---|---|---|---|
| SYS-001 | Anonymous user attempts protected admin access, invalid login, and empty registration submission | Protected route redirects to login; invalid credentials show an error; required-field validation is shown | Admin route redirected to login; invalid login message and registration validation messages displayed | PASS | [Run log](./system-test-run.log), [HTML report](./playwright-report/index.html) |
| SYS-002 | Adopter registration, animal search/detail navigation, invalid empty application, Buddy application, and Luna application | Registration succeeds; animal search/detail works; invalid application is rejected; valid applications are submitted as pending | Account created; Buddy and Luna were found and opened; empty submission showed validation; both applications were submitted and pending | PASS | [Run log](./system-test-run.log), [HTML report](./playwright-report/index.html) |
| SYS-003 | Adopter logout and duplicate registration | Logout ends the session; reusing the same email is rejected | Logout succeeded; duplicate registration displayed the existing-email error | PASS | [Run log](./system-test-run.log), [HTML report](./playwright-report/index.html) |
| SYS-004 | Admin rejects Luna and approves Buddy | Admin can review both applications and apply the corresponding decisions | Luna became rejected; Buddy became approved | PASS | [Run log](./system-test-run.log), [HTML report](./playwright-report/index.html) |
| SYS-005 | Adopter views approved status, schedules a future appointment, and views appointments | Approved application can schedule a valid slot; confirmation appears in My Appointments | Buddy approval was visible; a future weekday slot was selected; appointment request succeeded and My Appointments opened | PASS | [Run log](./system-test-run.log), [HTML report](./playwright-report/index.html) |
| SYS-006 | Admin confirms appointment, marks it completed, finalizes adoption, and views admin history | Appointment transitions through confirmed/completed; adoption completion creates a history record | Buddy appointment was confirmed, completed, finalized with notes/checklist, and visible in Adoption History | PASS | [Run log](./system-test-run.log), [HTML report](./playwright-report/index.html) |
| SYS-007 | Adopter views adoption history and logs out | Completed adoption is visible; protected route redirects after logout | Buddy was visible in adopter history; logout succeeded; My Applications redirected to login | PASS | [Run log](./system-test-run.log), [HTML report](./playwright-report/index.html) |

## Evidence index

- [Database setup log](./database-setup.log)
- [Final Playwright run log](./system-test-run.log)
- [Playwright JSON results](./playwright-results.json)
- [Playwright HTML report](./playwright-report/index.html)
- [System workflow source](../../frontend/tests/e2e/system-real-workflow.spec.ts)
- [System Playwright configuration](../../frontend/playwright.system.config.ts)
- [Dedicated database setup script](../../backend/scripts/prepare-system-test-db.mjs)

The final run had no failures, so Playwright did not generate failure screenshots, videos, or traces for the final run. Earlier test-script locator failures were corrected and are not reported as application failures.
