# Plan implementacji widoku: Główny Layout Aplikacji (AppShell)

## 1. Przegląd

`AppShell` to nadrzędny komponent-layout, który otacza wszystkie widoki aplikacji dostępne po zalogowaniu. Jego celem jest zapewnienie spójnej struktury i wyglądu, centralne zarządzanie nawigacją między sekcjami ról (Uczestnik, Jury, Organizator) oraz dostarczanie globalnego kontekstu, takiego jak informacje o aktywnym wydarzeniu, jego aktualnym etapie i terminach. Implementuje również globalne komponenty, takie jak pasek etapu, licznik czasu i baner offline.

## 2. Routing widoku

`AppShell` nie posiada własnej, bezpośredniej ścieżki. Działa jako "layout route" w `react-router`, obejmując wszystkie chronione ścieżki aplikacji:

- `/participant/*`
- `/jury/*`
- `/organizer/*`

Struktura w routerze będzie wyglądać następująco:

```jsx
<Route element={<RequireAuth />}>
  <Route element={<AppShell />}>
    <Route path="/participant/*" element={<ParticipantRoutes />} />
    <Route path="/jury/*" element={<JuryRoutes />} />
    <Route path="/organizer/*" element={<OrganizerRoutes />} />
    {/* Inne chronione trasy, np. /profile */}
  </Route>
</Route>
```

## 3. Struktura komponentów

```
AppShell
└── EventContextProvider (Dostarcza globalny stan wydarzenia)
    └── Layout (Główny layout z Ant Design)
        ├── AppHeader
        │   ├── Logo
        │   ├── RoleSwitcher (Widoczny, jeśli użytkownik ma wiele ról)
        │   └── UserProfileDropdown (Avatar, link do profilu, wylogowanie)
        │
        └── Layout (Wewnętrzny layout)
            ├── AppSider (Nawigacja boczna dla desktopa)
            │
            └── Content (Główna treść strony)
                ├── StageBar (Globalny pasek z etapem wydarzenia)
                │   └── Countdown (Licznik do następnego terminu)
                ├── Breadcrumb (Opcjonalne "okruszki chleba")
                │
                └── <Outlet /> (Renderuje właściwy komponent strony)

        <AppTabBar /> (Nawigacja dolna dla mobile - renderowana wewnątrz Layout)
        <OfflineBanner /> (Globalny baner o braku połączenia)
```

## 4. Szczegóły komponentów

### `AppShell`

- **Opis**: Główny komponent orkiestrujący. Pobiera dane aktywnego wydarzenia, inicjalizuje `EventContextProvider` i renderuje strukturę layoutu.
- **Główne elementy**: `<Layout>`, `AppHeader`, `AppSider`, `AppTabBar`, `<Outlet>`.
- **Propsy**: Brak.

### `EventContextProvider`

- **Opis**: Komponent dostawcy kontekstu Reacta. Przechowuje i udostępnia dane o wydarzeniu, aktualnym etapie i terminach wszystkim komponentom potomnym.
- **Propsy**: `children: React.ReactNode`.

### `AppHeader`

- **Opis**: Górny pasek aplikacji. Zawiera branding oraz elementy związane z profilem użytkownika.
- **Główne elementy**: `<Header>`, `RoleSwitcher`, `UserProfileDropdown`.
- **Propsy**: Brak.

### `AppSider` / `AppTabBar`

- **Opis**: Responsywne komponenty nawigacyjne. `AppSider` wyświetla się na większych ekranach, a `AppTabBar` na mobilnych. Menu jest dynamicznie generowane na podstawie aktualnie wybranej roli użytkownika.
- **Główne elementy**: `<Sider>`, `<Menu>`, `<TabBar>`.
- **Obsługiwane interakcje**: Zmiana widoku po kliknięciu w element menu.
- **Propsy**: `userRole: UserRole`.

### `StageBar` & `Countdown`

- **Opis**: Globalny komponent wyświetlany na górze każdej strony, informujący o bieżącym etapie wydarzenia (np. "Trwa ocenianie") oraz pokazujący licznik odliczający czas do końca tego etapu.
- **Główne elementy**: `<Alert>` lub niestandardowy `div`, `<Statistic.Countdown>`.
- **Propsy**: Brak (dane pobiera z `EventContext`).

### `OfflineBanner`

- **Opis**: Baner wyświetlany na dole ekranu, gdy aplikacja utraci połączenie z usługami Firebase.
- **Główne elementy**: `<Alert type="warning">`.
- **Propsy**: Brak.

## 5. Typy

- **`EventContextType`**: Definiuje kształt danych dostępnych przez kontekst.
  ```typescript
  interface EventContextType {
    event: EventDTO | null;
    currentStage: EventStage; // np. 'registration', 'submission', 'rating', 'finished'
    deadlines: {
      submission: Timestamp | null;
      rating: Timestamp | null;
    };
    isLoading: boolean;
  }

  type EventStage =
    | "registration"
    | "work_in_progress"
    | "submission"
    | "rating"
    | "finished";
  ```

## 6. Zarządzanie stanem

- **Kontekst Wydarzenia**: Główny stan aplikacji (dane o wydarzeniu) będzie zarządzany przez `EventContextProvider`. Wewnątrz niego działać będzie customowy hook `useActiveEvent`, który za pomocą `onSnapshot` z Firestore będzie nasłuchiwał na zmiany w dokumencie aktywnego wydarzenia w czasie rzeczywistym.
- **Stan Nawigacji**: Aktywny link w menu będzie zarządzany przez `react-router` (`useLocation`).
- **Stan Offline**: Hook `useOnlineStatus` będzie nasłuchiwał na zmiany stanu połączenia z internetem (np. przez `window.addEventListener`) lub, co lepsze, na metadane z zapytań `onSnapshot`, które informują, czy dane pochodzą z pamięci podręcznej.

## 7. Integracja API

- Głównym punktem integracji jest hook `useActiveEvent`, który wykonuje jedno zapytanie do Firestore, aby pobrać dokument aktywnego wydarzenia: `getDoc` lub `onSnapshot` na `events/{activeEventId}`. W MVP, gdzie jest tylko jedno wydarzenie, można je pobrać za pomocą prostego zapytania z `limit(1)`.

## 8. Interakcje użytkownika

- **Zmiana roli**: W `RoleSwitcher` użytkownik z wieloma rolami (np. organizator i juror) może przełączyć widok, co spowoduje zmianę menu nawigacyjnego i przekierowanie do strony głównej nowej roli.
- **Nawigacja**: Klikanie w `AppSider` lub `AppTabBar` zmienia renderowany komponent w `<Outlet>`.
- **Wylogowanie**: Kliknięcie "Wyloguj" w `UserProfileDropdown` czyści sesję i przekierowuje do `/auth/login`.

## 9. Warunki i walidacja

- **Ochrona tras**: Komponent `RequireAuth` (nie jest częścią `AppShell`, ale go opakowuje) sprawdza, czy użytkownik jest zalogowany. W `AppShell` można dodać dodatkową weryfikację, czy użytkownikowi przypisano jakąkolwiek rolę. Jeśli nie, wyświetla stronę "Oczekiwanie na aktywację konta".

## 10. Obsługa błędów

- **Błąd pobrania wydarzenia**: Jeśli `useActiveEvent` nie znajdzie aktywnego wydarzenia lub napotka błąd, `AppShell` powinien renderować pełnoekranowy komponent `<Result status="500">` z informacją, że aplikacja jest obecnie niedostępna, ponieważ jest to stan krytyczny dla jej działania.

## 11. Kroki implementacji

1.  **Stworzenie Kontekstu**: Zaimplementowanie `EventContextProvider` i hooka `useActiveEvent`, który pobiera dane wydarzenia.
2.  **Budowa `AppShell`**: Stworzenie głównej struktury komponentu `AppShell` z użyciem `<Layout>` Ant Design.
3.  **Integracja Kontekstu**: Umieszczenie `EventContextProvider` na najwyższym poziomie w `AppShell`.
4.  **Implementacja `AppHeader`**: Zbudowanie nagłówka z komponentami `UserProfileDropdown` i warunkowo renderowanym `RoleSwitcher`.
5.  **Implementacja Nawigacji**: Stworzenie responsywnych komponentów nawigacyjnych `AppSider` i `AppTabBar`, które dynamicznie generują menu na podstawie roli z `useAuth`.
6.  **Globalne Komponenty**: Zaimplementowanie `StageBar`, `Countdown` i `OfflineBanner` jako komponentów konsumujących dane z `EventContext` lub hooka `useOnlineStatus`.
7.  **Aktualizacja Routera**: W głównym pliku z routingiem, opakowanie wszystkich chronionych tras komponentem `AppShell`.
8.  **Dopracowanie UX**: Upewnienie się, że stany ładowania (np. podczas pobierania danych o wydarzeniu) są obsłużone za pomocą komponentu `<Spin>`.
