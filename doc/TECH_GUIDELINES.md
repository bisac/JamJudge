# JamJudge – Założenia Techniczne i Wytyczne Kodowania

> Dokument referencyjny dla wszystkich osób rozwijających projekt. Celem jest spójność, przewidywalność i łatwa konserwacja kodu.

## 1. Cel dokumentu

Zapewnić jednolite standardy przy implementacji funkcjonalności opisanych w:

- `JamJudge_WymaganiaBiznesowe.md`
- `tasks.md`

## 2. Zakres

Obejmuje: styl kodu (React + TypeScript), architekturę modułów, Firestore, bezpieczeństwo, testy, CI/CD, wydajność, dostępność, konwencje commitów i dokumentację.

## 3. Stos technologiczny (podstawa)

- React 18 + TypeScript
- Vite (preferowane) lub CRA (jeśli uzasadnione – domyślnie Vite)
- Ant Design (komponenty UI)
- Firebase: Auth, Firestore, Storage, Cloud Functions (opcjonalnie później), Hosting
- Testy: Vitest + React Testing Library; E2E: Playwright (preferowane) lub Cypress
- Formatowanie: Prettier; Linting: ESLint (extends: `eslint:recommended`, `plugin:@typescript-eslint/recommended`, `plugin:react-hooks/recommended`)
- GitHub Actions: build + test + deploy

## 4. Struktura katalogów (propozycja)

```
src/
  app/                # bootstrap aplikacji, routing, global providers
  components/         # reużywalne komponenty prezentacyjne
  features/           # domenowe moduły (event, team, project, scoring, auth, comments)
    event/
      api/            # funkcje komunikujące się z Firestore
      components/
      hooks/
      types.ts
      index.ts
  hooks/              # globalne hooki
  lib/                # integracje (firebase, utils, config)
  services/           # logika łącząca wiele feature'ów (np. ranking)
  store/              # (jeśli wprowadzimy dodatkowy state mgmt – np. Zustand)
  styles/             # style globalne / theming
  utils/              # funkcje pomocnicze czyste
  types/              # typy współdzielone
  test/               # utilsy testowe / mocki
public/
functions/            # Firebase Cloud Functions (oddzielny package: tsconfig, eslint, tests)
```

Zasada: Każdy feature ma własny moduł (low coupling, high cohesion). Brak importów "w bok" między feature'ami – jeśli współdzielone: promowanie do `services/` lub `lib/`.

### 4.1 Struktura katalogu `functions/` (propozycja)

```
functions/
  src/
    config/          # wspólne ustawienia środowiskowe
    firestore/       # triggery onCreate/onUpdate dla kolekcji
      projects/
        onProjectSubmit.ts
    http/            # funkcje wywoływane przez HTTPS (np. eksport raportu)
      exportResults.ts
    tasks/           # (opcjonalnie) zaplanowane funkcje (pub/sub, scheduler)
    utils/           # współdzielone helpery (walidacja, normalizacja danych)
    security/        # helpery autoryzacji (role check, context extraction)
    scoring/         # obliczenia rankingów (jeśli przeniesione na backend)
    index.ts         # rejestracja i eksport funkcji
  tests/             # testy jednostkowe funkcji (jest + ts-jest / vitest)
  package.json
  tsconfig.json
  eslint.config.js
```

Konwencja eksportu: wyłącznie przez `index.ts` – unikamy rozproszonej rejestracji.

## 5. Konwencje nazewnicze

- Pliki komponentów: `PascalCase` (np. `TeamCard.tsx`).
- Hooki: `useNazwa` (np. `useAuthUser`).
- Typy: `PascalCase` (np. `Team`, `EventSchedule`).
- Stałe: `UPPER_SNAKE_CASE`.
- Kolekcje Firestore: w liczbie mnogiej, lowercase + `-` jeśli konieczne: `events`, `teams`, `projects`, `project-ratings`.
- Funkcje czyste: czasownik + rzeczownik: `calculateWeightedScore`.
- Komponenty kontenerowe: sufiks `Container` tylko gdy łączą logikę + prezentację.

## 6. Style kodu (TypeScript / React)

- Strict mode w TypeScript (`"strict": true`).
- Zakaz użycia typu `any` (poza bardzo uzasadnionymi wyjątkami, oznaczonymi `// TODO(any): ...`).
- Preferencja: typy zamiast interfejsów, chyba że rozszerzamy (interface) lub deklarujemy API zewnętrzne.
- Komentarze ZAWSZE po angielsku (krótko i rzeczowo).
- Komponenty funkcyjne, brak klas.
- Props interface lokalnie w pliku komponentu (chyba że współdzielony – wtedy `types.ts`).
- Unikać `default export` (prefer `named exports`).
- Brak logiki sieciowej w komponentach – używać hooków warstwy `api/` lub `services/`.
- Jeżeli logika efektów rośnie: wydzielić do hooka (`useTeamMembers`, `useEventCriteria`).
- Nie mieszamy spraw: zasada Single Responsibility (każdy moduł robi jedną rzecz dobrze).

## 7. Ant Design – zasady użycia

- Globalny temat (tokeny) – brak inline styling jeśli możliwe.
- Komponenty layoutu (`Layout`, `Row`, `Col`) do struktury, a nie logiki.
- Limit logiki w komponentach UI – delegujemy do hooków.
- Formularze: `Form` z walidacją opartą o zasady biznesowe (np. wymagane pola submission).
- Dostępność: zawsze label / aria-label dla ikonowych akcji.

## 8. Zarządzanie stanem

- Server state: React Query (TanStack Query) – caching, retry, background updates.
  - Nazwy kluczy: tablica semantyczna: `['projects', eventId]`, `['event', eventId]`.
- Client (UI) state: lokalny `useState` / `useReducer`. Global tylko gdy rzeczywiście współdzielone (np. aktualny użytkownik – `useAuthUser`).
- Unikać nadmiarowego global state management (Redux niepotrzebny na start).

## 9. Warstwa dostępu do danych (Firestore)

Każdy feature ma folder `api/` zawierający funkcje:

- `getEventById(eventId: string)`
- `listProjects(eventId: string)`
- `createTeam(input: CreateTeamInput)`
  Funkcje:
- Zwracają typowane dane (konwersja z surowych dokumentów Firestore w jednym miejscu).
- Obsługują mapowanie dat (`Timestamp` -> `Date`).
- Brak referencji do `window` / UI.

### 9.1 Modele danych (wysoki poziom – weryfikacja w implementacji)

```
events: {
  id, name, status: 'draft'|'published'|'archived',
  description, rulesUrl?, schedule: { registrationFrom, registrationTo, submissionTo, scoringTo },
  criteria: [{ id, label, weight (0..1) }],
  createdAt, updatedAt, createdBy
}

teams: { id, eventId, name, description?, logoUrl?, members:[{uid, role:'leader'|'member'}], createdAt }

projects: { id, eventId, teamId, name, description, repoUrl?, demoUrl?, tags:[], attachments:[{type,url}], submittedAt?, status:'draft'|'submitted' }

project-ratings: { id, projectId, eventId, juryId, scores:{[criteriaId]: number}, publicComment, privateComment, createdAt }

comments: { id, projectId, eventId, authorId, visibility:'public'|'jury'|'mentor', parentId?, text, createdAt }
```

### 9.2 Konwencje

- Wagi kryteriów sumują się do 1.0 (walidacja przy zapisie).
- Wersjonowanie zmian schematu przez pole `schemaVersion` jeśli zajdzie potrzeba migracji.

## 10. Reguły bezpieczeństwa Firestore (guidelines)

- Dostęp oparty o role przechowywane w profilu użytkownika (`users/{uid}.roles`).
- Jury może czytać wszystkie `projects` i pisać do `project-ratings` tylko swoje dokumenty.
- Zespół (lider/członek) może pisać do swojego `project` dopóki `status==='draft'` i przed deadline.
- Komentarze: `visibility==='public'` widoczne dla teamu + staff; `jury` tylko dla jury; `mentor` tylko dla mentorów.
- Walidacja interesariuszy: np. `request.auth != null` oraz `resource.data.eventId == get(/databases/.../documents/projects/{projectId}).data.eventId`.
- Zakaz nadpisywania pól systemowych (`createdAt`, `createdBy`). Tworzone via Cloud Function / backend timestamp.

## 10a. Firebase Cloud Functions – wytyczne

- Język: TypeScript (kompilacja do `lib/`).
- Styl analogiczny jak w aplikacji (ESLint + Prettier + strict TS).
- Importy względne ograniczone – prefer `@/` alias (konfiguracja `paths` w tsconfig).
- Każda funkcja musi:
  - jasno definiować wejście/kontrakt (JSDoc + typy),
  - walidować dane (np. Zod / własny validator) na wejściu HTTP,
  - logować tylko informacje potrzebne do diagnostyki (bez PII nadmiarowo),
  - zwracać zunifikowany format błędu: `{ error: { code, message } }`.
- Błędy dzielimy na: `PERMISSION_DENIED`, `NOT_FOUND`, `INVALID_ARGUMENT`, `INTERNAL`.
- Triggery Firestore: minimalna logika, jeśli obliczenia cięższe → delegacja do kolejki (Pub/Sub) (można dodać później).
- Timeout / memory – dobra praktyka: ustawić jawnie (`runWith({ timeoutSeconds: 30, memory: '256MB' })`).
- Unikać zapętleń: przy zapisie do tej samej kolekcji kontrolować flagą (np. `processed: true`).
- Ranking / agregacje: batch aktualizuje tylko różnice – brak pełnych re-write dla dużych kolekcji.
- Testy jednostkowe: mock Firebase SDK (np. `firebase-functions-test`) dla krytycznych ścieżek (walidacja, edge cases).
- Deployment: zautomatyzowany w GitHub Actions (oddzielny job po przejściu testów frontendu).
- Sekrety: użycie `firebase functions:config:set` lub Secret Manager – brak w `.env` commitowanym.
- Obsługa wersji API: ścieżki HTTP z prefiksem `/v1/` – w przyszłości `/v2/` (niezależny rollout).
- Re-używalna walidacja ról: helper `assertRole(context, 'admin' | 'jury')` rzuca kontrolowany błąd.

### 10a.1 Przykładowa funkcja HTTP (szkic)

```ts
// functions/src/http/exportResults.ts
import * as functions from "firebase-functions";
import { getEventResults } from "../scoring/getEventResults";
import { assertRole } from "../security/assertRole";

export const exportResults = functions
  .runWith({ timeoutSeconds: 30, memory: "256MB" })
  .https.onCall(async (data, context) => {
    try {
      assertRole(context, "admin");
      const { eventId } = data;
      if (typeof eventId !== "string") {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "eventId must be a string",
        );
      }
      const results = await getEventResults(eventId);
      return { ok: true, results };
    } catch (err: any) {
      if (err instanceof functions.https.HttpsError) throw err;
      throw new functions.https.HttpsError("internal", "Unexpected error");
    }
  });
```

### 10a.2 Przykładowy trigger Firestore

```ts
// functions/src/firestore/projects/onProjectSubmit.ts
import * as functions from "firebase-functions";
import { recalcProjectState } from "../../scoring/recalcProjectState";

export const onProjectSubmit = functions.firestore
  .document("projects/{projectId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    if (before.status !== "submitted" && after.status === "submitted") {
      await recalcProjectState(after.eventId, change.after.id);
    }
  });
```

### 10a.3 Test jednostkowy (schemat)

```ts
// functions/tests/exportResults.test.ts
import { exportResults } from "../src/http/exportResults";
// mock firebase-functions-test + getEventResults
describe("exportResults", () => {
  it("rejects when non-admin", async () => {
    await expect(
      exportResults.run({ eventId: "e1" }, {
        auth: { uid: "u1", token: { roles: {} } },
      } as any),
    ).rejects.toThrow();
  });
});
```

## 11. Autoryzacja i role

- Minimalny profil użytkownika w `users` kolekcji: `{ uid, displayName, roles: { admin?: boolean, jury?: boolean, mentor?: boolean } }`.
- Zasada najmniejszych uprawnień (default: uczestnik, brak ról dodatkowych).
- Promocja roli tylko przez admina.

## 12. Obsługa błędów i logging

- UI: czytelne komunikaty (po polsku), logika: techniczne szczegóły w konsoli tylko w dev.
- Błędy z warstwy danych mapowane do własnych typów: `AppError = { code: 'PERMISSION'|'NOT_FOUND'|'VALIDATION'|'UNKNOWN'; message: string }`.
- Globalny interceptor (wrapper) dla operacji Firestore: łapie wyjątki, mapuje i raportuje.
- (Później) integracja z monitoringiem (Sentry) – nie w MVP.

## 13. Testy

- Jednostkowe: logika czysta (utils, kalkulacja punktów) – 100% krytycznych funkcji.
- Integracyjne: hooki z React Query (mock Firebase / msw).
- E2E: krytyczne ścieżki (rejestracja -> utworzenie projektu -> ocena -> publikacja).
- Snapshoty ograniczone (tylko stabilne małe komponenty).
- Konwencja nazewnicza: `*.test.ts` / `*.test.tsx` w tym samym folderze lub `__tests__/`.

## 14. Jakość (narzędzia)

- Pre-commit: `lint-staged` (ESLint + Prettier + type-check – `tsc --noEmit`).
- Build PR: testy + lint + type-check.
- Zakaz merge bez zielonego pipeline.

## 15. Konwencje commitów (Conventional Commits)

```
feat(event): add criteria weight validation
fix(auth): correct role check in team creation
chore: update dependencies
refactor(project): extract attachments uploader
docs: add deployment section
style: run prettier
test: add scoring calculator test
```

- PR tytuł = pierwszy commit typu `feat|fix|refactor|...`.

## 16. Komentarze i dokumentacja

- Komentarze po angielsku.
- JSDoc dla funkcji eksportowanych i złożonych algorytmów.
- README sekcja per feature (linki do modułów / architektury).
- TODO format: `// TODO(username|date): short action`.

## 17. Wydajność

- React Query caching (standard TTL ~5 min, krytyczne dane krócej jeśli dynamiczne).
- Prefetch przy nawigacji do panelu jury / list projektów.
- Lazy loading route-chunków (kod dzielony per feature route).
- Obrazy: kompresja + `width/height` + miniatury w Storage.
- Minimalizacja zapytań: agregacje (np. ranking) obliczane offline (Cloud Function) gdy skalowanie wymagane.

## 18. Accessibility (A11y)

- Klawiaturowa dostępność każdej akcji.
- Kontrast zgodnie z WCAG AA.
- Ikony zawsze z `aria-label` albo tekstem towarzyszącym.
- Form: poprawne `name` + `aria-invalid` przy błędach.

## 19. i18n

- Teksty UI w osobnych plikach (np. `locales/pl.ts`).
- Na MVP tylko język polski, ale struktura umożliwia dodanie `en`.
- Brak tekstów hard-coded w logice – import zasobów.

## 20. CI/CD

- Pipeline: install -> type-check -> lint -> test -> build -> (deploy na main / tag).
- Artefakt build trzymany jako output job.
- Sekrety Firebase przez GitHub Secrets.

## 21. Monitoring (po MVP)

- Dodanie Sentry lub LogRocket dopiero po stabilizacji głównych funkcji.

## 22. Bezpieczeństwo

- Walidacja danych wejściowych po stronie klienta + reguły Firestore.
- Brak przechowywania tajnych kluczy w repo.
- Ograniczenie uprawnień Storage (tylko własne uploady zespołu).
- Limit typów MIME uploadów.

## 23. Zarządzanie zależnościami

- Aktualizacje minor/patch co sprint.
- Audyt `npm audit` w CI – ostrzeżenia traktowane priorytetowo gdy `high` lub `critical`.

## 24. Migracje danych

- Jeśli zmiana struktury: skrypt migracyjny (Cloud Function on-demand) + pole `schemaVersion`.
- Backfill nowych pól z wartościami domyślnymi.

## 25. Ranking i obliczanie wyników (logika krytyczna)

- Funkcja czysta: `calculateProjectScore(ratings[], criteria[])`.
- Testy: przypadki brzegowe (brak ocen, brak kryteriów, wagi != 1 -> błąd).

## 26. Code Review – checklista

- Czy kod jest typowany i bez `any`?
- Czy brak logiki biznesowej w komponentach UI?
- Czy hooki mają jedną odpowiedzialność?
- Czy walidacje są pokryte testami?
- Czy brak duplikacji (DRY)?
- Czy komentarze są po angielsku i zwięzłe?
- Czy obsłużone stany: loading, empty, error?

## 27. Przykładowy wzorzec modułu feature

```
features/project/
  api/
    getProject.ts
    listProjects.ts
    submitProject.ts
  hooks/
    useProject.ts
    useProjects.ts
  components/
    ProjectForm.tsx
    ProjectCard.tsx
  types.ts
  index.ts (export public API)
```

## 28. Minimalny przykład hooka (wzorzec)

```ts
// features/project/hooks/useProject.ts
import { useQuery } from "@tanstack/react-query";
import { getProject } from "../api/getProject";
import type { Project } from "../types";

export function useProject(projectId: string) {
  return useQuery<Project, Error>({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId),
    staleTime: 1000 * 60, // 1 min
  });
}
```

## 29. Minimalny przykład kalkulatora wyników

```ts
export interface Criterion {
  id: string;
  weight: number;
}
export interface Rating {
  scores: Record<string, number>;
}

/**
 * Calculates weighted average score for a project.
 * Throws if weights do not sum (within tolerance) to 1.
 */
export function calculateProjectScore(
  ratings: Rating[],
  criteria: Criterion[],
): number {
  if (!criteria.length) return 0;
  const weightSum = criteria.reduce((a, c) => a + c.weight, 0);
  if (Math.abs(weightSum - 1) > 0.0001) {
    throw new Error("Criteria weights must sum to 1.");
  }
  if (!ratings.length) return 0;
  const totals = ratings.map((r) => {
    return criteria.reduce(
      (acc, c) => acc + (r.scores[c.id] ?? 0) * c.weight,
      0,
    );
  });
  return parseFloat(
    (totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(3),
  );
}
```

## 30. Ewolucja dokumentu

- Dokument versionowany w repo (pull requesty do zmian).
- Każda istotna zmiana architektury = aktualizacja sekcji.

---

**Status:** v1 (MVP guidelines). Aktualizować w miarę rozwoju projektu.
