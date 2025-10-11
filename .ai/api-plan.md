## REST API Plan

### 1. Resources

- **users**: Firestore collection `users/{uid}` (profile and role mirror of Firebase Auth)
- **events**: Firestore collection `events/{eventId}` (single active event in MVP)
- **teams**: Firestore collection `teams/{teamId}` with subcollection `teams/{teamId}/members/{uid}`
- **teamNameReservations**: Firestore collection `teamNameReservations/{nameNormalized}` (team name uniqueness gate)
- **projects**: Firestore collection `projects/{projectId}` with subcollections:
  - `projects/{projectId}/attachments/{attachmentId}` (metadata for Firebase Storage files)
  - `projects/{projectId}/evaluations/{jurorId}` (one evaluation per juror)
- **criteria**: Firestore collection `criteria/{criterionId}` (weights and scoring scale)
- **publicResults**: Firestore collection `publicResults/{projectId}` (public leaderboard read-model)
- **audits**: Firestore collection `audits/{auditId}` (administrative actions log)
- **storage objects**: Firebase Storage objects under `projects/{projectId}/{uuid}`

Notes and assumptions:

- Roles use Firebase Auth Custom Claims: `request.auth.token.role ∈ {organizer, jury, participant}`. The `users` doc mirrors basic profile info and may duplicate the role for UI convenience.
- Scoring scale: PRD mentions configurable scales; to support validation, criteria should include `scaleMin` (default 0) and `scaleMax` (default 10). If absent, default to 0–10.
- Feedback: PRD requires jury feedback. We will store it as `feedback: string | null` in `projects/{projectId}/evaluations/{jurorId}`.

### 2. Endpoints

This project is Firebase-first. Most data access is performed directly with the Firebase Web SDK (Firestore/Storage) under Security Rules. A minimal set of Cloud Functions (HTTPS Callable) will implement business actions that require atomic multi-document operations, audits, or privileged validation.

For each resource below, we list: access method (Client Firestore/Storage vs Cloud Function), paths, parameters/payloads, responses, and errors.

#### 2.1 Authentication

- **Method**: Firebase Auth (email/password). No REST endpoint.
- **Client**: `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signOut`, `sendPasswordResetEmail`.
- **Post-registration**: Client creates/updates `users/{uid}` with profile data.
- **Errors**:
  - 400 `auth/invalid-email`, 400 `auth/weak-password`, 409 `auth/email-already-in-use`, 401 `auth/invalid-credential`

#### 2.2 Users

- **Read my profile**
  - Method: Client Firestore read
  - Path: `users/{uid}` (uid = current user)
  - Response JSON: `{ uid, email, displayName, photoURL, role, createdAt, updatedAt }`
  - Errors: 401 if unauthenticated, 403 if accessing other user without privileges

- **Update my profile**
  - Method: Client Firestore write
  - Path: `users/{uid}`
  - Request JSON (partial): `{ displayName?, photoURL? }`
  - Response: updated document
  - Errors: 401/403 per rules

- **Set user role (Organizer only)**
  - Method: Cloud Function (Callable) `setUserRole`
  - Request: `{ targetUid: string, role: 'organizer'|'jury'|'participant' }`
  - Response: `{ success: true, uid: string, role: string }`
  - Errors: 401 unauthenticated, 403 not organizer, 422 invalid role, 404 user not found

#### 2.3 Events

- **List/read events**
  - Method: Client Firestore read (public)
  - Path: `events` or `events/{eventId}`
  - Query params: `limit`, `orderBy=name|createdAt`, `startAfter`
  - Response JSON: array of `{ id, name, timezone, registrationDeadline, submissionDeadline, ratingStartAt, ratingEndAt, resultsPublishedAt, createdBy, createdAt, updatedAt }`

- **Create/update event (Organizer only)**
  - Method: Client Firestore write (secured by rules)
  - Path: `events/{eventId}`
  - Request JSON: basic event fields and deadlines
  - Errors: 403 for non-organizers

#### 2.4 Teams

- **Check/Reserve team name + create team (atomic)**
  - Method: Cloud Function (Callable) `reserveTeamNameAndCreateTeam`
  - Request: `{ eventId: string, name: string, description?: string }`
  - Behavior: normalizes name, creates `teamNameReservations/{nameNormalized}` if not exists, then creates `teams/{teamId}` and adds creator as member under `teams/{teamId}/members/{uid}` within a transaction; returns team.
  - Response: `{ teamId, name, nameNormalized, eventId }`
  - Errors: 409 name taken, 400 invalid name, 401 unauthenticated

- **Read teams for event**
  - Method: Client Firestore read
  - Path: `teams`
  - Query: `where eventId == :eventId orderBy name asc limit N startAfter cursor`
  - Response: array of teams

- **Update team (name/description) until submit**
  - Method: Client Firestore write
  - Path: `teams/{teamId}`
  - Request JSON: `{ name?, description? }` (name changes require new reservation flow; recommended to use function above again to rename safely)
  - Errors: 403 if not organizer nor team member

- **Manage members (Organizer only in MVP)**
  - Method: Client Firestore writes to `teams/{teamId}/members/{uid}`
  - Request JSON: `{ role?: 'member', addedBy: currentUid, createdAt: serverTimestamp }`
  - Errors: 403 if not organizer (per rules)

#### 2.5 Projects

- **Create or update draft project**
  - Method: Client Firestore write
  - Path: `projects/{projectId}`
  - Request JSON: `{ eventId, teamId, name, description?, repoUrl?, demoUrl?, status: 'draft', createdBy }`
  - Response: project doc
  - Errors: 403 if not team member; 422 invalid URLs (client-side validated)

- **Submit project (locks editing)**
  - Method: Cloud Function (Callable) `submitProject`
  - Request: `{ projectId: string }`
  - Behavior: validates requester is team member, event in submission window and before deadline; sets `status='submitted'`, `submittedAt=now` and writes audit entry.
  - Response: `{ projectId, status: 'submitted', submittedAt }`
  - Errors: 403 not member, 409 already submitted, 409 after deadline, 409 wrong event stage

- **Force-unlock submitted project (Organizer)**
  - Method: Cloud Function (Callable) `forceUnlockProject`
  - Request: `{ projectId: string, reason: string, unlockMinutes?: number }`
  - Behavior: writes audit, sets `forceUnlockUntil=now+unlockMinutes` and `status` remains `submitted`; UI allows edits while `forceUnlockUntil>now`; complementary `lockProject` to end early.
  - Response: `{ projectId, forceUnlockUntil }`
  - Errors: 403 not organizer, 422 invalid minutes

- **Lock project again (Organizer)**
  - Method: Cloud Function (Callable) `lockProject`
  - Request: `{ projectId: string, reason?: string }`
  - Behavior: clears `forceUnlockUntil`, writes audit
  - Response: `{ projectId, status }`

- **List projects (Organizer/Jury; Team members see own)**
  - Method: Client Firestore read
  - Paths/queries:
    - by event: `where eventId==X orderBy createdAt desc limit N startAfter`
    - by team: `where teamId==X orderBy updatedAt desc limit N startAfter`

#### 2.6 Attachments (Files)

- **Upload file**
  - Method: Firebase Storage SDK
  - Path: `projects/{projectId}/{uuid}`
  - Metadata: write `projects/{projectId}/attachments/{attachmentId}` with `{ name, storagePath, createdBy, createdAt }`
  - UI: display file size and soft warnings for large files
  - Errors: 403 if not organizer or team member

- **Delete/replace file**
  - Method: Storage delete + Firestore delete of attachment doc

#### 2.7 Criteria

- **List criteria for event (public)**
  - Method: Client Firestore read
  - Path: `criteria`
  - Query: `where eventId == :eventId orderBy name asc`

- **Manage criteria (Organizer)**
  - Method: Client Firestore writes
  - Path: `criteria/{criterionId}`
  - Request JSON: `{ eventId, name, weight, scaleMin?: number=0, scaleMax?: number=10 }`
  - Errors: 403 non-organizer; 409 if editing after rating started (enforced in UI; optionally in functions if we add a guard)

#### 2.8 Evaluations (Jury)

- **Upsert my evaluation for a project**
  - Method: Client Firestore write
  - Path: `projects/{projectId}/evaluations/{jurorId}` where `jurorId=current uid`
  - Request JSON: `{ jurorId, scores: { [criterionId]: number }, feedback?: string|null, totalWeighted?: number }`
  - Behavior: client validates each score within criterion scale; client may compute and write `totalWeighted` for convenience. Server recomputation happens at publish time to ensure correctness.
  - Errors: 403 if not jury, 422 if score out of range (client-side)

- **List my evaluations**
  - Method: Client Firestore collection group query
  - Query: `collectionGroup('evaluations').where('jurorId','==',uid).orderBy('updatedAt','desc')`

- **Freeze evaluations after deadline**
  - Method: Enforced by UI and optionally a Cloud Function guard during submit/publish; Firestore Rules remain permissive in MVP per plan.

#### 2.9 Leaderboard publication

- **Publish results (Organizer)**
  - Method: Cloud Function (Callable) `publishResults`
  - Request: `{ eventId: string }`
  - Behavior: for each project in event, recompute weighted scores from `evaluations.scores` using current `criteria.weight` and `criteria.scale*`, calculate per-juror weighted total, then the project total as the mean of juror totals; round to 2 decimals; write/update `publicResults/{projectId}` with `{ eventId, projectId, totalScore, rank }`. Write audit and set `events/{eventId}.resultsPublishedAt=now`.
  - Response: `{ eventId, published: number }` (count of results)
  - Errors: 403 not organizer, 409 rating not ended, 500 computation error

- **Republish results (Organizer)**
  - Method: Cloud Function (Callable) `republishResults`
  - Request: `{ eventId: string, reason?: string }`
  - Behavior: recompute and overwrite `publicResults` with audit trail

- **Public ranking (no auth)**
  - Method: Client Firestore read
  - Path: `publicResults`
  - Query: `where eventId==:eventId orderBy totalScore desc limit N startAfter`

### 3. Authentication and Authorization

- **Identity**: Firebase Auth with ID tokens automatically sent in Callable Functions; Firestore Security Rules enforce read/write permissions per role and membership.
- **Roles**: Custom Claims `role` set by `setUserRole` function. The client refreshes token after role updates.
- **Security Rules (high level)**:
  - users: read/write self; organizers can read/write all
  - events: public read; write organizer-only
  - teams: read by organizers, jury, and team members; create by signed-in creator or organizer; update/delete by organizer or team member; members subcollection create/update/delete organizer-only (MVP)
  - teamNameReservations: create only if docId free; delete organizer-only
  - projects: read by organizers, jury, and team members; create by team members or organizer; update/delete by organizer or team member
  - attachments: read/write by organizer or project team members
  - evaluations: read/write by organizer or the juror matching `jurorId` (doc id)
  - criteria: public read; organizer write
  - publicResults: public read; organizer write
- **Additional protections**:
  - Enable Firebase App Check for callable functions and Storage to mitigate abuse
  - Cloud Functions verify roles server-side (do not trust client claims)
  - Keep an audit log document for administrative actions (unlock/publish/republish)

### 4. Validation and Business Logic

- **users**
  - Email format validated by Firebase Auth; profile fields length-limited in client
- **events**
  - Deadlines must be `Timestamp` or null; enforce chronological consistency in UI
- **teams**
  - `name` required; `nameNormalized` is lowercase-trimmed; uniqueness guaranteed by `teamNameReservations/{nameNormalized}`
  - Rename requires new reservation flow to avoid collisions
- **projects**
  - `repoUrl`/`demoUrl` must be `https://` URLs; validated client-side
  - `status ∈ {'draft','submitted'}`; `submittedAt` set by `submitProject`
  - Editing blocked in UI after submit; Organizer may temporarily unlock (window via `forceUnlockUntil`)
- **attachments**
  - Store `storagePath`; show soft warnings for large files; no hard limits in MVP
- **criteria**
  - `weight` positive; sum of weights recommended to be 100; normalization applied during computation if not 100
  - `scaleMin`, `scaleMax` define allowed score ranges
- **evaluations**
  - One document per `(projectId, jurorId)` (doc id = jurorId)
  - Each `scores[criterionId]` must be within criterion scale; UI enforces; function recomputes during publish
  - `feedback` optional string; visible to team only after publish (team UI must hide before publish)
- **leaderboard (publishResults)**
  - Deterministic computation: for each juror, `weightedTotal = sum(score_i / scaleMax_i * weight_i)`; normalize weights to sum 1 if not 100; project total = average of juror `weightedTotal`; round to 2 decimals; stable sort ties by `projectId`
  - Writes `publicResults` and sets `resultsPublishedAt`

### 5. Pagination, Filtering, Sorting

- Use Firestore `limit` and cursor-based pagination with `startAfter` doc snapshot or field value.
- Supported queries (ensure composite indexes):
  - teams by event ordered by name
  - projects by event ordered by createdAt desc
  - projects by team ordered by updatedAt desc
  - criteria by event ordered by name
  - publicResults by event ordered by totalScore desc
  - evaluations (collection group) by juror ordered by updatedAt desc

### 6. Errors and Status Codes

For Client Firestore/Storage operations, errors are surfaced as Firebase error codes (e.g., `permission-denied`, `not-found`). For Callable Functions, use HTTP semantics in responses:

- 200 `{ success: true, ... }`
- 400 Bad Request (validation)
- 401 Unauthorized (not signed in)
- 403 Forbidden (insufficient role)
- 404 Not Found (missing entity)
- 409 Conflict (name taken, already submitted, wrong stage)
- 422 Unprocessable Entity (invalid field values)
- 429 Too Many Requests (rate limited)
- 500 Internal Error

Error payload example:

```json
{
  "error": {
    "code": 409,
    "message": "Team name already taken",
    "details": { "name": "Foo" }
  }
}
```

### 7. Rate Limiting and Security

- **Callable Functions**: per-IP and per-UID rate limiting (e.g., 10 req/min) using in-function counters (Firestore/Redis alternative) or Google Cloud Armor if exposing HTTPS endpoints.
- **Abuse protection**: Enable App Check; reject calls without valid App Check token.
- **Input validation**: Reject overlong strings, invalid URLs, and unexpected keys.
- **Auditing**: Write `audits/{auditId}` entries for `setUserRole`, `forceUnlockProject`, `publishResults`, `republishResults`.

### 8. Do we need a traditional REST API?

- **Conclusion**: A separate REST API is not needed for the MVP. Firestore/Storage plus Security Rules satisfy CRUD and access control. Business workflows that require atomicity or privileged checks are implemented via a small set of **Cloud Functions (Callable)**:
  - `setUserRole`
  - `reserveTeamNameAndCreateTeam`
  - `submitProject`
  - `forceUnlockProject`
  - `lockProject`
  - `publishResults`
  - `republishResults`
- This minimizes backend surface area, leverages Firebase scalability, and keeps the frontend simple (React + Firebase SDK). A REST facade can be added later if needed (e.g., for third-party integrations).

### 9. Example Request/Response Payloads

- `reserveTeamNameAndCreateTeam` request:

```json
{
  "eventId": "evt_2025",
  "name": "Rocket Cats",
  "description": "We build fast."
}
```

Response:

```json
{
  "teamId": "team_abcd",
  "name": "Rocket Cats",
  "nameNormalized": "rocket cats",
  "eventId": "evt_2025"
}
```

- `submitProject` request:

```json
{ "projectId": "proj_123" }
```

Response:

```json
{ "projectId": "proj_123", "status": "submitted", "submittedAt": 1733700000000 }
```

- `publishResults` response:

```json
{ "eventId": "evt_2025", "published": 42 }
```

### 10. Implementation Notes (Frontend)

- Use Firebase Modular SDK (Auth, Firestore, Storage). Keep business actions behind small hooks/services that call Functions when required.
- Respect mobile-first UI with Ant Design components. Hide actions not allowed in current stage/role.
- Handle Firestore pagination with cursors and show loading skeletons.
- After role changes via `setUserRole`, force token refresh on client to pick up new claims.
