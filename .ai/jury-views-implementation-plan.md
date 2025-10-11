# Plan implementacji widoku: Sekcja Jury

## 1. Przegląd

Sekcja Jury składa się z dwóch głównych widoków: listy wszystkich zgłoszonych projektów oraz szczegółowej karty oceny dla każdego z nich. Celem jest zapewnienie jurorom prostego i przejrzystego interfejsu do przeglądania prac, wystawiania ocen zgodnie z predefiniowanymi kryteriami oraz dodawania opinii (feedbacku). System musi rygorystycznie przestrzegać terminów, blokując możliwość edycji po zakończeniu etapu oceniania.

## 2. Routing widoku

- **Lista projektów**: `/jury/projects`
- **Karta oceny projektu**: `/jury/projects/:projectId`

Dostęp do całej sekcji `/jury/*` będzie chroniony przez guard, który weryfikuje, czy użytkownik ma przypisaną rolę "jury" oraz czy uzupełnił swój profil (wymagane `displayName`).

## 3. Struktura komponentów

```
JurySectionGuard (Guard roli i kompletności profilu)
└── <Outlet />
    ├── JuryProjectsListPage (`/jury/projects`)
    │   ├── PageHeader (Tytuł, filtry)
    │   └── ProjectsList
    │       └── ProjectListCard (Nazwa projektu, zespół, status oceny, link)
    │
    └── ProjectEvaluationPage (`/jury/projects/:projectId`)
        ├── PageHeader (Nazwa projektu, link powrotny)
        ├── ProjectInfoPanel (Szczegóły projektu w trybie read-only)
        └── EvaluationPanel (Panel z logiką blokady po terminie)
            ├── ReadOnlyAlert (Komunikat o zakończeniu etapu ocen)
            ├── EvaluationForm
            │   ├── EvaluationCriteriaTable
            │   │   └── EvaluationCriterionRow (Kryterium, waga, suwak/input oceny)
            │   └── FeedbackInput (Pole tekstowe na feedback)
            └── SaveStatusIndicator (Wskaźnik stanu zapisu)
```

## 4. Szczegóły komponentów

### `JurySectionGuard`

- **Opis komponentu**: Komponent HOC chroniący trasy. Sprawdza rolę użytkownika i kompletność jego profilu. W razie niespełnienia warunków przekierowuje do strony głównej lub strony profilu.
- **Główne elementy**: Logika weryfikacji, `<Navigate />`, `<Outlet />`.
- **Propsy**: `children: React.ReactNode`.

### `JuryProjectsListPage`

- **Opis komponentu**: Wyświetla listę wszystkich projektów do oceny. Umożliwia filtrowanie, np. w celu pokazania tylko nieocenionych prac.
- **Główne elementy**: `<PageHeader>`, `<Radio.Group>` (filtr), `<List>` lub `<Row>`/`<Col>` (dla siatki kart).
- **Obsługiwane interakcje**: Zmiana filtra, nawigacja do karty oceny.
- **Typy**: `ProjectListItemViewModel[]`.
- **Propsy**: Brak.

### `ProjectListCard`

- **Opis komponentu**: Karta reprezentująca pojedynczy projekt na liście. Wyświetla kluczowe informacje i status oceny przez zalogowanego jurora.
- **Główne elementy**: `<Card>`, `<Statistic>`, `<Tag>`.
- **Obsługiwane interakcje**: Kliknięcie karty przenosi do widoku oceny.
- **Typy**: `ProjectListItemViewModel`.
- **Propsy**: `project: ProjectListItemViewModel`.

### `ProjectEvaluationPage`

- **Opis komponentu**: Główny widok oceny projektu. Pobiera wszystkie niezbędne dane (projekt, kryteria, istniejącą ocenę) i zarządza ich zapisem.
- **Główne elementy**: `<PageHeader>`, `<Descriptions>`, `<Divider>`, `EvaluationPanel`.
- **Typy**: `ProjectDTO`, `CriterionDTO[]`, `ProjectEvaluationDTO`.
- **Propsy**: Brak (pobiera `:projectId` z URL).

### `EvaluationPanel`

- **Opis komponentu**: Kontener na formularz oceny, który implementuje logikę blokady edycji po upływie terminu.
- **Główne elementy**: `<Alert>` (gdy read-only), `EvaluationForm`.
- **Obsługiwane interakcje**: Blokuje interakcje z formularzem po terminie.
- **Typy**: `EventDTO`.
- **Propsy**: `event: EventDTO`, `children: React.ReactNode`.

### `EvaluationForm`

- **Opis komponentu**: Właściwy formularz oceny, łączący tabelę kryteriów i pole feedbacku.
- **Główne elementy**: `<Form>`, `EvaluationCriteriaTable`, `FeedbackInput`.
- **Obsługiwane interakcje**: Zmiana wartości w polach formularza wyzwala (z opóźnieniem) zapis.
- **Typy**: `EvaluationFormViewModel`, `CriterionDTO[]`.
- **Propsy**: `criteria`, `initialEvaluation`, `onSave`.

## 5. Typy

- **`ProjectListItemViewModel`**: Rozszerzenie `ProjectDTO` o dane potrzebne na liście.
  ```typescript
  interface ProjectListItemViewModel {
    id: string; // project.id
    name: string; // project.name
    teamName: string; // Wymaga dodatkowego zapytania lub zmapowania
    myEvaluationStatus: "complete" | "in_progress" | "pending";
  }
  ```
- **`EvaluationFormViewModel`**: Model danych dla formularza oceny.
  ```typescript
  interface EvaluationFormViewModel {
    scores: Record<string, number | null>; // { [criterionId]: score }
    feedback: string | null;
  }
  ```

## 6. Zarządzanie stanem

- **`useJuryProjectsList`**:
  - **Cel**: Pobranie i przygotowanie danych dla `JuryProjectsListPage`.
  - **Logika**:
    1. Pobiera wszystkie zespoły (`teams`) dla aktywnego wydarzenia.
    2. Pobiera wszystkie projekty (`projects`).
    3. Pobiera wszystkie oceny wystawione przez bieżącego jurora (`evaluations` collection group query).
    4. Łączy te dane po stronie klienta, tworząc listę `ProjectListItemViewModel[]`, mapując `teamId` na `teamName` i określając `myEvaluationStatus`.
  - **Zwraca**: `{ projects: ProjectListItemViewModel[], isLoading: boolean }`.

- **`useProjectEvaluation` (w `ProjectEvaluationPage`)**:
  - **Cel**: Zarządzanie stanem pojedynczej oceny.
  - **Logika**:
    1. Pobiera dane projektu (`projects/{projectId}`).
    2. Pobiera wszystkie kryteria (`criteria`) dla wydarzenia.
    3. Nasłuchuje w czasie rzeczywistym (`onSnapshot`) na zmiany w dokumencie oceny (`projects/{projectId}/evaluations/{jurorId}`).
    4. Udostępnia funkcję `saveEvaluation` z logiką debouncingu, która zapisuje dane do Firestore.
  - **Zwraca**: `{ project, criteria, evaluation, saveEvaluation, isSaving, isLoading }`.

## 7. Integracja API

- **Odczyt listy projektów**: Jak opisano w `useJuryProjectsList`, wymaga trzech zapytań do Firestore (o zespoły, projekty, oceny jurora).
- **Odczyt danych do oceny**: Jak opisano w `useProjectEvaluation` (projekt, kryteria, konkretna ocena).
- **Zapis oceny**:
  - **Akcja**: Zmiana wartości w formularzu `EvaluationForm`.
  - **Wywołanie**: `setDoc` na ścieżce `projects/{projectId}/evaluations/{jurorId}` z opcją `{ merge: true }`.
  - **Typ żądania**: `UpsertEvaluationCommand`.

## 8. Interakcje użytkownika

- **Juror wybiera projekt z listy**: Kliknięcie `ProjectListCard` powoduje nawigację do `/jury/projects/:projectId`.
- **Juror wystawia ocenę**: Przesunięcie suwaka lub wpisanie liczby w `EvaluationCriterionRow` aktualizuje stan lokalny i po chwili zapisuje dane.
- **Juror pisze feedback**: Wpisywanie tekstu w `FeedbackInput` również jest zapisywane automatycznie z opóźnieniem.
- **Upłynął termin**: `EvaluationPanel` renderuje `<Alert>` i blokuje wszystkie kontrolki formularza.

## 9. Warunki i walidacja

- **Dostęp do sekcji**: `JurySectionGuard` sprawdza, czy `user.role === 'jury'` i `user.displayName` nie jest pusty.
- **Zakres oceny**: Komponent oceny (np. `<Slider>`) musi mieć ustawione `min` i `max` zgodnie z `criterion.scaleMin` i `criterion.scaleMax`.
- **Blokada po terminie**: `EvaluationPanel` porównuje aktualny czas z `event.ratingEndAt`. Jeśli termin minął, przechodzi w tryb "tylko do odczytu".

## 10. Obsługa błędów

- **Błąd pobierania danych**: Zarówno na liście projektów, jak i w karcie oceny, w razie błędu API zostanie wyświetlony komponent `<Result>` z Ant Design z odpowiednim komunikatem i przyciskiem do ponowienia próby.
- **Błąd zapisu oceny**: Wskaźnik `SaveStatusIndicator` pokaże status błędu. Dodatkowo zostanie wyświetlone powiadomienie (`notification.error`) informujące, że ostatnie zmiany nie zostały zapisane.
- **Brak projektu/kryteriów**: Jeśli zapytanie o projekt lub kryteria nie zwróci wyników, zostanie wyświetlona stosowna informacja ("Nie znaleziono projektu").

## 11. Kroki implementacji

1.  **Guard sekcji**: Implementacja `JurySectionGuard` i zabezpieczenie ścieżek `/jury/*` w głównym routerze.
2.  **Strona listy projektów**: Utworzenie `JuryProjectsListPage` oraz hooka `useJuryProjectsList` do pobierania i przetwarzania danych.
3.  **Komponent karty projektu**: Stworzenie `ProjectListCard` do wyświetlania pojedynczego projektu na liście.
4.  **Strona oceny projektu**: Utworzenie `ProjectEvaluationPage` oraz hooka `useProjectEvaluation` do zarządzania danymi i stanem formularza.
5.  **Logika blokady**: Implementacja `EvaluationPanel` z logiką sprawdzania terminu (`ratingEndAt`).
6.  **Formularz oceny**: Zbudowanie `EvaluationForm` z dynamicznie generowanymi polami na podstawie pobranych kryteriów (`EvaluationCriteriaTable`) oraz polem na feedback (`FeedbackInput`).
7.  **Integracja z zapisem**: Podłączenie stanu formularza do funkcji `saveEvaluation` z hooka `useProjectEvaluation`, dodając mechanizm debouncingu.
8.  **Finalizacja UI**: Dodanie wskaźników ładowania (`<Spin>`), obsługi błędów (`<Result>`) i powiadomień (`notification`) w celu zapewnienia dobrego UX.
