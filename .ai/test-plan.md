# E2E Test Implementation Plan (Firebase Emulators)

## Overview
This plan defines E2E tests implemented with Playwright Test and Firebase Emulators. The scope focuses on authentication flows and public leaderboard, maximizing stability with real Firebase SDK behavior.

## Technology
- **Playwright Test** (TypeScript) - E2E testing framework
- **Firebase Emulators** - Auth (port 9098) + Firestore (port 8081)
- **Vite Dev Server** - App served on port 5173
- **Data Seeding** - Firestore REST API for test data setup

## Test Scenarios

### 1. ✅ Login – Invalid Credentials (IMPLEMENTED)
**Status:** Fully working
**File:** `e2e/auth.login-invalid.spec.ts`

Tests that invalid login credentials show a user-friendly error message in Polish.

**Steps:**
1. Navigate to `/auth/login`
2. Fill in invalid email and password
3. Click "Zaloguj się" button
4. Assert error message: "Nieprawidłowy email lub hasło."

**Implementation:**
- Uses Firebase Auth Emulator
- No mocking required - real Firebase SDK behavior
- Error message comes from `utils/firebaseErrors.ts`

---

### 2. ⚠️ Leaderboard – Published Results (PARTIALLY WORKING)
**Status:** Implemented, may need debugging
**File:** `e2e/leaderboard.published.spec.ts`

Tests that published leaderboard results render correctly in a table.

**Steps:**
1. Seed data via Firestore REST API:
   - Create event with `resultsPublishedAt` timestamp
   - Create 2 publicResults documents with rank, projectName, teamName, totalScore
2. Navigate to `/leaderboard`
3. Assert heading contains "Leaderboard"
4. Assert project names, team names, and scores are visible

**Implementation:**
- Seeds data using Playwright `request` fixture
- Firestore REST API: `POST http://localhost:8081/v1/projects/demo-test/databases/(default)/documents/{collection}`
- Uses `firestore.test.rules` (allows all operations)
- May need additional wait time for data to be available

**Known Issues:**
- Data seeding timing - may need longer wait after POST requests
- App may show spinner if data not loaded in time

---

### 3. ⏭️ Login Success → Pending Activation (SKIPPED)
**Status:** Skipped - too complex for MVP
**File:** `e2e/auth.login-success-pending-activation.spec.ts`

**Scenario:**
User logs in successfully but has no profile document in Firestore, should see "Pending Activation" page.

**Why Skipped:**
- Requires creating user in Auth Emulator without corresponding Firestore profile
- Complex setup with Firebase SDK in test context
- `page.evaluate` cannot import ES modules
- External seeding scripts add complexity

**Recommended Approach:**
Manual testing or integration test with proper Firebase Admin SDK setup.

**Manual Test Steps:**
1. Create user in Firebase Auth (emulator or console)
2. Do NOT create document in `users/{uid}` collection
3. Login with that user
4. Verify PendingActivationPage shows "Twoje konto oczekuje na aktywację"
5. Verify "Wyloguj się" button is visible

---

## Implementation Details

### Firebase Emulator Configuration

**firebase.json:**
```json
{
  "emulators": {
    "auth": { "port": 9098 },
    "firestore": { 
      "port": 8081,
      "rules": "firestore.test.rules"
    },
    "singleProjectMode": true
  }
}
```

**firestore.test.rules:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### App Configuration

**src/firebase.ts:**
```typescript
// Auto-connect to emulators when projectId === "demo-test"
if (firebaseConfig.projectId === "demo-test") {
  connectAuthEmulator(auth, "http://localhost:9098");
  connectFirestoreEmulator(db, "localhost", 8081);
}
```

### Playwright Configuration

**e2e/playwright.config.ts:**
- `baseURL`: `http://localhost:5173` (Vite dev server)
- `webServer`: Runs `npm run dev` with dummy Firebase env vars
- `workers`: 1 (sequential execution to avoid emulator conflicts)
- Projects: Chromium only (for simplicity)

---

## Scripts

**package.json:**
```json
{
  "scripts": {
    "test:e2e": "firebase emulators:exec --only auth,firestore --project demo-test 'playwright test -c e2e/playwright.config.ts'",
    "test:e2e:ui": "firebase emulators:exec --only auth,firestore --project demo-test 'playwright test --ui -c e2e/playwright.config.ts'",
    "test:e2e:cleanup": "./scripts/cleanup-e2e.sh"
  }
}
```

**Cleanup Script:**
`scripts/cleanup-e2e.sh` - Kills hanging emulator and report processes on ports 8081, 9098, 4400, 4401, 4500, 4501, 9150.

---

## Running Tests

### Prerequisites
```bash
# Install dependencies
npm install
npx playwright install --with-deps

# Use Node.js 22+
nvm use 22
```

### Execute Tests
```bash
# Run all tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Clean up hanging processes
npm run test:e2e:cleanup
```

---

## File Structure

```
e2e/
├── playwright.config.ts          # Playwright configuration
├── auth.login-invalid.spec.ts    # ✅ Login error test
├── leaderboard.published.spec.ts # ⚠️ Leaderboard test
├── auth.login-success-pending-activation.spec.ts # ⏭️ Skipped
└── README.md                      # Detailed documentation

firestore.test.rules               # Permissive rules for testing
scripts/cleanup-e2e.sh             # Process cleanup utility
```

---

## Lessons Learned

### ✅ What Worked Well
1. **Firebase Emulators** - Provide real SDK behavior without mocking
2. **Single working test** - Better than complex, brittle mocks
3. **Firestore REST API** - Simple way to seed data
4. **Cleanup script** - Essential for hanging processes

### ❌ What Didn't Work
1. **Network interception mocks** - Too fragile, SDK uses complex protocols
2. **In-browser seeding** - `page.evaluate` cannot import ES modules
3. **Complex multi-step scenarios** - Require proper test infrastructure

### 💡 Recommendations
1. Keep E2E tests simple and focused
2. Use emulators for realistic Firebase behavior
3. Accept that some scenarios are better as manual tests
4. Invest in proper test data management for complex scenarios
5. Consider Firebase Admin SDK for advanced test setup

---

## Future Improvements

1. **Data Management**
   - Create reusable seeding utilities
   - Use Firebase Admin SDK for complex setups
   - Consider emulator data import/export

2. **More Tests**
   - Participant dashboard with team data
   - Jury evaluation flow
   - Organizer project management

3. **CI/CD Integration**
   - Run tests in GitHub Actions
   - Store test artifacts
   - Parallel execution with proper isolation

4. **Test Stability**
   - Add retry logic for flaky tests
   - Improve wait strategies
   - Better error messages

---

## Summary

**Implemented:** 1 fully working test (login error)
**Partial:** 1 test with seeding (leaderboard)
**Skipped:** 1 complex scenario (pending activation)

**Result:** Functional E2E test suite with room for growth. Focus on simple, stable tests rather than comprehensive but fragile coverage.
