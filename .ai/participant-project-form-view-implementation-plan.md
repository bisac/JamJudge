# Plan implementacji widoku: Formularz Projektu Uczestnika

## 1. Przegląd

Widok "Formularz Projektu Uczestnika" jest kluczowym interfejsem dla uczestników wydarzenia, umożliwiającym tworzenie i edycję zgłoszenia projektowego. Jego głównym celem jest zapewnienie płynnego procesu wprowadzania danych (nazwa, opis, linki) oraz zarządzania załącznikami (pliki, multimedia). Widok implementuje mechanizm automatycznego zapisu (autosave) i dynamicznie dostosowuje swój stan (edycja/tylko do odczytu) w oparciu o status projektu, upływający czas oraz ewentualne interwencje organizatora.

## 2. Routing widoku

Widok będzie dostępny pod następującą ścieżką, gdzie `:projectId` jest identyfikatorem projektu powiązanego z zespołem zalogowanego użytkownika:

- **Ścieżka**: `/participant/project` (zakładając, że ID projektu jest pobierane z kontekstu zalogowanego użytkownika i jego zespołu, a nie bezpośrednio z URL).

## 3. Struktura komponentów

Hierarchia komponentów zostanie zorganizowana w celu separacji odpowiedzialności za pobieranie danych, zarządzanie stanem i renderowanie poszczególnych sekcji interfejsu.

```
ParticipantProjectView (komponent strony)
└── ReadOnlyGuard (opakowanie logiki blokowania edycji)
    ├── Alert (komunikat o powodzie blokady)
    └── Tabs (komponent Ant Design)
        ├── TabPane "Szczegóły Projektu"
        │   └── ProjectDetailsForm
        └── TabPane "Pliki i Załączniki"
            └── ProjectFilesUploader
```

## 4. Szczegóły komponentów

### `ParticipantProjectView`

- **Opis komponentu**: Główny kontener strony. Odpowiedzialny za pobranie danych projektu, załączników oraz kontekstu wydarzenia (deadline'y). Oblicza, czy interfejs powinien być w trybie tylko do odczytu i przekazuje tę informację do komponentów podrzędnych. Renderuje strukturę zakładek.
- **Główne elementy**: `<Tabs>` z Ant Design do nawigacji między sekcjami.
- **Obsługiwane interakcje**: Zmiana aktywnej zakładki.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `ProjectDTO`, `ProjectAttachmentDTO[]`, `EventDTO`.
- **Propsy**: Brak (komponent routingu).

### `ReadOnlyGuard`

- **Opis komponentu**: Komponent wyższego rzędu (HOC) lub wrapper, który warunkowo blokuje interakcje zagnieżdżonych w nim komponentów. Wyświetla również komunikat informujący użytkownika o przyczynie blokady.
- **Główne elementy**: `<div>`, `<Alert>` z Ant Design.
- **Obsługiwane interakcje**: Blokuje zdarzenia `pointer-events` na zagnieżdżonych elementach, gdy jest w trybie read-only.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**:
  - `isReadOnly: boolean`
  - `reason: string` (np. "Projekt został zgłoszony.", "Upłynął termin zgłoszeń.")
  - `children: React.ReactNode`

### `ProjectDetailsForm`

- **Opis komponentu**: Formularz do edycji metadanych projektu (nazwa, opis, linki). Wykorzystuje system `Form` z Ant Design i implementuje logikę debouncingu dla automatycznego zapisu zmian.
- **Główne elementy**: `<Form>`, `<Form.Item>`, `<Input>`, `<Input.TextArea>` z Ant Design.
- **Obsługiwane interakcje**: `onValuesChange` - wyzwala zapisanie formularza po upływie określonego czasu od ostatniej zmiany.
- **Obsługiwana walidacja**:
  - `name`: Pole wymagane, maksymalna długość 100 znaków.
  - `description`: Pole opcjonalne, maksymalna długość 2000 znaków.
  - `repoUrl`, `demoUrl`: Pola opcjonalne, muszą być poprawnymi adresami URL zaczynającymi się od `https://`.
- **Typy**: `ProjectFormViewModel`.
- **Propsy**:
  - `initialData: ProjectFormViewModel`
  - `onSave: (data: Partial<ProjectFormViewModel>) => Promise<void>`
  - `isSaving: boolean`
  - `isReadOnly: boolean`

### `ProjectFilesUploader`

- **Opis komponentu**: Komponent do przesyłania plików do Firebase Storage oraz wyświetlania listy już załączonych plików. Wykorzystuje `<Upload.Dragger>` z Ant Design dla mechanizmu przeciągnij i upuść.
- **Główne elementy**: `<Upload.Dragger>`, `<List>`, `<Progress>` z Ant Design.
- **Obsługiwane interakcje**:
  - Przesyłanie nowego pliku (drag-and-drop, kliknięcie).
  - Anulowanie przesyłania w toku.
  - Usuwanie istniejącego załącznika (z potwierdzeniem).
- **Obsługiwana walidacja**: Przed rozpoczęciem przesyłania wyświetla ostrzeżenie (bez blokady), jeśli rozmiar pliku przekracza zdefiniowany próg (np. 25MB).
- **Typy**: `ProjectFileViewModel[]`.
- **Propsy**:
  - `attachments: ProjectFileViewModel[]`
  - `onFileUpload: (file: File) => Promise<void>`
  - `onFileDelete: (attachmentId: string) => Promise<void>`
  - `isReadOnly: boolean`

## 5. Typy

Do implementacji widoku, oprócz istniejących `ProjectDTO`, `ProjectAttachmentDTO` i `EventDTO`, potrzebne będą następujące ViewModele:

- **`ProjectFormViewModel`**: Obiekt reprezentujący dane edytowalne w formularzu.
  ```typescript
  interface ProjectFormViewModel {
    name: string;
    description: string | null;
    repoUrl: string | null;
    demoUrl: string | null;
  }
  ```
- **`ProjectFileViewModel`**: Obiekt reprezentujący plik w interfejsie użytkownika, łączący dane z `ProjectAttachmentDTO` ze stanem przesyłania.
  ```typescript
  interface ProjectFileViewModel {
    id: string; // ID dokumentu załącznika w Firestore
    name: string;
    storagePath: string; // Ścieżka w Firebase Storage

    // Pola opcjonalne dla nowych, przesyłanych plików
    uploadStatus?: "uploading" | "success" | "error";
    progress?: number; // 0-100
    error?: string;
  }
  ```

## 6. Zarządzanie stanem

Zarządzanie stanem będzie oparte na hookach Reacta. Zidentyfikowano potrzebę stworzenia dedykowanych hooków w celu hermetyzacji logiki.

- **`useProjectData(projectId: string)`**:
  - **Cel**: Pobieranie w czasie rzeczywistym (za pomocą `onSnapshot`) dokumentu projektu oraz jego podkolekcji załączników z Firestore.
  - **Zwraca**: `{ project: ProjectDTO, attachments: ProjectAttachmentDTO[], isLoading: boolean, error: Error | null }`.

- **`useProjectGuards(project: ProjectDTO | null, event: EventDTO | null)`**:
  - **Cel**: Czysty hook, który na podstawie danych projektu i wydarzenia oblicza, czy widok powinien być w trybie "tylko do odczytu" oraz generuje odpowiedni komunikat dla użytkownika.
  - **Logika**: Blokada jest aktywna, gdy `project.status === 'submitted'` (i nie ma aktywnego `forceUnlockUntil`) LUB gdy aktualny czas jest po `event.submissionDeadline`.
  - **Zwraca**: `{ isReadOnly: boolean, reason: string }`.

- **`useDebouncedSave`**:
  - **Cel**: Generyczny hook opakowujący funkcję zapisu, aby była wywoływana z opóźnieniem, co zapobiega nadmiernym wywołaniom API podczas pisania w formularzu.

## 7. Integracja API

Interakcja z backendem odbywa się bezpośrednio przez Firebase SDK (Firestore, Storage), zgodnie z `api-plan.md`.

- **Odczyt danych**: `useProjectData` używa `onSnapshot` z Firestore do nasłuchiwania na zmiany w `projects/{projectId}` oraz `projects/{projectId}/attachments`.
- **Zapis danych formularza**:
  - **Akcja**: Zmiana wartości w `ProjectDetailsForm`.
  - **Wywołanie**: `updateDoc` na dokumencie `projects/{projectId}`.
  - **Typ żądania**: `Partial<UpsertProjectCommand>`.
- **Przesyłanie pliku**:
  - **Akcja**: Upuszczenie pliku w `ProjectFilesUploader`.
  - **Wywołanie**:
    1. `uploadBytesResumable` (Firebase Storage SDK) na ścieżkę `projects/{projectId}/{uuid}`.
    2. Po sukcesie: `addDoc` do kolekcji `projects/{projectId}/attachments`.
  - **Typ żądania (dla `addDoc`)**: `CreateAttachmentMetadataCommand`.
- **Usuwanie pliku**:
  - **Akcja**: Kliknięcie przycisku usuwania przy załączniku.
  - **Wywołanie**:
    1. `deleteObject` (Firebase Storage SDK) na podstawie `storagePath`.
    2. `deleteDoc` na dokumencie `projects/{projectId}/attachments/{attachmentId}`.

## 8. Interakcje użytkownika

- **Pisanie w formularzu**: Po zaprzestaniu pisania na krótki czas (np. 1s), w tle wysyłane jest żądanie zapisu. Subtelny wskaźnik "Zapisywanie..." / "Zapisano" informuje o stanie operacji.
- **Upuszczenie pliku**: Plik pojawia się na liście z paskiem postępu. Po zakończeniu pasek postępu znika. W razie błędu wyświetlany jest komunikat.
- **Usuwanie pliku**: Pojawia się modal z prośbą o potwierdzenie. Po zatwierdzeniu plik znika z listy.
- **Próba edycji w trybie read-only**: Pola formularza i przyciski są nieaktywne (`disabled`). Wyświetlany jest komunikat wyjaśniający przyczynę blokady.

## 9. Warunki i walidacja

- **Walidacja na poziomie formularza (`ProjectDetailsForm`)**:
  - `name`: Wymagane, niepuste.
  - `repoUrl`, `demoUrl`: Muszą być poprawnymi składniowo adresami URL i zaczynać się od `https://`. Walidacja realizowana przez atrybut `rules` komponentu `<Form.Item>` Ant Design.
- **Warunki blokady edycji (`ReadOnlyGuard`)**:
  - Edycja jest blokowana, gdy hook `useProjectGuards` zwróci `isReadOnly: true`. Komponent opakowuje całą edytowalną zawartość i uniemożliwia interakcję.
- **Walidacja rozmiaru pliku (`ProjectFilesUploader`)**:
  - Realizowana w funkcji `beforeUpload` komponentu `<Upload>`. Sprawdza `file.size` i jeśli przekracza próg, wyświetla `<Modal.confirm>` z ostrzeżeniem, ale pozwala kontynuować przesyłanie.

## 10. Obsługa błędów

- **Błąd pobierania danych**: `ParticipantProjectView` wyświetli komponent `<Result>` z Ant Design ze statusem błędu i przyciskiem "Spróbuj ponownie".
- **Błąd automatycznego zapisu**: Hook `useDebouncedSave` obsłuży błąd. Zostanie wyświetlone globalne powiadomienie (np. `notification.error`) z informacją o niepowodzeniu zapisu.
- **Błąd przesyłania pliku**: Stan `uploadStatus` w `ProjectFileViewModel` zostanie ustawiony na `'error'`, a w interfejsie pojawi się komunikat błędu oraz przycisk "Spróbuj ponownie" przy danym pliku.
- **Błąd usunięcia pliku**: Zostanie wyświetlone globalne powiadomienie o błędzie, a plik pozostanie na liście.
- **Brak uprawnień (błąd z Security Rules)**: Aplikacja powinna obsłużyć błąd `permission-denied`, odświeżyć dane i przełączyć widok w tryb tylko do odczytu, informując użytkownika o zmianie stanu.

## 11. Kroki implementacji

1.  **Struktura i routing**: Utworzenie pliku komponentu `ParticipantProjectView.tsx` i dodanie odpowiedniej ścieżki w routerze aplikacji.
2.  **Haki danych i logiki**: Implementacja hooków `useProjectData` i `useProjectGuards` w celu odizolowania logiki pobierania danych i walidacji stanu.
3.  **Komponent główny**: Zbudowanie szkieletu `ParticipantProjectView`, który używa zaimplementowanych hooków do pobrania danych i określenia stanu `isReadOnly`. Implementacja struktury zakładek.
4.  **Komponent `ReadOnlyGuard`**: Stworzenie komponentu opakowującego, który przyjmuje `isReadOnly` i `reason` i zarządza blokowaniem UI.
5.  **Formularz szczegółów**: Implementacja `ProjectDetailsForm` z polami i walidacją Ant Design oraz integracja z `useDebouncedSave` do obsługi automatycznego zapisu.
6.  **Komponent plików**: Implementacja `ProjectFilesUploader`, skonfigurowanie `<Upload.Dragger>` do współpracy z Firebase Storage oraz wyświetlanie listy załączników.
7.  **Obsługa stanu i błędów**: Upewnienie się, że wszystkie stany (ładowanie, zapis, błędy) są poprawnie obsłużone i komunikowane użytkownikowi za pomocą komponentów Ant Design (`Spin`, `Result`, `notification`).
8.  **Testy**: Napisanie testów jednostkowych dla logiki w hookach (szczególnie `useProjectGuards`) oraz testów komponentów weryfikujących poprawność renderowania w trybie edycji i tylko do odczytu.
