# JamJudge Cloud Functions

Cloud Functions for JamJudge application.

## Setup

1. Install dependencies:
```bash
cd functions
npm install
```

2. Build TypeScript:
```bash
npm run build
```

## Development

### Local testing with emulators:
```bash
npm run serve
```

### Deploy to Firebase:
```bash
npm run deploy
```

## Functions

### `forceUnlockProject`

**Type:** HTTPS Callable

**Purpose:** Temporarily unlocks a submitted project to allow editing

**Authorization:** Organizer only

**Request:**
```typescript
{
  projectId: string;
  reason: string;
  unlockMinutes?: number; // default: 60
}
```

**Response:**
```typescript
{
  projectId: string;
  forceUnlockUntil: number; // epoch ms
}
```

**Errors:**
- `unauthenticated`: User not logged in
- `permission-denied`: User is not an organizer
- `invalid-argument`: Invalid request parameters
- `not-found`: Project not found
- `failed-precondition`: Project is not submitted

**Audit:** Creates an audit log entry with action `forceUnlockProject`

## Project Structure

```
functions/
├── src/
│   └── index.ts          # Main functions file
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── README.md            # This file
```

## Security

- All functions require authentication
- Role-based authorization via Firestore `users` collection
- Input validation for all parameters
- Audit logging for administrative actions

## Notes

- Functions use Firebase Admin SDK v13+
- Node.js version: 22
- TypeScript strict mode enabled

