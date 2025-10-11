# Plan implementacji widoku: Finalizacja Wydarzenia (Organizator)

## 1. Przegląd

Widoki finalizacyjne to ostatni etap pracy Organizatora w ramach wydarzenia. Obejmują one podgląd zebranych ocen, kluczową akcję publikacji oficjalnych wyników (co udostępnia je publicznie) oraz narzędzia do monitorowania i audytu, takie jak przegląd logów administracyjnych i zużycia przestrzeni dyskowej.

## 2. Routing widoku

- **Podgląd Ocen**: `/organizer/scores`
- **Publikacja Wyników**: `/organizer/publish`
- **Log Audytu**: `/organizer/audits`
- **Monitoring Storage**: `/organizer/storage`

## 3. Struktura komponentów

```
OrganizerLayout
└── <Outlet />
    ├── ScoresPreviewPage (`/organizer/scores`)
    │   ├── PageHeader (Tytuł)
    │   └── ScoresTable (Tabela z agregatami ocen per projekt)
    │
    ├── PublishPage (`/organizer/publish`)
    │   ├── PageHeader (Tytuł)
    │   ├── EventStatusPanel (Informacje o gotowości do publikacji)
    │   └── PublishActionsPanel (Przyciski "Publikuj", "Publikuj ponownie")
    │       └── RepublishModal (Modal z polem na powód)
    │
    ├── AuditLogPage (`/organizer/audits`)
    │   ├── PageHeader (Tytuł, filtry)
    │   └── AuditLogTable (Tabela z logami)
    │
    └── StorageMonitoringPage (`/organizer/storage`)
        ├── PageHeader (Tytuł)
        └── StorageUsageTable (Tabela z zużyciem per projekt)
```

## 4. Szczegóły komponentów

### `ScoresPreviewPage`

- **Opis**: Strona pozwalająca na weryfikację zebranych ocen przed publikacją. Wyświetla zagregowane wyniki dla każdego projektu.
- **Główne elementy**: `<PageHeader>`, `ScoresTable`.
- **Typy**: `ScorePreviewViewModel[]`.

### `PublishPage`

- **Opis**: Centralne miejsce do uruchomienia procesu publikacji lub ponownej publikacji wyników.
- **Główne elementy**: `<PageHeader>`, `<Alert>`, `<Button>`, `RepublishModal`.
- **Obsługiwane interakcje**: Kliknięcie przycisku publikacji (z potwierdzeniem), otwarcie modala ponownej publikacji.
- **Warunki**: Przycisk "Publikuj" jest aktywny tylko po zakończeniu etapu ocen.
- **Typy**: `EventDTO`.

### `AuditLogPage`

- **Opis**: Strona do przeglądania logów kluczowych akcji administracyjnych.
- **Główne elementy**: `<PageHeader>`, `<Table>`.
- **Typy**: `AuditDTO[]`.

### `StorageMonitoringPage`

- **Opis**: Strona prezentująca przybliżone zużycie przestrzeni dyskowej przez poszczególne projekty.
- **Główne elementy**: `<PageHeader>`, `<Table>`.
- **Typy**: `StorageUsageViewModel[]`.

## 5. Typy

- **`ScorePreviewViewModel`**:
  ```typescript
  interface ScorePreviewViewModel {
    projectId: string;
    projectName: string;
    teamName: string;
    evaluationsCount: number; // Ilu jurorów oceniło
    averageScore: number; // Wstępnie obliczona średnia ważona
  }
  ```
- **`StorageUsageViewModel`**:
  ```typescript
  interface StorageUsageViewModel {
    projectId: string;
    projectName: string;
    teamName: string;
    filesCount: number;
    // Niestety, dokładny rozmiar jest trudny do uzyskania w czasie rzeczywistym
    // bez dedykowanej funkcji backendowej. W MVP skupimy się na liczbie plików.
  }
  ```

## 6. Zarządzanie stanem

- **`useScoresPreview`**: Pobiera wszystkie projekty i wszystkie oceny, a następnie agreguje je po stronie klienta do postaci `ScorePreviewViewModel[]`.
- **`usePublish`**: Zarządza stanem strony publikacji. Pobiera dane wydarzenia, aby sprawdzić, czy można już publikować. Udostępnia metody `publish` i `republish`, które wywołują odpowiednie funkcje chmurowe.
- **`useAuditLog`**: Pobiera i paginuje dane z kolekcji `audits`.
- **`useStorageMonitoring`**: Pobiera projekty i zlicza załączniki dla każdego z nich (używając `getCountFromServer` dla wydajności).

## 7. Integracja API

- **Publikacja Wyników**:
  - **Akcja**: Kliknięcie przycisku "Publikuj".
  - **Wywołanie**: Funkcja chmurowa `publishResults`.
  - **Typ żądania**: `PublishResultsCommand`.
  - **Typ odpowiedzi**: `PublishResultsResponse`.
- **Ponowna Publikacja Wyników**:
  - **Akcja**: Zatwierdzenie modala `RepublishModal`.
  - **Wywołanie**: Funkcja chmurowa `republishResults`.
  - **Typ żądania**: `RepublishResultsCommand`.
  - **Typ odpowiedzi**: `RepublishResultsResponse`.

## 8. Interakcje użytkownika

- **Organizator publikuje wyniki**: Klika przycisk, potwierdza w modalu. Przycisk wchodzi w stan ładowania. Po sukcesie wyświetla się powiadomienie, a status wydarzenia w UI się aktualizuje.
- **Organizator przegląda logi**: Może filtrować logi (np. po typie akcji) i korzystać z paginacji do przeglądania historii.

## 9. Warunki i walidacja

- **Warunek publikacji**: Przycisk "Publikuj" jest aktywny (`disabled={false}`) tylko wtedy, gdy `event.ratingEndAt` jest w przeszłości.
- **Ponowna publikacja**: Wymaga podania powodu w modalu.

## 10. Obsługa błędów

- **Błąd publikacji**: Jeśli funkcja `publishResults` zwróci błąd (np. z powodu niekompletnych ocen), zostanie on wyświetlony w `notification.error` z czytelnym komunikatem.
- **Wydajność**: Strony z listami (oceny, logi, storage) muszą być zaimplementowane z użyciem paginacji, aby uniknąć problemów z wydajnością przy dużej skali.

## 11. Kroki implementacji

1.  **Strona Podglądu Ocen**: Implementacja `ScoresPreviewPage` i hooka `useScoresPreview`.
2.  **Strona Publikacji**: Stworzenie `PublishPage` i hooka `usePublish`. Implementacja logiki warunkowej dla przycisków oraz modala do ponownej publikacji.
3.  **Strona Logów**: Zbudowanie `AuditLogPage` z tabelą, paginacją i filtrowaniem.
4.  **Strona Monitoringu**: Implementacja `StorageMonitoringPage` i hooka `useStorageMonitoring`.
5.  **Integracja z Funkcjami Chmurowymi**: Podłączenie przycisków na stronie publikacji do odpowiednich Cloud Functions (`publishResults`, `republishResults`).
6.  **Finalizacja UX**: Dodanie wskaźników ładowania, obsługi stanów pustych i błędów na wszystkich stronach.
