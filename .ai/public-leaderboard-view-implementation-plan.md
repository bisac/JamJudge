# Plan implementacji widoku: Publiczny Leaderboard

## 1. Przegląd

Publiczny Leaderboard (ranking) jest finałowym, ogólnodostępnym elementem aplikacji. Jego celem jest przedstawienie wyników wydarzenia w klarownej i czytelnej formie. Widok ten staje się dostępny dopiero po tym, jak Organizator jawnie opublikuje wyniki. Dane prezentowane w rankingu pochodzą ze specjalnie przygotowanej, zdenormalizowanej kolekcji `publicResults`, co zapewnia wysoką wydajność i bezpieczeństwo (brak dostępu do danych surowych).

## 2. Routing widoku

- **Ścieżka**: `/leaderboard`

Jest to ścieżka publiczna, niewymagająca logowania.

## 3. Struktura komponentów

```
PublicLeaderboardPage
├── ResultsNotPublishedPlaceholder (Wyświetlany, gdy wyniki nie są opublikowane)
└── LeaderboardTable (Wyświetlany po publikacji wyników)
    └── <Table /> (Komponent Ant Design z paginacją)
```

## 4. Szczegóły komponentów

### `PublicLeaderboardPage`

- **Opis komponentu**: Główny kontener strony. Jego podstawowym zadaniem jest sprawdzenie, czy wyniki dla aktywnego wydarzenia zostały już opublikowane. Na podstawie tej informacji warunkowo renderuje ranking lub informację o jego braku.
- **Główne elementy**: Logika warunkowa, `ResultsNotPublishedPlaceholder`, `LeaderboardTable`.
- **Typy**: `EventDTO`.
- **Propsy**: Brak.

### `ResultsNotPublishedPlaceholder`

- **Opis komponentu**: Prosty komponent (np. `<Result>` z Ant Design) wyświetlający komunikat, że wyniki nie są jeszcze dostępne.
- **Główne elementy**: `<Result status="info" title="Wyniki nie zostały jeszcze opublikowane" />`.
- **Propsy**: Brak.

### `LeaderboardTable`

- **Opis komponentu**: Tabela prezentująca posortowany ranking projektów. Obsługuje paginację do przeglądania wyników.
- **Główne elementy**: `<Table>` z Ant Design. Kolumny: Pozycja (Ranking), Nazwa Projektu, Nazwa Zespołu, Wynik Łączny.
- **Obsługiwane interakcje**: Zmiana strony (paginacja).
- **Typy**: `LeaderboardEntryViewModel[]`.
- **Propsy**: Brak.

## 5. Typy

- **`LeaderboardEntryViewModel`**:
  - **Cel**: Ten ViewModel jest kluczowy, ponieważ dane w kolekcji `publicResults` muszą być zdenormalizowane dla wydajności. Zakładamy, że funkcja chmurowa `publishResults` zapisze w dokumencie `PublicResultDoc` dodatkowe pola.
  ```typescript
  interface LeaderboardEntryViewModel {
    id: string; // ID projektu
    rank: number | null;
    projectName: string; // UWAGA: Musi być zdenormalizowane z ProjectDoc
    teamName: string; // UWAGA: Musi być zdenormalizowane z TeamDoc
    totalScore: number;
  }
  ```
  _Implementacja tego widoku jest zależna od modyfikacji funkcji `publishResults` tak, aby zawierała powyższe pola w kolekcji `publicResults`._

## 6. Zarządzanie stanem

- **`useEventStatus` (w `PublicLeaderboardPage`)**:
  - **Cel**: Sprawdzenie statusu publikacji aktywnego wydarzenia.
  - **Logika**: Pobiera dokument aktywnego wydarzenia i sprawdza, czy pole `resultsPublishedAt` ma ustawioną wartość (jest nie-null).
  - **Zwraca**: `{ areResultsPublished: boolean, isLoading: boolean }`.

- **`useLeaderboardData` (w `LeaderboardTable`)**:
  - **Cel**: Hermetyzacja logiki pobierania i paginacji danych rankingu.
  - **Logika**: Wykonuje zapytanie do kolekcji `publicResults` z sortowaniem (`orderBy('totalScore', 'desc')`), limitem i kursorem (`startAfter`) dla paginacji.
  - **Zwraca**: `{ results: LeaderboardEntryViewModel[], isLoading: boolean, fetchNextPage, hasMore }`.

## 7. Integracja API

- **Odczyt statusu wydarzenia**:
  - **Wywołanie**: `getDoc` z Firestore na ścieżce `events/{activeEventId}`.
- **Odczyt rankingu**:
  - **Wywołanie**: `query` z `getDocs` na kolekcji `publicResults`.
  - **Warunki**: `where('eventId', '==', activeEventId)`, `orderBy('totalScore', 'desc')`, `limit()`, `startAfter()`.
  - **Uwaga**: To zapytanie będzie wymagało utworzenia złożonego indeksu w Firestore, o którego utworzenie Firebase najprawdopodobniej poprosi automatycznie w konsoli podczas developmentu.

## 8. Interakcje użytkownika

- **Użytkownik wchodzi na `/leaderboard` przed publikacją**: Widzi komunikat "Wyniki nie zostały jeszcze opublikowane".
- **Użytkownik wchodzi na `/leaderboard` po publikacji**: Widzi tabelę z pierwszą stroną wyników.
- **Użytkownik zmienia stronę**: Tabela przeładowuje się, pokazując kolejny zestaw wyników.

## 9. Warunki i walidacja

- **Główny warunek**: Cała zawartość rankingu jest renderowana tylko wtedy, gdy `useEventStatus` zwróci `areResultsPublished: true`.

## 10. Obsługa błędów

- **Błąd pobierania statusu wydarzenia**: `PublicLeaderboardPage` wyświetli ogólny komponent błędu (`<Result status="error">`).
- **Błąd pobierania rankingu**: `LeaderboardTable` w swoim ciele zamiast danych wyświetli informację o błędzie.
- **Brak wyników**: Jeśli kolekcja `publicResults` jest pusta, tabela Ant Design domyślnie wyświetli komunikat "Brak danych".

## 11. Kroki implementacji

1.  **Modyfikacja Backendu (krytyczne)**: Upewnienie się, że funkcja chmurowa `publishResults` poprawnie denormalizuje `projectName` i `teamName` do kolekcji `publicResults`.
2.  **Strona Główna**: Stworzenie `PublicLeaderboardPage` i hooka `useEventStatus` do warunkowego renderowania.
3.  **Komponent Tabeli**: Implementacja `LeaderboardTable` i hooka `useLeaderboardData` do pobierania i paginacji danych.
4.  **Konfiguracja Tabeli**: Skonfigurowanie kolumn w tabeli Ant Design do wyświetlania danych z `LeaderboardEntryViewModel`.
5.  **SEO**: Dodanie podstawowych tagów `<title>` i `<meta name="description">` do `PublicLeaderboardPage` za pomocą `react-helmet` lub podobnego rozwiązania.
6.  **Testowanie**: Sprawdzenie obu scenariuszy – przed i po publikacji wyników.
