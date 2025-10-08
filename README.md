## JamJudge

[![Node](https://img.shields.io/badge/node-%E2%89%A522.x-339933?logo=node.js)](https://nodejs.org/) [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/) [![Ant%20Design](https://img.shields.io/badge/Ant%20Design-5-0170FE?logo=antdesign&logoColor=white)](https://ant.design/) [![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore%20%7C%20Storage-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

### Table of contents

- [1. Project name](#1-project-name)
- [2. Project description](#2-project-description)
- [3. Tech stack](#3-tech-stack)
- [4. Getting started locally](#4-getting-started-locally)
- [5. Available scripts](#5-available-scripts)
- [6. Project scope](#6-project-scope)
- [7. Project status](#7-project-status)
- [8. License](#8-license)

### 1. Project name

JamJudge

### 2. Project description

JamJudge is a platform for running hackathons and project jams. It enables:

- Team registration and project submissions by participants
- Jury scoring against organizer-defined weighted criteria (e.g., Innovation, Execution, UX)
- Organizer administration of events, schedules, and roles; publication of results
- Public feedback from the jury visible to teams, with private staff-only discussions planned

Key goals include reliability during event days, basic mobile-friendly UX, and transparent results. See the detailed PRD for roles, flows, and non-functional requirements: [`doc/JamJudge_WymaganiaBiznesowe.md`](doc/JamJudge_WymaganiaBiznesowe.md).

### 3. Tech stack

- React 19 + TypeScript, Vite 7
- Ant Design 5 (UI components)
- Firebase modular SDK: Auth, Firestore, Storage (Cloud Functions and Hosting planned)
- Tooling: ESLint 9, Prettier 3, Husky 9, lint-staged, TypeScript 5.8
- Node.js: >= 22 (`.nvmrc` set to 22)

Additional engineering guidelines and proposed structure are documented in [`doc/TECH_GUIDELINES.md`](doc/TECH_GUIDELINES.md).

### 4. Getting started locally

#### Prerequisites

- Node.js 22.x (`.nvmrc` provided)
- npm (this repo uses `package-lock.json`)

#### Install

```bash
nvm use # ensures Node 22
npm ci # or: npm install
```

#### Configure environment

Create a `.env.local` file in the repository root with your Firebase Web App credentials:

```bash
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_AUTH_DOMAIN="..."
VITE_FIREBASE_PROJECT_ID="..."
VITE_FIREBASE_STORAGE_BUCKET="..."
VITE_FIREBASE_MESSAGING_SENDER_ID="..."
VITE_FIREBASE_APP_ID="..."
# Optional
VITE_FIREBASE_MEASUREMENT_ID="..."
```

Notes:

- The app initializes Firebase from `src/firebase.ts` using the variables above.
- For local development with emulators, you may add (currently commented in code):
  - `VITE_FIREBASE_USE_EMULATORS=true`
  - `VITE_EMULATOR_HOST=localhost`
  - `VITE_EMULATOR_AUTH_PORT=9099`
  - `VITE_EMULATOR_FIRESTORE_PORT=8080`
  - `VITE_EMULATOR_STORAGE_PORT=9199`

#### Run

```bash
npm run dev
# open http://localhost:5173
```

#### Build and preview

```bash
npm run build
npm run preview
```

### 5. Available scripts

- **dev**: Start the Vite dev server
- **build**: Type-check and build the production bundle (`tsc -b && vite build`)
- **preview**: Preview the production build locally
- **lint**: Run ESLint
- **lint:fix**: Run ESLint with auto-fix
- **format**: Run Prettier formatting
- **check-types**: Type-check only (no emit)
- **prepare**: Husky setup hook

### 6. Project scope

See the MVP definition in [`doc/JamJudge_MVP.md`](doc/JamJudge_MVP.md) and the full PRD in [`doc/JamJudge_WymaganiaBiznesowe.md`](doc/JamJudge_WymaganiaBiznesowe.md).

MVP includes:

- Participant and team registration; edit team details until submission
- Project submission with description, repo/demo links, and media; edit until deadline or final submit
- Jury scoring per weighted criteria with automatic total score (weighted average)
- Organizer basics: create event, define timelines and criteria, manage roles, publish results
- Summary views: project ranking after scoring, project details with public feedback
- Access control aligned to roles

Out of scope for MVP:

- Mentor role and private mentor notes
- Private staff-only threaded discussions beyond essentials
- Advanced public project catalog with extensive filters/tags (basic list and card only)
- Export to CSV/PDF and advanced analytics
- Complex multi-event management in a single deployment
- External integrations (SSO, analytics, webhooks) and custom branding beyond default AntD

### 7. Project status

- PRD and technical guidelines established (guidelines status: v1 for MVP)
- Codebase scaffolded with React + TS + Vite, AntD, and Firebase initialization (`src/firebase.ts`)
- Local development workflow ready; CI/CD and testing suites planned per guidelines

### 8. License

License: TBD

If you intend to open-source this project, add a `LICENSE` file (e.g., MIT) and update this section.
