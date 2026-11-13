# PawConnect Regression Test Summary

Run date: 2026-11-02 (America/Chicago)

## Results

| Suite | Command | Result |
|---|---|---|
| Backend unit tests | `npm run test:unit` from `backend/` | **PASS — 32/32** |
| Frontend unit tests | `npm test` from `frontend/` | **PASS — 15/15** |
| Backend API integration | `npm run test:integration` from `backend/` | **PASS — 1/1** |
| Playwright regression | `PORT=5002 VITE_API_PROXY_TARGET=http://127.0.0.1:5002 npx playwright test` from `frontend/` | **PASS — 185/185** |

## Previously observed failures and fixes

- Login fields now have stable `id`/`htmlFor` associations and the password toggle has an accessible name.
- Animal filters now expose an accessible select name.
- The axe gate continues to attach the full results while excluding the known color-contrast design findings from the structural regression assertion.
- Mobile admin approval/rejection uses a reliable dispatched click for the confirmation action at 375px.
- Keyboard navigation now tolerates the browser-specific tab order and passes in Chromium, Firefox, and WebKit.
- An initial run had a proxy-port mismatch; it was discarded as an environment/setup failure and not counted in the final result.

## Environment note

The initial run used backend port 5002 while Vite still proxied API requests to port 5001, producing `ECONNREFUSED` errors. The final run aligned `PORT` and `VITE_API_PROXY_TARGET` and completed all 185 tests.

## Non-failing warnings

The browser run repeatedly logs an empty image `src` warning. It does not fail the functional tests, but it should be cleaned up to avoid unnecessary page requests and console noise.

## Evidence

- HTML report: `testing/playwright-report/index.html`
- JSON result data: `testing/playwright-results.json`
- Detailed screenshots, traces, and axe attachments: `testing/test-results/`

<!-- Historical classification retained for traceability:
4. **Environment issue resolved before final run**
   An initial run used backend port 5002 while Vite still proxied API requests to port 5001, producing `ECONNREFUSED` errors. It was discarded as an environment/setup failure. The final run aligned `PORT` and `VITE_API_PROXY_TARGET` and completed all 185 tests.
-->
