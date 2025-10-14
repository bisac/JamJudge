# E2E Tests

End-to-end tests for JamJudge using Playwright and Firebase Emulators.

## Setup

1. Install dependencies:
```bash
npm install
npx playwright install --with-deps
```

2. Ensure Node.js 22+ is active:
```bash
nvm use 22
```

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode
npm run test:e2e:ui

# Clean up hanging processes (emulators, report servers)
npm run test:e2e:cleanup
```

## Test Scenarios

### ✅ Implemented Tests

1. **Login with Invalid Credentials** (`auth.login-invalid.spec.ts`)
   - Tests error handling for wrong email/password
   - Verifies Polish error message displays correctly

2. **Leaderboard with Published Results** (`leaderboard.published.spec.ts`)
   - Seeds event and publicResults data via Firestore REST API
   - Verifies leaderboard table renders with correct data
   - Status: Partially working (may need debugging)

### ⏭️ Skipped Tests

3. **Pending Activation Page** (`auth.login-success-pending-activation.spec.ts`)
   - Requires creating user in Auth without Firestore profile
   - Complex setup - recommended for manual testing
   - Manual test steps documented in file

## Architecture

- **Firebase Emulators**: Auth (port 9098) + Firestore (port 8081)
- **Test Rules**: `firestore.test.rules` (allows all operations)
- **App Connection**: Automatic when `projectId === "demo-test"`
- **Vite Dev Server**: Runs on port 5173 during tests

## Troubleshooting

### Ports Already in Use

Run cleanup script:
```bash
npm run test:e2e:cleanup
```

### Tests Timeout

- Check if emulators started correctly
- Verify Vite dev server is running
- Check browser console in Playwright trace

### Data Not Visible

- Firestore REST API seeding may need more wait time
- Check `firestore.test.rules` allows writes
- Verify emulator is using test rules, not production rules

## Files

- `e2e/playwright.config.ts` - Playwright configuration
- `e2e/*.spec.ts` - Test files
- `firestore.test.rules` - Permissive rules for testing
- `scripts/cleanup-e2e.sh` - Process cleanup script

