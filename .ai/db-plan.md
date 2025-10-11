## 1. Kolekcje Firestore (dokumenty, pola, ograniczenia)

Model NoSQL zgodny z MVP: identyfikatory dokumentów jako Firebase `uid` lub aplikacyjne `id` (string). Brak twardych kluczy obcych; relacje przez identyfikatory i reguły Security Rules. Czas w polach `createdAt`/`updatedAt` jako `serverTimestamp()`.

---

### users (kolekcja)

- docId: `{uid}` — Firebase Auth UID
- email: string (unikalne logicznie; utrzymywane aplikacyjnie)
- displayName: string
- photoURL: string | null
- role: 'participant' | 'jury' | 'organizer' (globalne role)
- createdAt: Timestamp
- updatedAt: Timestamp

Uwagi: Role mogą być również osadzone w Custom Claims; dokument profilowy służy do danych UI.

---

### events (kolekcja)

- docId: `{eventId}` — w MVP pojedyncze zdarzenie
- name: string
- timezone: string
- registrationDeadline: Timestamp | null
- submissionDeadline: Timestamp | null
- ratingStartAt: Timestamp | null
- ratingEndAt: Timestamp | null
- resultsPublishedAt: Timestamp | null
- createdBy: `{uid}`
- createdAt: Timestamp
- updatedAt: Timestamp

Uwagi: Pozwala łatwo skalować do wielu wydarzeń w przyszłości.

---

### teams (kolekcja)

- docId: `{teamId}`
- eventId: `{eventId}`
- name: string (unikalna globalnie w MVP — patrz `teamNameReservations`)
- nameNormalized: string (np. lowercased; utrzymywane aplikacyjnie)
- description: string | null
- createdBy: `{uid}`
- createdAt: Timestamp
- updatedAt: Timestamp

Podkolekcja: `teams/{teamId}/members/{uid}`

- role: string | null (np. 'member')
- addedBy: `{uid}`
- createdAt: Timestamp

Uwagi: Członków dodaje tylko organizer (MVP). Subkolekcja upraszcza Security Rules dot. członkostwa.

---

### teamNameReservations (kolekcja) — wzorzec unikalności nazw zespołów

- docId: `{nameNormalized}` (np. lower(name) + trim)
- teamId: `{teamId}`
- eventId: `{eventId}` (dla przyszłej wielo‑eventowości)
- createdBy: `{uid}`
- createdAt: Timestamp

Uwagi: Tworzona transakcyjnie przed `teams/{teamId}`; reguła zabrania duplikatów docId.

---

### projects (kolekcja)

- docId: `{projectId}`
- eventId: `{eventId}`
- teamId: `{teamId}`
- name: string
- description: string | null
- repoUrl: string | null (walidowane aplikacyjnie, prefiks https)
- demoUrl: string | null (walidowane aplikacyjnie, prefiks https)
- status: 'draft' | 'submitted'
- submittedAt: Timestamp | null
- forceUnlockUntil: Timestamp | null
- createdBy: `{uid}`
- createdAt: Timestamp
- updatedAt: Timestamp

Podkolekcja: `projects/{projectId}/attachments/{attachmentId}`

- name: string
- storagePath: string (np. `projects/{projectId}/{uuid}`)
- createdBy: `{uid}`
- createdAt: Timestamp

Podkolekcja: `projects/{projectId}/evaluations/{jurorId}` — jedna ocena per (juror, projekt)

- jurorId: `{uid}` (duplikat dla wygody)
- totalWeighted: number (utrwalany wynik łączny)
- scores: map<{criterionId}: number> (opcjonalne; per‑kryterium)
- feedback: string | null
- createdAt: Timestamp
- updatedAt: Timestamp

Uwagi: Brak komentarzy w MVP. Unikalność oceny zapewnia klucz dokumentu = `{jurorId}` w podkolekcji.

---

### criteria (kolekcja)

- docId: `{criterionId}`
- eventId: `{eventId}`
- name: string
- weight: number (SMALLINT w ujęciu logicznym)
- createdBy: `{uid}`
- createdAt: Timestamp
- scaleMin: number (domyślnie 0)
- scaleMax: number (domyślnie 10)

Uwagi: Nazwy mogą być unikalne per event (egzekwowane aplikacyjnie). Skale punktacji określane przez `scaleMin`/`scaleMax`; używane do walidacji ocen i przeliczeń.

---

### publicResults (kolekcja) — publiczny leaderboard

- docId: `{projectId}`
- eventId: `{eventId}`
- projectId: `{projectId}`
- totalScore: number
- rank: number | null
- updatedAt: Timestamp

Uwagi: Read‑model publikowany po zakończeniu ocen; odczyt publiczny.

---

### audits (kolekcja) — dziennik zdarzeń administracyjnych

- docId: `{auditId}`
- action: 'setUserRole' | 'reserveTeamNameAndCreateTeam' | 'submitProject' | 'forceUnlockProject' | 'lockProject' | 'publishResults' | 'republishResults'
- actorUid: `{uid}`
- eventId: `{eventId}` | null
- projectId: `{projectId}` | null
- teamId: `{teamId}` | null
- reason: string | null
- payload: map | null
- createdAt: Timestamp

## 2. Relacje (kardynalność, logiczne)

- users (1) — (N) teams.createdBy
- users (1) — (N) teams/{teamId}/members/{uid}
- users (1) — (N) projects.createdBy
- users (1) — (N) projects/{projectId}/evaluations/{jurorId}
- events (1) — (N) teams (po `eventId`)
- events (1) — (N) projects (po `eventId`)
- events (1) — (N) criteria (po `eventId`)
- teams (1) — (N) members (subkolekcja)
- teams (1) — (N) projects (po `teamId`)
- projects (1) — (N) attachments (subkolekcja)
- projects (1) — (N) evaluations (subkolekcja, klucz = jurorId)
- projects (1) — (1) publicResults (docId = projectId)

## 3. Indeksy (Firestore)

Firestore domyślnie indeksuje pojedyncze pola. Poniżej zalecane indeksy złożone (Composite Indexes) i zapytania, które je wymagają.

- teams: where eventId == X orderBy name asc
  - Composite: collection=teams, fields: eventId ASC, name ASC

- projects: where eventId == X orderBy createdAt desc
  - Composite: collection=projects, fields: eventId ASC, createdAt DESC

- projects: where teamId == X orderBy updatedAt desc
  - Composite: collection=projects, fields: teamId ASC, updatedAt DESC

- criteria: where eventId == X orderBy name asc
  - Composite: collection=criteria, fields: eventId ASC, name ASC

- publicResults: where eventId == X orderBy totalScore desc
  - Composite: collection=publicResults, fields: eventId ASC, totalScore DESC

- collectionGroup(evaluations): where jurorId == uid orderBy updatedAt desc (przegląd własnych ocen)
  - Composite: collectionGroup=projects/\*/evaluations, fields: jurorId ASC, updatedAt DESC

- collectionGroup(members): where **name** (docId) == uid (zwykle nie wymaga kompozytowego)

Uwaga: Unikalność `teams.name` realizowana przez `teamNameReservations/{nameNormalized}` + transakcja.

## 4. Firebase Security Rules (Firestore)

Założenia: `request.auth.token.role` przechowuje globalną rolę ('participant'|'jury'|'organizer'); członkostwo zespołu w `teams/{teamId}/members/{uid}`. Poniżej przykładowy zestaw reguł zgodny z MVP.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function role() { return isSignedIn() ? request.auth.token.role : null; }
    function isOrganizer() { return role() == 'organizer'; }
    function isJury() { return role() == 'jury'; }
    function isParticipant() { return role() == 'participant'; }
    function isTeamMember(teamId) {
      return isSignedIn() &&
        exists(/databases/$(database)/documents/teams/$(teamId)/members/$(request.auth.uid));
    }
    function projectTeamId(projectId) {
      return get(/databases/$(database)/documents/projects/$(projectId)).data.teamId;
    }

    match /users/{uid} {
      allow read: if isOrganizer() || (isSignedIn() && uid == request.auth.uid);
      allow write: if isOrganizer() || (isSignedIn() && uid == request.auth.uid);
    }

    match /events/{eventId} {
      allow read: if true; // publiczny odczyt
      allow write: if isOrganizer();
    }

    match /teams/{teamId} {
      allow read: if isOrganizer() || isJury() || isTeamMember(teamId);
      allow create: if isOrganizer() || (isSignedIn() && request.resource.data.createdBy == request.auth.uid);
      allow update, delete: if isOrganizer() || isTeamMember(teamId);

      match /members/{memberId} {
        allow read: if isOrganizer() || isTeamMember(teamId);
        // Dodawanie/usuwanie członków tylko przez organizatora (MVP)
        allow create, update, delete: if isOrganizer();
      }
    }

    match /teamNameReservations/{normalized} {
      allow read: if false;
      // Unikalność poprzez docId = normalized name i brak istniejącego dokumentu
      allow create: if (isOrganizer() || isSignedIn()) &&
        request.resource.data.createdBy == request.auth.uid &&
        !exists(/databases/$(database)/documents/teamNameReservations/$(normalized));
      allow delete: if isOrganizer();
    }

    match /projects/{projectId} {
      allow read: if isOrganizer() || isJury() || isTeamMember(resource.data.teamId);
      allow create: if isOrganizer() || (isSignedIn() && isTeamMember(request.resource.data.teamId));
      allow update, delete: if isOrganizer() || isTeamMember(resource.data.teamId);

      match /attachments/{attachmentId} {
        allow read, create, update, delete: if isOrganizer() || isTeamMember(projectTeamId(projectId));
      }

      match /evaluations/{jurorId} {
        // Jedna ocena na jurora — klucz dokumentu = {jurorId}
        allow read: if isOrganizer() || (isSignedIn() && jurorId == request.auth.uid);
        allow create, update, delete: if isOrganizer() || (isSignedIn() && jurorId == request.auth.uid);
      }
    }

    match /criteria/{criterionId} {
      allow read: if true; // publiczny odczyt
      allow write: if isOrganizer();
    }

    match /publicResults/{projectId} {
      allow read: if true; // publiczny odczyt rankingu
      allow write: if isOrganizer();
    }
  }
}
```

## 5. Firebase Storage — struktura i reguły

Struktura obiektów:

- `projects/{projectId}/{uuid}` — pliki/multimedia projektu

Reguły Storage (przykład, spójne z Firestore):

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isSignedIn() { return request.auth != null; }
    function role() { return isSignedIn() ? request.auth.token.role : null; }
    function isOrganizer() { return role() == 'organizer'; }
    function isTeamMember(projectId) {
      return isSignedIn() &&
        exists(/databases/(default)/documents/projects/$(projectId)) &&
        exists(/databases/(default)/documents/teams/$(get(/databases/(default)/documents/projects/$(projectId)).data.teamId)/members/$(request.auth.uid));
    }

    match /projects/{projectId}/{fileId} {
      allow read, write: if isOrganizer() || isTeamMember(projectId);
    }
  }
}
```

## 6. Dodatkowe uwagi i decyzje

- Unikalność nazw zespołów: `teamNameReservations` + transakcja kliencka zapewniają brak kolizji (case‑insensitive poprzez `nameNormalized`).
- Oceny: `totalWeighted` utrwalany; `scores` jako mapa `{criterionId: number}` (zależnie od potrzeb można dodać subkolekcję, ale nie jest to wymagane w MVP).
- Ranking: `publicResults` jest publicznym read‑modelem; aktualizowany przez aplikację po publikacji wyników.
- Brak wymuszeń okien czasowych i zakresów punktów w regułach — kontrola po stronie aplikacji (MVP).
- Indeksy kompozytowe należy utworzyć po pojawieniu się komunikatów o brakującym indeksie w konsoli Firebase; listę rekomendacji zawarto powyżej.
