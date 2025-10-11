# Deployment Guide - JamJudge

## Prerequisites

1. **Node.js**: Version 22.12+ (dla Cloud Functions) lub 20.19+ (dla frontendu)
   - Sprawdź wersję: `node --version`
   - Jeśli masz starszą wersję, zaktualizuj: https://nodejs.org/

2. **Firebase CLI**: 
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

## Initial Setup

1. **Initialize Firebase in your project** (jeśli jeszcze nie zrobione):
   ```bash
   firebase init
   ```
   
   Wybierz:
   - ✅ Firestore
   - ✅ Functions (Node.js, TypeScript)
   - ✅ Hosting
   
   Połącz z projektem Firebase lub utwórz nowy.

2. **Configure .firebaserc** (jeśli nie powstał automatycznie):
   ```bash
   cp .firebaserc.example .firebaserc
   # Edytuj plik i wpisz swój Firebase Project ID
   ```

## Deploy Everything

### Full deployment (Functions + Hosting + Firestore Rules):
```bash
npm run build
firebase deploy
```

### Deploy only specific parts:

#### 1. Deploy Cloud Functions:
```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

#### 2. Deploy Hosting (Frontend):
```bash
npm run build
firebase deploy --only hosting
```

#### 3. Deploy Firestore Rules:
```bash
firebase deploy --only firestore:rules
```

## Local Development

### Frontend development:
```bash
npm run dev
```
Application runs on http://localhost:5173

### Test Cloud Functions locally (emulators):
```bash
# Terminal 1 - Start emulators
firebase emulators:start

# Terminal 2 - Start frontend with emulators config
npm run dev
```

Don't forget to uncomment emulator configuration in `src/firebase.ts` and set environment variables.

## Cloud Functions

The following Cloud Functions are implemented:

### `forceUnlockProject`
- **Type**: HTTPS Callable
- **Authorization**: Organizer only
- **Purpose**: Temporarily unlock a submitted project

See `/functions/README.md` for detailed documentation.

## Troubleshooting

### Node version mismatch
If you see warnings about Node.js version:
- **Local development**: Node 18+ works, but upgrade to 20.19+ or 22.12+ is recommended
- **Cloud Functions**: Will run on Node 22 on Firebase servers (configured in functions/package.json)

### Build errors
```bash
# Clean and rebuild
rm -rf node_modules dist functions/node_modules functions/lib
npm install
cd functions && npm install && cd ..
npm run build
```

### Functions deployment fails
```bash
# Check Firebase CLI version
firebase --version

# Update Firebase CLI
npm install -g firebase-tools@latest

# Check functions logs
firebase functions:log
```

## Monitoring

### View logs:
```bash
# All functions
firebase functions:log

# Specific function
firebase functions:log --only forceUnlockProject
```

### View usage:
https://console.firebase.google.com/project/YOUR_PROJECT_ID/functions

## Security

- Firestore Rules are in `firestore.rules`
- All Cloud Functions check authentication and authorization
- Audit logs are automatically created for administrative actions

## CI/CD

For automated deployment, add Firebase token to your CI:
```bash
firebase login:ci
# Copy the token to your CI environment variables as FIREBASE_TOKEN
```

Then in CI:
```bash
firebase deploy --token "$FIREBASE_TOKEN"
```

