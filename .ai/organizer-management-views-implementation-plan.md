# Plan implementacji widoku: Zarządzanie Zespołami i Projektami (Organizator)

## 1. Przegląd

Widoki do zarządzania zespołami i projektami są operacyjnym centrum panelu Organizatora. Umożliwiają one przegląd wszystkich zarejestrowanych zespołów i zgłoszonych projektów, monitorowanie ich statusu oraz podejmowanie kluczowych akcji administracyjnych, takich jak przypisywanie członków do zespołów czy awaryjne odblokowywanie zgłoszeń po terminie.

## 2. Routing widoku

- **Przegląd Zespołów**: `/organizer/teams`
- **Przegląd Projektów**: `/organizer/projects`

Oba widoki są częścią layoutu Organizatora i chronione przez odpowiedni guard roli.

## 3. Struktura komponentów

```
OrganizerLayout
└── <Outlet />
    ├── TeamsManagementPage (`/organizer/teams`)
    │   ├── PageHeader (Tytuł, przycisk "Przypisz użytkownika")
    │   └── TeamsTable (Lista zespołów, członkowie, akcje)
    │       └── AssignUserToTeamModal (Modal z formularzem przypisania)
    │
    └── ProjectsManagementPage (`/organizer/projects`)
        ├── PageHeader (Tytuł, filtry statusu)
        └── ProjectsTable (Lista projektów, statusy, akcje)
            └── ForceUnlockModal (Modal do odblokowania projektu)
```

## 4. Szczegóły komponentów

### `TeamsManagementPage`

- **Opis komponentu**: Strona główna do zarządzania zespołami. Wyświetla listę wszystkich zespołów i umożliwia przypisywanie do nich użytkowników.
- **Główne elementy**: `<PageHeader>`, `<Button>`, `TeamsTable`.
- **Obsługiwane interakcje**: Otwarcie modala do przypisania użytkownika.
- **Typy**: `TeamWithMembersViewModel[]`.
- **Propsy**: Brak.

### `TeamsTable`

- **Opis komponentu**: Tabela prezentująca listę zespołów, ich członków oraz właścicieli.
- **Główne elementy**: `<Table>` z możliwością rozwinięcia wiersza w celu pokazania szczegółów lub członków.
- **Typy**: `TeamWithMembersViewModel[]`.
- **Propsy**: `teams`.

### `AssignUserToTeamModal`

- **Opis komponentu**: Modal z formularzem pozwalającym na wyszukanie użytkownika (po e-mailu) i przypisanie go do wybranego zespołu.
- **Główne elementy**: `<Modal>`, `<Form>`, `<Select>` (z opcją wyszukiwania asynchronicznego użytkowników i zespołów).
- **Obsługiwane interakcje**: Wyszukiwanie, wybór, zatwierdzenie.
- **Obsługiwana walidacja**: Pola użytkownika i zespołu są wymagane.
- **Typy**: `UserDoc`, `TeamDoc`.
- **Propsy**: `isOpen`, `onClose`, `onSubmit`.

### `ProjectsManagementPage`

- **Opis komponentu**: Strona do monitorowania wszystkich projektów. Umożliwia filtrowanie po statusie (`draft`/`submitted`) i wykonywanie akcji administracyjnych.
- **Główne elementy**: `<PageHeader>`, `<Radio.Group>` (filtr), `ProjectsTable`.
- **Typy**: `ProjectDetailsViewModel[]`.
- **Propsy**: Brak.

### `ProjectsTable`

- **Opis komponentu**: Tabela z listą projektów. Wyświetla status, datę zgłoszenia i przyciski akcji.
- **Główne elementy**: `<Table>`, `<Tag>` (dla statusu), `<Dropdown>` z akcjami.
- **Obsługiwane interakcje**: Uruchomienie akcji `force-unlock`.
- **Typy**: `ProjectDetailsViewModel[]`.
- **Propsy**: `projects`, `onForceUnlock`.

### `ForceUnlockModal`

- **Opis komponentu**: Modal pozwalający na tymczasowe odblokowanie projektu, który został już zgłoszony. Wymaga podania powodu, który zostanie zapisany w logu audytowym.
- **Główne elementy**: `<Modal>`, `<Form>`, `<Input.TextArea>`, `<InputNumber>`.
- **Obsługiwana walidacja**: Powód (`reason`) jest polem wymaganym.
- **Typy**: `ForceUnlockProjectCommand`.
- **Propsy**: `isOpen`, `onClose`, `onSubmit`, `project`.

## 5. Typy

- **`TeamWithMembersViewModel`**:
  ```typescript
  interface TeamWithMembersViewModel extends TeamDTO {
    members: UserProfileDTO[]; // Lista pełnych profili członków
  }
  ```
- **`ProjectDetailsViewModel`**:
  ```typescript
  interface ProjectDetailsViewModel extends ProjectDTO {
    teamName: string; // denormalizowane dla wygody
  }
  ```
- **`AssignUserToTeamFormViewModel`**:
  ```typescript
  interface AssignUserToTeamFormViewModel {
    userId: string;
    teamId: string;
  }
  ```

## 6. Zarządzanie stanem

- **`useTeamsManagement`**:
  - **Cel**: Pobranie i zagnieżdżenie danych o zespołach i ich członkach.
  - **Logika**:
    1. Pobiera wszystkie zespoły (`teams`).
    2. Pobiera wszystkich użytkowników (`users`).
    3. Dla każdego zespołu pobiera listę ID członków z podkolekcji `members`.
    4. Łączy te dane w `TeamWithMembersViewModel[]`.
  - **Zwraca**: `{ teams: TeamWithMembersViewModel[], assignUser, isLoading }`.

- **`useProjectsManagement`**:
  - **Cel**: Pobranie i zagnieżdżenie danych o projektach.
  - **Logika**: Pobiera wszystkie projekty i zespoły, a następnie łączy je w `ProjectDetailsViewModel[]`. Udostępnia metodę do wywołania `forceUnlockProject`.
  - **Zwraca**: `{ projects: ProjectDetailsViewModel[], forceUnlock, isLoading }`.

## 7. Integracja API

- **Zarządzanie członkami zespołu**:
  - **Akcja**: Zatwierdzenie formularza w `AssignUserToTeamModal`.
  - **Wywołanie**: `setDoc` na ścieżce `teams/{teamId}/members/{uid}`.
  - **Typ żądania**: `TeamMemberWrite`.
- **Odblokowanie projektu**:
  - **Akcja**: Zatwierdzenie formularza w `ForceUnlockModal`.
  - **Wywołanie**: Wywołanie funkcji chmurowej `forceUnlockProject`.
  - **Typ żądania**: `ForceUnlockProjectCommand`.
  - **Typ odpowiedzi**: `ForceUnlockProjectResponse`.

## 8. Interakcje użytkownika

- **Organizator przypisuje usera**: Klika "Przypisz", wyszukuje usera i zespół w polach `<Select>`, klika "Zatwierdź". Użytkownik pojawia się na liście członków zespołu.
- **Organizator odblokowuje projekt**: W tabeli projektów, przy zgłoszonym projekcie, wybiera z menu akcji "Odblokuj", wpisuje powód i czas w modalu, zatwierdza. Status projektu w UI powinien odzwierciedlić tymczasowe odblokowanie.

## 9. Warunki i walidacja

- **Wyszukiwanie użytkowników**: Komponent `<Select>` w `AssignUserToTeamModal` powinien asynchronicznie przeszukiwać kolekcję `users` (np. po `email`), aby uniknąć ładowania wszystkich użytkowników naraz.
- **Akcje na projektach**: Przycisk "Odblokuj" powinien być widoczny tylko dla projektów o statusie `submitted`.

## 10. Obsługa błędów

- **Błąd przypisania użytkownika**: Jeśli użytkownik jest już w zespole, Firestore odrzuci zapis (jeśli ID dokumentu to `uid`). UI powinno obsłużyć ten błąd i wyświetlić stosowny komunikat.
- **Błąd wywołania funkcji chmurowej**: Błędy zwrócone z `forceUnlockProject` (np. 403, 404) będą przechwytywane i wyświetlane jako `notification.error`.
- **Złożoność zapytań**: Pobranie wszystkich danych (zespoły, członkowie, użytkownicy) może być kosztowne. Należy zaimplementować paginację dla tabel, jeśli przewidywana jest duża liczba zespołów/projektów.

## 11. Kroki implementacji

1.  **Strona Zespołów**: Stworzenie `TeamsManagementPage`, hooka `useTeamsManagement` oraz tabeli `TeamsTable`.
2.  **Modal Przypisywania**: Zaimplementowanie `AssignUserToTeamModal` z asynchronicznym wyszukiwaniem i logiką zapisu do podkolekcji `members`.
3.  **Strona Projektów**: Stworzenie `ProjectsManagementPage`, hooka `useProjectsManagement` i tabeli `ProjectsTable`.
4.  **Modal Odblokowania**: Zaimplementowanie `ForceUnlockModal` i podłączenie go do wywołania funkcji chmurowej `forceUnlockProject`.
5.  **Filtrowanie i Paginacja**: Dodanie do obu tabel filtrowania (dla projektów) oraz paginacji w celu optymalizacji wydajności.
6.  **Audyt**: Upewnienie się, że akcje takie jak `forceUnlockProject` generują odpowiednie wpisy w kolekcji `audits`.
7.  **Dopracowanie UX**: Dodanie wskaźników ładowania i obsługi błędów dla wszystkich operacji.
