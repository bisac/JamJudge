# Plan implementacji widoku: Konfiguracja Wydarzenia i Kryteriów (Organizator)

## 1. Przegląd

Widoki konfiguracyjne Organizatora stanowią fundament każdego wydarzenia. Umożliwiają one zdefiniowanie kluczowych parametrów: od nazwy i terminów poszczególnych etapów, po szczegółowe kryteria, według których oceniane będą projekty. Poprawna konfiguracja w tych widokach jest krytyczna dla działania całej aplikacji. Dostęp do nich jest ściśle ograniczony do użytkowników z rolą "organizator".

## 2. Routing widoku

- **Konfiguracja Wydarzenia**: `/organizer/event`
- **Zarządzanie Kryteriami Ocen**: `/organizer/criteria`

Oba widoki będą renderowane w ramach wspólnego layoutu dla sekcji organizatora, zawierającego menu nawigacyjne.

## 3. Struktura komponentów

```
OrganizerSectionGuard (Guard roli)
└── OrganizerLayout (Layout z bocznym menu nawigacyjnym)
    └── <Outlet />
        ├── EventConfigPage (`/organizer/event`)
        │   ├── PageHeader (Tytuł: "Ustawienia Wydarzenia")
        │   └── EventConfigForm
        │
        └── CriteriaConfigPage (`/organizer/criteria`)
            ├── PageHeader (Tytuł: "Kryteria Ocen", przycisk "Dodaj kryterium")
            ├── LockAlert (Alert informujący o blokadzie edycji)
            ├── CriteriaTable (Tabela z listą kryteriów)
            └── CriterionModal (Modal z formularzem dodawania/edycji)
                └── CriterionForm
```

## 4. Szczegóły komponentów

### `OrganizerLayout`

- **Opis komponentu**: Wspólna struktura dla wszystkich widoków w panelu organizatora. Zawiera boczne menu (`<Sider>`) do nawigacji pomiędzy podstronami.
- **Główne elementy**: `<Layout>`, `<Sider>`, `<Menu>`, `<Content>`, `<Outlet />`.
- **Propsy**: Brak.

### `EventConfigPage`

- **Opis komponentu**: Strona przeznaczona do zarządzania głównymi ustawieniami aktywnego wydarzenia.
- **Główne elementy**: `<PageHeader>`, `EventConfigForm`.
- **Typy**: `EventDTO`.
- **Propsy**: Brak.

### `EventConfigForm`

- **Opis komponentu**: Formularz edycji nazwy, strefy czasowej oraz kluczowych terminów wydarzenia.
- **Główne elementy**: `<Form>`, `<Input>`, `<DatePicker>`, `<Button type="primary">`.
- **Obsługiwane interakcje**: Wypełnienie i zapisanie formularza.
- **Obsługiwana walidacja**:
  - `name`: Pole wymagane.
  - `timezone`: Pole wymagane.
  - Terminy muszą być poprawnymi datami i zachowywać logiczną kolejność chronologiczną (np. termin zgłoszeń po terminie rejestracji).
- **Typy**: `EventFormViewModel`.
- **Propsy**: `initialData`, `onSave`, `isSaving`.

### `CriteriaConfigPage`

- **Opis komponentu**: Strona do zarządzania kryteriami oceny. Wyświetla listę istniejących kryteriów i pozwala na ich dodawanie, edycję oraz usuwanie, o ile etap oceniania jeszcze się nie rozpoczął.
- **Główne elementy**: `<PageHeader>`, `<Button>`, `<Alert>`, `<Table>`, `CriterionModal`.
- **Obsługiwane interakcje**: Otwarcie modala, usunięcie kryterium (z potwierdzeniem).
- **Typy**: `CriterionDTO[]`, `EventDTO`.
- **Propsy**: Brak.

### `CriteriaTable`

- **Opis komponentu**: Tabela prezentująca listę zdefiniowanych kryteriów wraz z ich wagą, skalą oraz akcjami (edycja, usunięcie).
- **Główne elementy**: `<Table>`, `<Button.Group>`, `<Popconfirm>`.
- **Typy**: `CriterionDTO[]`.
- **Propsy**: `criteria`, `onEdit`, `onDelete`, `isLocked`.

### `CriterionModal`

- **Opis komponentu**: Modal zawierający formularz do tworzenia lub edycji pojedynczego kryterium.
- **Główne elementy**: `<Modal>`, `CriterionForm`.
- **Propsy**: `isOpen`, `onClose`, `onSubmit`, `initialData`.

## 5. Typy

- **`EventFormViewModel`**:
  ```typescript
  interface EventFormViewModel {
    name: string;
    timezone: string;
    registrationDeadline: Dayjs | null;
    submissionDeadline: Dayjs | null;
    ratingStartAt: Dayjs | null;
    ratingEndAt: Dayjs | null;
  }
  ```
- **`CriterionFormViewModel`**:
  ```typescript
  interface CriterionFormViewModel {
    id?: string;
    name: string;
    weight: number;
    scaleMin: number;
    scaleMax: number;
  }
  ```

## 6. Zarządzanie stanem

- **`useActiveEvent`**:
  - **Cel**: Pobiera i udostępnia dane aktywnego wydarzenia z Firestore. Dostarcza funkcję do aktualizacji tych danych.
  - **Zwraca**: `{ event: EventDTO | null, updateEvent, isLoading }`.
- **`useEventCriteria`**:
  - **Cel**: Zarządza kolekcją kryteriów dla aktywnego wydarzenia.
  - **Logika**: Pobiera dane z kolekcji `criteria` (filtrując po `eventId`). Udostępnia metody CRUD (`addCriterion`, `updateCriterion`, `deleteCriterion`).
  - **Zwraca**: `{ criteria: CriterionDTO[], ..., isLoading }`.

## 7. Integracja API

- **Wydarzenie**:
  - **Odczyt**: `getDoc` z Firestore na ścieżce `events/{activeEventId}`.
  - **Zapis**: `updateDoc`. Payload musi konwertować obiekty `Dayjs` na `Timestamp` Firestore.
- **Kryteria**:
  - **Odczyt**: Zapytanie do kolekcji `criteria` z `where('eventId', '==', activeEventId)`.
  - **Tworzenie**: `addDoc` do kolekcji `criteria`.
  - **Aktualizacja**: `updateDoc` na `criteria/{criterionId}`.
  - **Usuwanie**: `deleteDoc` na `criteria/{criterionId}`.

## 8. Interakcje użytkownika

- **Organizator edytuje termin**: Wybiera datę w `DatePicker`, klika "Zapisz". Przycisk pokazuje stan ładowania. Po sukcesie pojawia się powiadomienie.
- **Organizator dodaje kryterium**: Klika "Dodaj", wypełnia formularz w modalu, zapisuje. Modal znika, a nowy wiersz pojawia się w tabeli.
- **Próba edycji zablokowanych kryteriów**: Przyciski "Dodaj", "Edytuj", "Usuń" są nieaktywne. Na górze strony widnieje alert z informacją o rozpoczęciu etapu oceniania.

## 9. Warunki i walidacja

- **Dostęp do sekcji**: `OrganizerSectionGuard` weryfikuje rolę "organizator".
- **Walidacja formularzy**: Realizowana przez `rules` w Ant Design. Obejmuje wymagane pola, typy danych (liczby) oraz logikę niestandardową (np. `scaleMax > scaleMin`, chronologia dat).
- **Blokada edycji kryteriów**: W `CriteriaConfigPage` sprawdzany jest warunek `new Date() > event.ratingStartAt.toDate()`. Jeśli jest prawdziwy, do komponentów podrzędnych przekazywany jest props `isLocked={true}`.

## 10. Obsługa błędów

- **Błędy API**: Każde wywołanie asynchroniczne (CRUD) jest opakowane w `try/catch`. W przypadku błędu, użytkownikowi wyświetlane jest powiadomienie `notification.error`.
- **Brak danych**: Jeśli nie uda się załadować danych o aktywnym wydarzeniu, na całej stronie wyświetlany jest komponent `<Result>` ze statusem błędu.

## 11. Kroki implementacji

1.  **Layout i Guard**: Stworzenie `OrganizerLayout` z menu nawigacyjnym oraz `OrganizerSectionGuard` chroniącego trasy.
2.  **Strona wydarzenia**: Implementacja `EventConfigPage` i hooka `useActiveEvent`. Zbudowanie `EventConfigForm` i podpięcie go do logiki zapisu.
3.  **Strona kryteriów**: Implementacja `CriteriaConfigPage` i hooka `useEventCriteria`.
4.  **Tabela i Modal kryteriów**: Zbudowanie komponentów `CriteriaTable` oraz `CriterionModal` z formularzem, podpięcie ich do metod CRUD z hooka.
5.  **Logika blokady**: Dodanie w `CriteriaConfigPage` logiki sprawdzającej datę rozpoczęcia ocen i blokującej edycję.
6.  **Dopracowanie UX**: Zapewnienie wskaźników ładowania (`<Spin>`) i powiadomień o sukcesie/błędzie dla wszystkich operacji asynchronicznych.
