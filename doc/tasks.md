# JamJudge - Plan Pracy

## Legenda

- ✅ Zrealizowane
- 🔄 W trakcie
- ⏳ Oczekuje
- 🤖 Agent AI
- 👤 Ręcznie z pomocą agenta

---

## ETAP 1: Setup projektu i podstawowa infrastruktura

### 1.1 Inicjalizacja projektu 🤖

- ✅ Utworzenie struktury projektu React z TypeScript
- ✅ Konfiguracja Vite/Create React App
- ✅ Dodanie ESLint, Prettier, pre-commit hooks
- ✅ Konfiguracja podstawowego pliku package.json z zależnościami
- Specyfikacja:
  - Inicjalizacja przez Vite: `npm create vite@latest jamjudge -- --template react-ts`
  - Node >= 18 LTS; menedżer pakietów npm lub pnpm (dowolny, spójny w repo)
  - ESLint: `eslint:recommended`, `@typescript-eslint`, integracja z Prettier
  - Prettier: domyślne; format on save; brak custom stylistyki CSS (AntD)
  - Husky + lint-staged: formatowanie i lint przed commit
  - Scripts: `dev`, `build`, `preview`, `lint`, `format`
- **Test**: ✅ Projekt się buduje bez błędów (`npm run build`)

### 1.2 Konfiguracja Firebase 👤

- ⏳ Utworzenie projektu Firebase w konsoli
- Specyfikacja:
  - Modular SDK: `firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/storage`
  - Zmienne środowiskowe: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
  - Inicjalizacja w `src/firebase.ts` i eksport instancji: `auth`, `db`, `storage`
  - (Dev) Możliwość użycia emulatorów; produkcyjnie Hosting Firebase
  - Reguły (kierunkowo): odczyt publicznych danych wydarzeń; zapisy wg ról i terminów
- ⏳ Konfiguracja Firebase Auth, Firestore, Storage
- ⏳ Ustawienie reguł bezpieczeństwa Firestore (podstawowe)
- ⏳ Dodanie konfiguracji Firebase do aplikacji React
- **Test**: Połączenie z Firebase działa (console.log z Firebase config)

### 1.3 Setup UI Framework 🤖

- Specyfikacja:
  - AntD v5; import stylów globalnie; responsywność mobile-first
  - Layout: `Header` (logo, menu wg roli, avatar), `Content`, `Footer`
  - Routing (MVP):
    - Public: `/`, `/login`, `/register`, `/events/:eventId`, `/results/:eventId`
    - Auth: `/profile`
    - Participant: `/teams/new`, `/teams/:teamId`, `/projects/:projectId/edit`
    - Jury: `/jury`, `/jury/events/:eventId/projects/:projectId/rate`
    - Organizer: `/organizer`, `/organizer/events/new`, `/organizer/events/:eventId/edit`
  - Protected routes: strażnik oparty o stan Auth (context)
- ⏳ Instalacja i konfiguracja Ant Design
- ⏳ Utworzenie podstawowego layoutu aplikacji
- ⏳ Konfiguracja routingu (React Router)
- ⏳ Utworzenie komponentów Layout, Header, Footer
- **Test**: Strona główna wyświetla się z podstawowym layoutem

---

## ETAP 2: System autoryzacji i użytkownicy

### 2.1 Strona logowania 🤖

- Specyfikacja:
  - Pola: email, password, checkbox "Zapamiętaj mnie"
  - Remember me: `local` persistence; brak zaznaczenia: `session` persistence
  - Mapowanie błędów Auth na komunikaty AntD; blokada wielokrotnych kliknięć
  - Po sukcesie: redirect na stronę domyślną wg roli (participant→`/profile`, organizer→`/organizer`)

- ⏳ Utworzenie komponentu LoginForm z Ant Design
- ⏳ Implementacja logowania przez email/hasło
- ⏳ Dodanie opcji "Zapamiętaj mnie"
- ⏳ Obsługa błędów logowania
- **Test**: Możliwość logowania istniejącym użytkownikiem

- Specyfikacja:
  - Pola: displayName, email, password (min 6 znaków), accept terms
  - Tworzenie dokumentu `users/{uid}` z: displayName, email, role:`participant`, createdAt
  - (Opcjonalnie) wysyłka `sendEmailVerification`; logowanie dopuszczone bez weryfikacji w MVP
  - Po sukcesie: redirect do `/profile`

### 2.2 Rejestracja użytkowników 🤖

- ⏳ Formularz rejestracji z walidacją
- ⏳ Integracja z Firebase Auth
- ⏳ Weryfikacja email (opcjonalna)
- ⏳ Przekierowanie po rejestracji
- **Test**: Nowy użytkownik może się zarejestrować i zalogować
- Specyfikacja:
  - Provider z `onAuthStateChanged`; udostępnia `user`, `role`, `loading`
  - ProtectedRoute: przekierowanie na `/login` gdy brak `user`
  - Wylogowanie: `signOut(auth)`; UI automatycznie reaguje na wygaśnięcie sesji
  - Przechowywanie roli z `users/{uid}.role` w pamięci kontekstu

### 2.3 Zarządzanie sesjami 🤖

- ⏳ Context dla stanu autoryzacji
- ⏳ Protected routes
- ⏳ Automatyczne wylogowanie przy wygaśnięciu sesji
- ⏳ Komponent wylogowania
- Specyfikacja:
  - Pola profilu: displayName, firstName?, lastName?, bio?, photoURL
  - Avatar: jpg/png/webp ≤ 1 MB, max 512x512; ścieżka `avatars/{uid}.ext`
  - Zapis w `users/{uid}`; aktualizacja `photoURL` w Auth i w dokumencie
- **Test**: Niezalogowany użytkownik nie ma dostępu do chronionych stron

### 2.4 Profile użytkownika 🤖

- ⏳ Strona profilu użytkownika
- ⏳ Edycja danych podstawowych (imię, nazwisko, bio)
- ⏳ Upload avatara do Firebase Storage
- ⏳ Zapisywanie profilu w Firestore
- **Test**: Użytkownik może edytować swój profil i zmiany są zapisywane

- Specyfikacja:
  - Kolekcje top-level: `users`, `events`, `teams`, `projects`, `criteria`, `evaluations`, `comments`
  - `events`: name, description, rules, status(`draft|published|archived`), timezone, registrationDeadline, submissionDeadline, ratingStartAt, ratingEndAt, ownerId, createdAt
  - `teams`: eventId, name, description, leaderId, members:[uid], invites:[{email,status,createdAt,expiresAt}], logoPath, locked:boolean, createdAt
  - `projects`: eventId, teamId, name, description, repoUrl, demoUrl, tags:[], attachments:[{path,type,size}], status(`draft|submitted|locked`), submittedAt
  - `criteria`: eventId, name, weight(0-100), min:0, max:10, order
  - `evaluations`: eventId, projectId, jurorId, scores:{criteriaId:number}, publicComment, privateComment, totalWeighted, createdAt, updatedAt
  - `comments`: eventId, projectId, authorId, visibility(`public|jury|mentor`), parentId?, text, createdAt

---

## ETAP 3: Podstawowe struktury danych i admin panel

### 3.1 Model danych wydarzeń 👤

- ⏳ Projekt struktury danych w Firestore (wydarzenia, zespoły, projekty)
- Specyfikacja:
  - Widok tylko dla roli `organizer`
  - Formularz: pola zgodnie z modelem `events`; walidacja terminów i TZ
  - Edycja dozwolona dla `draft|published`; `archived` tylko do odczytu
- ⏳ Utworzenie kolekcji i dokumentów przykładowych
- ⏳ Reguły bezpieczeństwa Firestore dla różnych ról
- **Test**: Dane zapisują się poprawnie w Firestore

### 3.2 Podstawowy admin panel 🤖

- ⏳ Strona dashboard dla organizatora
- Specyfikacja:
  - Rola przechowywana w `users/{uid}.role` (MVP): `participant|jury|mentor|organizer`
  - Gating UI i nawigacji wg roli; menu w `Header` zmienne wg roli
  - Panel zmiany ról dostępny organizatorowi
- ⏳ Lista wydarzeń z podstawowymi informacjami
- ⏳ Formularz tworzenia nowego wydarzenia
- ⏳ Podstawowa edycja wydarzenia
- **Test**: Organizator może utworzyć i edytować wydarzenie

### 3.3 System ról użytkowników 🤖

- ⏳ Implementacja ról w profilu użytkownika
- ⏳ Middleware dla sprawdzania uprawnień
- ⏳ Przypisywanie ról przez organizatora
- ⏳ Różne widoki w zależności od roli
- Specyfikacja:
  - Trasa publiczna `/events/:eventId`; sekcje: opis, regulamin, harmonogram
  - Terminy w strefie `events.timezone`; UI blokuje akcje po deadlinach
  - Materiały zapisywane w Storage pod `events/{eventId}/...`
- **Test**: Różne role widzą różne menu i funkcjonalności

---

## ETAP 4: Zarządzanie wydarzeniami

### 4.1 Szczegóły wydarzenia 🤖

- Specyfikacja:
  - Skala integer 0–10; wagi sumują się do 100; unikalny `order`
  - Edycja możliwa do startu ocen (`ratingStartAt`)

- ⏳ Strona szczegółów wydarzenia
- ⏳ Edycja opisu, regulaminu, harmonogramu
- ⏳ Konfiguracja terminów (rejestracja, zgłoszenia, oceny)
- ⏳ Upload dokumentów i materiałów
- **Test**: Wszystkie dane wydarzenia zapisują się i wyświetlają poprawnie

- Specyfikacja:
  - Przejścia: `draft → published → archived`; brak odwrotu z `archived`
  - Publiczny widok bez logowania; formularz rejestracji zespołu po publikacji

### 4.2 Kryteria oceny 🤖

- ⏳ Formularz definiowania kryteriów oceny
- ⏳ Ustawianie wag dla kryteriów
- ⏳ Skala ocen (0-10)
- ⏳ Podgląd i edycja kryteriów
- **Test**: Kryteria można dodawać, edytować i usuwać

### 4.3 Publikacja wydarzenia 🤖

- ⏳ Status wydarzenia (draft/published/archived)
- Specyfikacja:
  - Unikalność nazwy zespołu w ramach `eventId`
  - Twórca ustawiany jako `leaderId` oraz dodany do `members`
- ⏳ Publiczna strona wydarzenia
- ⏳ Widok dla niezalogowanych użytkowników
- ⏳ Link do rejestracji
- **Test**: Opublikowane wydarzenie jest widoczne publicznie

---

- Specyfikacja:
  - Zaproszenia z ważnością 7 dni (`expiresAt`); przyjęcie dodaje `uid` do `members`
  - Tylko lider może usuwać członków i przekazywać `leaderId`

## ETAP 5: Rejestracja zespołów

### 5.1 Tworzenie zespołu 🤖

- ⏳ Formularz tworzenia zespołu
- ⏳ Wybór wydarzenia do którego zespół się rejestruje
- ⏳ Podstawowe dane zespołu (nazwa, opis)
- Specyfikacja:
  - Logo: jpg/png/webp ≤ 1 MB; ścieżka `teams/{teamId}/logo.ext`
  - Edycja zablokowana po `projects.status` = `submitted` lub po `submissionDeadline`
- ⏳ Automatyczne dodanie twórcy jako lidera
- **Test**: Użytkownik może utworzyć zespół i zostaje jego liderem

### 5.2 Zarządzanie członkami zespołu 🤖

- ⏳ Zapraszanie członków przez email
- ⏳ System zaproszeń (pending/accepted/declined)
- ⏳ Usuwanie członków zespołu
- ⏳ Przenoszenie roli lidera
- **Test**: Lider może zarządzać członkami zespołu

- Specyfikacja:
  - Limity: name ≤ 80, description ≤ 2000; repo/demo jako URL
  - Tagowanie: wolne tagi (max 8)
  - Autosave draft co 3s; status początkowy `draft`

### 5.3 Edycja danych zespołu 🤖

- ⏳ Edycja nazwy i opisu zespołu
- ⏳ Upload logo zespołu
- ⏳ Kontakt zespołu
- ⏳ Blokada edycji po zgłoszeniu projektu
- **Test**: Dane zespołu można edytować do momentu zgłoszenia projektu
- Specyfikacja:
  - Dozwolone: jpg/png/webp (≤5 MB), pdf (≤10 MB); max 10 plików/projekt
  - Ścieżki: `projects/{projectId}/attachments/{uuid}`; metadane: type, size

---

## ETAP 6: Zgłaszanie projektów

### 6.1 Formularz projektu 🤖

- Specyfikacja:
  - Wymagane: name, description, min 1 kryterium w wydarzeniu
  - Po wysłaniu: `status=submitted`, zapis `submittedAt`; formularz read-only
- ⏳ Formularz zgłoszenia projektu
- ⏳ Pola: nazwa, opis, link do repo, link do demo
- ⏳ Upload zdjęć i plików
- ⏳ Wybór kategorii/tagów
- **Test**: Zespół może wypełnić i zapisać draft projektu

### 6.2 Materiały projektu 🤖

- ⏳ Upload multiple plików (zdjęcia, dokumenty, video)
- ⏳ Podgląd uploadowanych materiałów
- ⏳ Usuwanie i zastępowanie plików
- Specyfikacja:
  - Jury widzi tylko przypisane projekty (wg przydziałów wydarzenia lub filtrowania eventId)
  - Status na podstawie istnienia `evaluations` bieżącego jurora
- ⏳ Limity rozmiarów plików
- **Test**: Wszystkie typy plików można uploadować i zarządzać nimi

### 6.3 Finalizacja zgłoszenia 🤖

- ⏳ Podgląd przed wysłaniem
- ⏳ Walidacja wymaganych pól
- Specyfikacja:
  - Jedna ocena per juror per projekt; zapis w `evaluations`
  - Skala integer 0–10; walidacja zakresu
- ⏳ Potwierdzenie zgłoszenia
- ⏳ Blokada edycji po zgłoszeniu
- **Test**: Po zgłoszeniu projekt nie może być edytowany

---

## ETAP 7: System oceniania

- Specyfikacja:
  - `totalWeighted = sum(score(criteria)*weight)/sum(weight)`; zaokrąglenie do 2 miejsc
  - Ranking malejąco po `totalWeighted`; poza oknem ocen zapisy zablokowane

### 7.1 Panel jury 🤖

- ⏳ Lista projektów do oceny
- ⏳ Filtrowanie i sortowanie projektów
- ⏳ Status oceny (nie ocenione/w trakcie/zakończone)
- ⏳ Podgląd materiałów projektu
- **Test**: Jury widzi wszystkie projekty przypisane do oceny

### 7.2 Formularz oceny 🤖

- Specyfikacja:
  - Widoczność: `public` (dla zespołu), `jury`, `mentor`
  - Wątki: `parentId` dla odpowiedzi; sort wg `createdAt`
- ⏳ Oceny według zdefiniowanych kryteriów
- ⏳ Suwaki/pola numeryczne (0-10)
- ⏳ Pole na komentarz publiczny
- ⏳ Pole na komentarz prywatny (dla jury)
- **Test**: Jury może wystawić oceny i zapisać komentarze

### 7.3 Obliczanie wyników 🤖

- Specyfikacja:
  - Zespół widzi oceny oraz komentarze publiczne po publikacji wyników
  - Prywatne komentarze jury pozostają ukryte

- ⏳ Automatyczne obliczanie średniej ważonej
- ⏳ Ranking projektów w czasie rzeczywistym
- ⏳ Widok postępu oceniania dla organizatora
- ⏳ Blokada zmian po zakończeniu okresu ocen
- **Test**: Wyniki są obliczane poprawnie według wag kryteriów

---

## ETAP 8: Komentarze i feedback

- Specyfikacja:
  - Publiczny widok `/results/:eventId`; sortowanie po `totalWeighted`
  - Publikacja wyników przełącza flagę wydarzenia; od tej chwili oceny widoczne dla zespołów

### 8.1 System komentarzy 🤖

- ⏳ Komentarze publiczne pod projektami
- ⏳ Komentarze prywatne (jury-jury, mentor-mentor)
- ⏳ Wątki dyskusyjne
- ⏳ Notyfikacje o nowych komentarzach
- **Test**: Wszystkie typy komentarzy działają zgodnie z uprawnieniami

### 8.2 Feedback dla zespołów 🤖

- ⏳ Widok feedbacku dla zespołu
- ⏳ Komentarze od jury i mentorów
- ⏳ Oceny z podziałem na kryteria
- ⏳ Możliwość odpowiedzi na komentarze
- **Test**: Zespół widzi wszystkie komentarze i oceny

---

## ETAP 9: Wyniki i raportowanie

### 9.1 Publikacja wyników 🤖

- ⏳ Panel publikacji wyników przez organizatora
- ⏳ Publiczny ranking projektów
- ⏳ Strona wyników z filtrowaniem
- ⏳ Ceremonii rozdania nagród (opcjonalnie)
- **Test**: Wyniki można opublikować i są widoczne publicznie

### 9.2 Eksport danych 👤

- ⏳ Eksport wyników do CSV
- ⏳ Eksport ocen detailowych
- ⏳ Generowanie raportów PDF
- ⏳ Statystyki wydarzenia
- **Test**: Wszystkie formaty eksportu działają poprawnie

---

## ETAP 10: Optymalizacja i finalizacja

### 10.1 Responsive design 🤖

- ⏳ Optymalizacja dla urządzeń mobilnych
- ⏳ Testy na różnych rozdzielczościach
- ⏳ Poprawki UI/UX
- ⏳ Accessibility improvements
- **Test**: Aplikacja działa poprawnie na mobile i desktop

### 10.2 Performance i bezpieczeństwo 👤

- ⏳ Optymalizacja zapytań Firestore
- ⏳ Implementacja cache'owania
- ⏳ Finalizacja reguł bezpieczeństwa Firestore
- ⏳ Audyt bezpieczeństwa
- **Test**: Aplikacja ładuje się szybko i jest bezpieczna

### 10.3 Testing i dokumentacja 🤖

- ⏳ Testy jednostkowe komponentów
- ⏳ Testy E2E najważniejszych ścieżek
- ⏳ Dokumentacja dla administratorów
- ⏳ Dokumentacja deployment
- **Test**: Wszystkie testy przechodzą, dokumentacja jest kompletna

### 10.4 Deployment i CI/CD 👤

- ⏳ Konfiguracja GitHub Actions
- ⏳ Automatyczny deployment na Firebase Hosting
- ⏳ Environment variables i konfiguracja prod/dev
- ⏳ Monitoring i logi
- **Test**: Automatyczny deployment działa bez błędów

## ETAP 11: Jakość i Wdrożenie

### 11.1 Testy End-to-End 👤

- ⏳ Zdefiniowanie kluczowych scenariuszy testowych (np. rejestracja, zgłoszenie projektu).
- ⏳ Wybór i konfiguracja narzędzia do testów E2E (np. Cypress, Playwright).
- ⏳ Implementacja co najmniej jednego testu weryfikującego ścieżkę użytkownika.
- **Test**: Test przechodzi pomyślnie lokalnie.

### 11.2 Konfiguracja CI/CD 🤖

- ⏳ Utworzenie pliku workflow dla GitHub Actions.
- ⏳ Zdefiniowanie kroków: checkout, instalacja zależności, budowanie aplikacji.
- ⏳ Dodanie kroku uruchamiającego testy.
- ⏳ (Opcjonalnie) Konfiguracja automatycznego deploymentu na Firebase Hosting.
- **Test**: Pipeline uruchamia się poprawnie po pushu do repozytorium i wszystkie kroki przechodzą pomyślnie.

---

## Notatki implementacyjne

### Priorytet zadań:

1. **Wysoki**: Etapy 1-6 (podstawowa funkcjonalność)
2. **Średni**: Etapy 7-8 (ocenianie i feedback)
3. **Niski**: Etapy 9-10 (wyniki i optymalizacja)

### Uwagi dla agenta AI:

- Każde zadanie powinno być implementowane iteracyjnie
- Testy należy uruchamiać po każdej zmianie
- Kod powinien być skomentowany i zgodny z best practices
- Używaj TypeScript dla bezpieczeństwa typów
- Implementuj error handling w każdym komponencie
- Zachowaj spójność stylistyczną z Ant Design

### Zadania wymagające ręcznej pracy:

- Konfiguracja Firebase (wymaga dostępu do konsoli)
- Ustawianie reguł bezpieczeństwa Firestore
- Konfiguracja domeny i hosting
- Audyt bezpieczeństwa
- Konfiguracja CI/CD pipelines
