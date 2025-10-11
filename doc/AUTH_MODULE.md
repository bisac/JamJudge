# Moduł Autentykacji - Dokumentacja

## Przegląd

Moduł autentykacji dla systemu JamJudge, oparty na Firebase Authentication i Firestore. Zapewnia pełną funkcjonalność logowania, rejestracji i resetowania hasła z polskimi komunikatami błędów.

## Struktura plików

```
src/
├── contexts/
│   ├── AuthContext.ts           # Typy i interfejs kontekstu
│   └── AuthProvider.tsx         # Provider zarządzający stanem autentykacji
├── pages/auth/
│   ├── LoginPage.tsx            # Strona logowania
│   ├── SignUpPage.tsx           # Strona rejestracji
│   ├── ResetPasswordPage.tsx   # Strona resetowania hasła
│   └── PendingActivationPage.tsx # Strona oczekiwania na aktywację
├── routing/
│   ├── RequireAuth.tsx          # Guard dla tras wymagających autentykacji
│   └── RedirectIfAuthenticated.tsx # Guard dla tras autentykacji
├── components/layout/
│   └── AuthLayout.tsx           # Layout dla stron autentykacji
└── utils/
    └── firebaseErrors.ts        # Mapowanie błędów Firebase na polskie komunikaty
```

## Funkcjonalności

### 1. Logowanie (`LoginPage`)

**Ścieżka:** `/auth/login`

**Funkcje:**
- Formularz z polami email i hasło
- Checkbox "Zapamiętaj mnie"
- Walidacja w czasie rzeczywistym
- Polskie komunikaty błędów
- Automatyczne przekierowanie po zalogowaniu na podstawie roli użytkownika
- Stan ładowania przycisku
- Linki do rejestracji i resetowania hasła

**Przepływ:**
1. Użytkownik wprowadza dane
2. Walidacja po stronie klienta (format email, pole wymagane)
3. Wywołanie `login()` z AuthContext
4. Firebase Auth weryfikuje dane
5. AuthProvider pobiera profil użytkownika z Firestore
6. Przekierowanie do dashboardu na podstawie roli

**Obsługa przekierowań:**
- Organizer → `/organizer/dashboard`
- Jury → `/jury/dashboard`
- Participant → `/participant/dashboard`
- Jeśli użytkownik próbował dostać się do chronionej trasy, zostanie przekierowany tam po zalogowaniu

### 2. Rejestracja (`SignUpPage`)

**Ścieżka:** `/auth/sign-up`

**Funkcje:**
- Formularz z polami: displayName, email, password, confirmPassword
- Walidacja zgodności haseł
- Minimalna długość hasła: 6 znaków
- Minimalna długość nazwy: 2 znaki
- Automatyczne utworzenie profilu w Firestore
- Domyślna rola: `participant`
- Toast notification o sukcesie
- Przekierowanie do strony logowania po rejestracji

**Przepływ:**
1. Użytkownik wypełnia formularz
2. Walidacja po stronie klienta
3. Wywołanie `signUp()` z AuthContext
4. Firebase Auth tworzy konto
5. AuthProvider tworzy dokument w Firestore `users/{uid}` z danymi:
   - uid
   - email
   - displayName
   - role: "participant"
   - createdAt, updatedAt
6. Notification o sukcesie
7. Przekierowanie do `/auth/login`

**Obsługa błędów krytycznych:**
- Jeśli konto zostało utworzone w Auth, ale zapis do Firestore się nie powiódł, wyświetlany jest specjalny komunikat z prośbą o kontakt z pomocą techniczną

### 3. Resetowanie hasła (`ResetPasswordPage`)

**Ścieżka:** `/auth/reset`

**Funkcje:**
- Prosty formularz z polem email
- Wysyłanie linku resetującego przez Firebase
- Uniwersalny komunikat sukcesu (bezpieczeństwo)
- Komponemt Result po wysłaniu linku

**Przepływ:**
1. Użytkownik podaje email
2. Wywołanie `resetPassword()` z AuthContext
3. Firebase wysyła email z linkiem (jeśli konto istnieje)
4. **Zawsze wyświetlany komunikat sukcesu** - zapobiega "user enumeration"
5. Link do powrotu na stronę logowania

**Bezpieczeństwo:**
- Komunikat sukcesu jest wyświetlany niezależnie od tego, czy konto istnieje
- Błędy są logowane tylko w konsoli deweloperskiej
- Zapobiega sprawdzaniu przez atakujących, które emaile są zarejestrowane

### 4. Oczekiwanie na aktywację (`PendingActivationPage`)

**Wyświetlana gdy:**
- `user.role === null`
- Profil użytkownika nie istnieje w Firestore

**Funkcje:**
- Ikona zegara
- Komunikat o oczekiwaniu na aktywację
- Wyświetlanie emaila użytkownika
- Przycisk wylogowania

## AuthContext API

### Hook: `useAuthContext()`

```typescript
const {
  user,              // UserProfileDTO | null - profil użytkownika
  firebaseUser,      // User | null - obiekt Firebase Auth
  isLoading,         // boolean - stan ładowania
  hasMultipleRoles,  // boolean - czy użytkownik ma wiele ról
  login,             // (email, password) => Promise<void>
  signUp,            // (email, password, displayName) => Promise<void>
  resetPassword,     // (email) => Promise<void>
  signOut,           // () => Promise<void>
} = useAuthContext();
```

### Typy formularzy

```typescript
interface LoginFormViewModel {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface SignUpFormViewModel {
  email: string;
  password: string;
  confirmPassword: string;
}

interface ResetPasswordFormViewModel {
  email: string;
}
```

## Routing Guards

### `RequireAuth`

Chroni trasy wymagające autentykacji.

**Logika:**
1. Jeśli `isLoading` → pokazuje spinner
2. Jeśli brak `user` → przekierowanie do `/auth/login`
3. Jeśli `user.role === null` → pokazuje `PendingActivationPage`
4. W przeciwnym razie → renderuje chronioną trasę

### `RedirectIfAuthenticated`

Chroni trasy autentykacji przed dostępem zalogowanych użytkowników.

**Logika:**
1. Jeśli `isLoading` → pokazuje spinner
2. Jeśli `user` istnieje → przekierowanie do dashboardu na podstawie roli
3. W przeciwnym razie → renderuje stronę autentykacji

## Obsługa błędów

Wszystkie błędy Firebase są mapowane na polskie komunikaty w pliku `utils/firebaseErrors.ts`.

### Wspierane błędy:

| Kod błędu | Polski komunikat |
|-----------|------------------|
| `auth/invalid-credential` | Nieprawidłowy email lub hasło. |
| `auth/user-not-found` | Nieprawidłowy email lub hasło. |
| `auth/wrong-password` | Nieprawidłowy email lub hasło. |
| `auth/invalid-email` | Nieprawidłowy format adresu email. |
| `auth/user-disabled` | To konto zostało zablokowane. |
| `auth/too-many-requests` | Zbyt wiele nieudanych prób logowania. Spróbuj ponownie później. |
| `auth/email-already-in-use` | Ten adres email jest już zarejestrowany. |
| `auth/operation-not-allowed` | Rejestracja jest obecnie niedostępna. |
| `auth/weak-password` | Hasło jest zbyt słabe. Użyj co najmniej 6 znaków. |
| `auth/network-request-failed` | Błąd połączenia sieciowego. Sprawdź swoje połączenie internetowe. |
| `permission-denied` | Brak uprawnień do wykonania tej operacji. |
| `unavailable` | Usługa jest tymczasowo niedostępna. Spróbuj ponownie później. |

## Przepływy użytkownika

### Nowa rejestracja

```
Użytkownik → /auth/sign-up
         ↓
    Wypełnia formularz
         ↓
    Klikje "Zarejestruj się"
         ↓
    Firebase Auth: createUserWithEmailAndPassword
         ↓
    Firestore: setDoc(users/{uid})
         ↓
    Notification: "Rejestracja zakończona pomyślnie!"
         ↓
    Przekierowanie → /auth/login
```

### Logowanie

```
Użytkownik → /auth/login
         ↓
    Wypełnia formularz
         ↓
    Klikje "Zaloguj się"
         ↓
    Firebase Auth: signInWithEmailAndPassword
         ↓
    AuthProvider: pobiera profil z Firestore
         ↓
    Przekierowanie → dashboard (na podstawie roli)
```

### Reset hasła

```
Użytkownik → /auth/reset
         ↓
    Podaje email
         ↓
    Klikje "Wyślij link"
         ↓
    Firebase Auth: sendPasswordResetEmail
         ↓
    Wyświetlenie komunikatu sukcesu (zawsze)
         ↓
    Link → /auth/login
```

## Bezpieczeństwo

1. **Walidacja po stronie klienta** - formularze Ant Design z regułami walidacji
2. **Firebase Security Rules** - dostęp do profili użytkownika kontrolowany przez Firestore rules
3. **Zapobieganie user enumeration** - uniwersalne komunikaty przy resetowaniu hasła
4. **Ogólne komunikaty błędów** - mapowanie wielu błędów logowania na jeden komunikat
5. **Token-based authentication** - Firebase ID tokens
6. **Automatyczne odświeżanie tokenu** - Firebase SDK zarządza sesją

## Konfiguracja Firebase

Wymagane zmienne środowiskowe w `.env`:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

## Testowanie

### Scenariusze testowe:

1. **Rejestracja nowego użytkownika**
   - Zarejestruj się z prawidłowymi danymi
   - Sprawdź czy dokument w Firestore został utworzony
   - Sprawdź czy użytkownik został przekierowany do logowania

2. **Logowanie**
   - Zaloguj się z prawidłowymi danymi
   - Sprawdź przekierowanie do odpowiedniego dashboardu
   - Sprawdź stan `user` w AuthContext

3. **Błędy logowania**
   - Nieprawidłowy email
   - Nieprawidłowe hasło
   - Zablokowane konto

4. **Resetowanie hasła**
   - Podaj istniejący email
   - Sprawdź czy email został wysłany (w Firebase Console)
   - Sprawdź uniwersalny komunikat sukcesu

5. **Pending activation**
   - Usuń rolę użytkownika w Firestore
   - Zaloguj się
   - Sprawdź czy wyświetla się PendingActivationPage

6. **Przekierowania**
   - Zalogowany użytkownik próbuje dostać się do `/auth/login`
   - Sprawdź przekierowanie do dashboardu

## Responsywność

- Mobile-first design
- AuthLayout dostosowuje się do szerokości ekranu
- Maksymalna szerokość formularzy: 400px
- Padding: 16px na mobile, 24px na desktop
- Formularze AntD są natywnie responsywne

## Zgodność z wymaganiami

✅ Firebase modular SDK (v9+)
✅ TypeScript strict mode
✅ Ant Design komponenty
✅ React 18+ z functional components i hooks
✅ React Router v6 z createBrowserRouter
✅ Polskie komunikaty użytkownika
✅ Obsługa błędów
✅ Loading states
✅ Responsywny design
✅ Kod-splitting z React.lazy()

