# Architektura UI dla JamJudge

## 1. Przegląd struktury UI

- **Założenia ogólne**: Single-event (globalne `activeEventId`), brak `eventId` w URL. UI oparte o Ant Design, mobile‑first, z guardami ról i etapów. Dane z Firestore/Storage, akcje biznesowe przez Callable Functions.
- **AppShell**: wspólny layout z nagłówkiem, breadcrumb, globalnym paskiem etapów i countdown. Sekcje per rola: Participant, Jury, Organizer oraz Public (leaderboard).
- **Routing**: `createBrowserRouter` z `route.lazy()` i `errorElement`; guardy `RequireAuth` i `RequireRole` + `EventContext` (event, stage, deadlines).
- **Stan**: TanStack Query dla cache/paginacji; `onSnapshot` dla danych live (projekty/oceny). Offline persistence Firestore włączone – bannery i retry zapisów szkiców.
- **Bezpieczeństwo**: RBAC oparte o custom claims; UI ukrywa/wyłącza akcje niedozwolone; feedback jury widoczny dopiero po publikacji wyników; bannery i blokady po Submit/deadline.

## 2. Lista widoków

1. Widoki wspólne i auth

- **Nazwa widoku**: Strona logowania
  - **Ścieżka widoku**: `/auth/login`
  - **Główny cel**: Logowanie e‑mail/hasło.
  - **Kluczowe informacje do wyświetlenia**: Pola e‑mail, hasło; linki do rejestracji i resetu; błędy `auth/*`.
  - **Kluczowe komponenty widoku**: AntD Form, Input, Password, Button; Notifications dla błędów.
  - **UX, dostępność i względy bezpieczeństwa**: Autocomplete, focus management, komunikaty błędów nienaruszające prywatności; po zalogowaniu redirect do sekcji wg roli.

- **Nazwa widoku**: Rejestracja konta
  - **Ścieżka widoku**: `/auth/sign-up`
  - **Główny cel**: Utworzenie konta i profilu `users/{uid}`.
  - **Kluczowe informacje do wyświetlenia**: E‑mail, hasło; success info; link do logowania.
  - **Kluczowe komponenty widoku**: Form + walidacja; po sukcesie utworzenie dokumentu `users`.
  - **UX, dostępność i względy bezpieczeństwa**: Silne hasło; maskowanie; niedopowiadanie o istnieniu e‑maila.

- **Nazwa widoku**: Reset hasła
  - **Ścieżka widoku**: `/auth/reset`
  - **Główny cel**: Wysłanie linku resetu.
  - **Kluczowe informacje do wyświetlenia**: E‑mail; potwierdzenie wysyłki.
  - **Kluczowe komponenty widoku**: Form; Alerts.
  - **UX, dostępność i względy bezpieczeństwa**: Nieujawnianie istnienia konta; komunikaty neutralne.

- **Nazwa widoku**: Uzupełnienie profilu (jury)
  - **Ścieżka widoku**: `/profile`
  - **Główny cel**: Wymuszenie `displayName` dla jury.
  - **Kluczowe informacje do wyświetlenia**: displayName.
  - **Kluczowe komponenty widoku**: Form; Guard kierujący tu przy braku danych.
  - **UX, dostępność i względy bezpieczeństwa**: Prosty onboarding; walidacja długości.

- **Nazwa widoku**: Błędy i stany aplikacji
  - **Ścieżki**: `/403`, `/404`, fallback error element; globalny Offline banner.
  - **Główny cel**: Jasne komunikaty, szybka nawigacja powrotna.
  - **Kluczowe komponenty widoku**: Result, Button (Back), OfflineBanner.

2. Sekcja Participant

- **Nazwa widoku**: Dashboard uczestnika
  - **Ścieżka widoku**: `/participant`
  - **Główny cel**: Szybki podgląd zespołu, projektu i statusu Submit.
  - **Kluczowe informacje do wyświetlenia**: Team (skład, nazwa), status tworzenia/Submit projektu, deadline/countdown, bannery etapu.
  - **Kluczowe komponenty widoku**: TeamCard, ProjectStatusCard, StageBar, Countdown, CTA Submit.
  - **UX, dostępność i względy bezpieczeństwa**: Sticky CTA, disabled po deadline/Submit; tylko własny zespół/projekt.

- **Nazwa widoku**: Utworzenie zespołu
  - **Ścieżka widoku**: `/participant/team/new`
  - **Główny cel**: Rezerwacja nazwy i utworzenie zespołu.
  - **Kluczowe informacje do wyświetlenia**: Nazwa (unikalność), opis.
  - **Kluczowe komponenty widoku**: Form + callable `reserveTeamNameAndCreateTeam`; 409 → message.
  - **UX, dostępność i względy bezpieczeństwa**: Debounce walidacji; wyjaśnienie 409; dostęp tylko przed Submit.

- **Nazwa widoku**: Zespół i skład
  - **Ścieżka widoku**: `/participant/team`
  - **Główny cel**: Podgląd składu; w MVP edycja członków przez Organizatora.
  - **Kluczowe informacje do wyświetlenia**: Lista członków, właściciel.
  - **Kluczowe komponenty widoku**: List, Avatar, Descriptions.

- **Nazwa widoku**: Formularz projektu (draft)
  - **Ścieżka widoku**: `/participant/project`
  - **Główny cel**: Edycja danych projektu z autosave i podglądem linków.
  - **Kluczowe informacje do wyświetlenia**: name, description, repoUrl, demoUrl; status; attachments preview.
  - **Kluczowe komponenty widoku**: Steps/Tabs: Details, Files, Preview; ProjectForm (debounce autosave), UrlPreview, Guard (deadline/Submit/forceUnlock).
  - **UX, dostępność i względy bezpieczeństwa**: Walidacja `https://`; ostrzeżenia o dużych plikach; read‑only po Submit lub po deadline bez odblokowania.

- **Nazwa widoku**: Pliki projektu
  - **Ścieżka widoku**: `/participant/project/files`
  - **Główny cel**: Upload do Storage; zarządzanie załącznikami.
  - **Kluczowe informacje do wyświetlenia**: Nazwa, rozmiar, status uploadu.
  - **Kluczowe komponenty widoku**: AntD Upload Dragger, progress, cancel; lista attachments.
  - **UX, dostępność i względy bezpieczeństwa**: Soft‑guardy rozmiaru; linki Storage tylko dla uprawnionych; klawiaturowo dostępne akcje.

- **Nazwa widoku**: Potwierdzenie Submit
  - **Ścieżka widoku**: akcja modalna z Dashboard/Project
  - **Główny cel**: Finalne złożenie zgłoszenia.
  - **Kluczowe informacje do wyświetlenia**: Ostrzeżenia o blokadzie edycji; czas; forceUnlock info.
  - **Kluczowe komponenty widoku**: Modal + callable `submitProject`.
  - **UX, dostępność i względy bezpieczeństwa**: Trap focus, primary action; odrzucenie po deadline.

3. Sekcja Jury

- **Nazwa widoku**: Lista projektów
  - **Ścieżka widoku**: `/jury/projects`
  - **Główny cel**: Przegląd wszystkich projektów do oceny.
  - **Kluczowe informacje do wyświetlenia**: Nazwa, team, timestamp, stan mojej oceny (opcjonalnie), filtry.
  - **Kluczowe komponenty widoku**: Responsive list (karty na mobile), sort, opcjonalny filtr „niekompletne”.
  - **UX, dostępność i względy bezpieczeństwa**: Wirtualizacja długiej listy; role guard jury.

- **Nazwa widoku**: Karta oceny projektu
  - **Ścieżka widoku**: `/jury/projects/:projectId`
  - **Główny cel**: Wprowadzenie ocen per kryterium + feedback.
  - **Kluczowe informacje do wyświetlenia**: Tabela kryteriów (nazwa, waga, skala), moje oceny, feedback, preview total.
  - **Kluczowe komponenty widoku**: EvaluationTable (InputNumber/Slider z min/max), FeedbackTextarea, LocalTotalPreview, Partial save.
  - **UX, dostępność i względy bezpieczeństwa**: Walidacja zakresów; read‑only po końcu etapu; feedback jawny, ale niewidoczny dla zespołów przed publikacją.

4. Sekcja Organizer

- **Nazwa widoku**: Konfiguracja wydarzenia
  - **Ścieżka widoku**: `/organizer/event`
  - **Główny cel**: Ustawienia aktywnego wydarzenia i deadline’ów.
  - **Kluczowe informacje do wyświetlenia**: Nazwa, timezone, daty etapów, resultsPublishedAt.
  - **Kluczowe komponenty widoku**: EventForm, DatePickers, StageBar, Countdown.

- **Nazwa widoku**: Kryteria ocen (CRUD)
  - **Ścieżka widoku**: `/organizer/criteria`
  - **Główny cel**: Definicja wag i skali.
  - **Kluczowe informacje do wyświetlenia**: Lista kryteriów, suma wag, badge „locked”.
  - **Kluczowe komponenty widoku**: CriteriaTable/Form; blokada po starcie Oceny.

- **Nazwa widoku**: Zespoły (przegląd)
  - **Ścieżka widoku**: `/organizer/teams`
  - **Główny cel**: Lista zespołów, członkowie, przypisania.
  - **Kluczowe informacje do wyświetlenia**: Team, owner, members.
  - **Kluczowe komponenty widoku**: Table/List, Drawer z detalami; akcje przypisań (MVP ograniczone).

- **Nazwa widoku**: Projekty (przegląd + akcje)
  - **Ścieżka widoku**: `/organizer/projects`
  - **Główny cel**: Podgląd projektów i akcje force‑unlock/lock.
  - **Kluczowe informacje do wyświetlenia**: Status (draft/submitted), forceUnlockUntil, timestamps.
  - **Kluczowe komponenty widoku**: Table, Row actions, Modale `forceUnlockProject`/`lockProject` (reason/unlockMinutes), Audit emit.

- **Nazwa widoku**: Podgląd ocen (przed publikacją)
  - **Ścieżka widoku**: `/organizer/scores`
  - **Główny cel**: Weryfikacja kompletności i rozkładu ocen.
  - **Kluczowe informacje do wyświetlenia**: Agregaty per projekt/juror; brak publicznych wyników.
  - **Kluczowe komponenty widoku**: Tables/Charts (prosto), summaries.

- **Nazwa widoku**: Publikacja wyników
  - **Ścieżka widoku**: `/organizer/publish`
  - **Główny cel**: Uruchomienie publikacji/republikacji.
  - **Kluczowe informacje do wyświetlenia**: Status oceny etapu, liczba projektów, ostrzeżenia.
  - **Kluczowe komponenty widoku**: Modal `publishResults`/`republishResults` (reason), Result.

- **Nazwa widoku**: Log audytu
  - **Ścieżka widoku**: `/organizer/audits`
  - **Główny cel**: Przegląd akcji administracyjnych.
  - **Kluczowe informacje do wyświetlenia**: Kto, kiedy, co, powód.
  - **Kluczowe komponenty widoku**: Table z filtrami.

- **Nazwa widoku**: Monitoring Storage
  - **Ścieżka widoku**: `/organizer/storage`
  - **Główny cel**: Liczba i szacowany rozmiar plików per projekt.
  - **Kluczowe informacje do wyświetlenia**: Count, approx size, outliers.
  - **Kluczowe komponenty widoku**: Cards/Table.

5. Sekcja Public

- **Nazwa widoku**: Leaderboard (publiczny)
  - **Ścieżka widoku**: `/leaderboard`
  - **Główny cel**: Ranking po publikacji.
  - **Kluczowe informacje do wyświetlenia**: Nazwa zespołu/projektu, wynik łączny, pozycja; paginacja.
  - **Kluczowe komponenty widoku**: Table/List, Pagination, SEO meta/OG.
  - **UX, dostępność i względy bezpieczeństwa**: Stabilne sortowanie i tie‑break po `projectId`; publiczny tylko po publikacji.

- **Mapowanie historyjek (skrót per widok)**:
  - Auth: US‑001, US‑002, US‑003
  - RBAC/Guardy: US‑004, US‑070
  - Participant Dashboard/Project/Submit: US‑020, US‑030, US‑031, US‑032, US‑033, US‑090
  - Organizer Criteria/Event/Publish/Audits: US‑010, US‑011, US‑012, US‑060, US‑061, US‑094
  - Jury List/Evaluation: US‑040, US‑041, US‑042, US‑091, US‑043 (pośrednio, obliczanie przy publikacji)
  - Feedback visibility: US‑050, US‑051 (UI ukrywa do publikacji)
  - Storage warnings/monitoring: US‑080, US‑081

## 3. Mapa podróży użytkownika

- **Uczestnik (happy path)**: `/auth/login` → `/participant` (brak zespołu) → `/participant/team/new` (rezerwacja nazwy, 409 w razie kolizji) → `/participant/project` (edycja, autosave, uploady) → modal Submit → blokada edycji → oczekiwanie na wyniki → po publikacji wgląd w feedback w karcie projektu (read‑only).
- **Juror**: `/auth/login` (guard wymusza `displayName` → `/profile` jeśli brak) → `/jury/projects` → `/jury/projects/:projectId` (oceny per kryterium, częściowy zapis) → powtarza dla wszystkich projektów → po zamknięciu etapu widoki read‑only.
- **Organizator**: `/auth/login` → `/organizer/event` (ustawia deadliny) → `/organizer/criteria` (definiuje kryteria) → monitoruje `/organizer/projects` (opcjonalny force‑unlock) → po końcu ocen `/organizer/publish` (publish/republish + audyt) → `/organizer/audits`/`/organizer/storage` (przegląd KPI/Storage).
- **Gość (public)**: `/leaderboard` po publikacji; paginacja i sort desc.
- **Stany blokujące**: Po Submit i/lub po deadline – komponent Guard wymusza read‑only; bannery informacyjne i tooltipy „Brak uprawnień”.

## 4. Układ i struktura nawigacji

- **Top‑level**: `/auth/*`, `/participant/*`, `/jury/*`, `/organizer/*`, `/leaderboard`, `/403`, `/404`.
- **AppShell**: nagłówek z menu rolowym (przełączanie sekcji wg posiadanych ról), avatar/profil, globalny StageBar z Countdown, OfflineBanner.
- **Guardy**: `RequireAuth` (przekierowanie do `/auth/login` na 401), `RequireRole` (403 dla nieuprawnionych), `EventContext` dostarcza etapy/deadliny do komponentów.
- **Lazy routing**: `route.lazy()` dla podstron sekcji (szybszy TTI); Suspense + skeletony.
- **Nawigacja mobilna**: dolny `TabBar` dla głównych sekcji roli; w desktop – Sider menu.
- **Breadcrumb**: w sekcjach z głębszą hierarchią (np. Organizer Projects → Project details drawer/modal).

## 5. Kluczowe komponenty

- **EventContextProvider**: dostarcza `event`, `stage`, `deadlines`, `countdown`.
- **StageBar + Countdown**: globalny pasek etapów; bannery stanu/deadline.
- **RequireAuth / RequireRole**: osłony tras z obsługą redirectów 401/403.
- **OfflineBanner**: status offline + retry; oznaczenie zapisów „do wysłania”.
- **ErrorBoundary + Result**: globalny handler i strony błędów (400/401/403/409/422 mapowane na komunikaty AntD).
- **TeamCard / TeamForm**: prezentacja i tworzenie zespołu (callable rezerwacji nazwy).
- **ProjectForm**: pola projektu z debounced autosave; `UrlPreview` dla `https://`.
- **FilesUploader**: AntD Dragger, progress, cancel; lista `attachments` z metadanymi.
- **SubmitModal**: potwierdzenie i wywołanie `submitProject`; obsługa odmowy po deadline.
- **EvaluationTable**: tabela kryteriów z InputNumber/Slider, walidacja wg skali; `FeedbackTextarea`.
- **CriteriaTable/Form**: CRUD kryteriów, suma wag, badge „locked”.
- **ProjectsTable (Organizer)**: statusy, `forceUnlock`/`lock` akcje, powód; aktualizacje audytu.
- **PublishPanel**: przyciski publish/republish, count, ostrzeżenia; modal powodu.
- **AuditLogTable**: lista wpisów audytu z filtrami.
- **StorageUsageCard/Table**: agregaty plików per projekt.
- **LeaderboardTable**: publiczny ranking z paginacją i SEO metadanymi.

- **Przypadki brzegowe / błędy (obsługa UI)**:
  - 409 przy rezerwacji nazwy zespołu → komunikat i propozycja zmiany nazwy.
  - Próba zapisu po Submit/deadline → disabled + tooltip; odrzucenie zapisu.
  - Brak uprawnień (403) → strona 403, ukrycie akcji w UI.
  - Brak sieci → offline try, kolejka zapisów szkiców; oznaczenie „do wysłania”.
  - Długie listy → wirtualizacja, paginacja `limit + startAfter` (projekty, leaderboard, teams).
  - Feedback widoczny dopiero po publikacji → kondycjonowane renderowanie sekcji feedbacku.

- **Zgodność z API**:
  - Firestore kolekcje: `users`, `events`, `teams`, `projects` (+ `attachments`, `evaluations`), `criteria`, `publicResults`, `audits`.
  - Callable Functions: `setUserRole`, `reserveTeamNameAndCreateTeam`, `submitProject`, `forceUnlockProject`, `lockProject`, `publishResults`, `republishResults` – wywoływane wyłącznie z widoków Organizer/Participant zgodnie z rolami.
  - Query wzorce: paginacja `limit/startAfter`, indeksy dla list.
