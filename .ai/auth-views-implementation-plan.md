# Plan implementacji widoku: Autentykacja Użytkownika

## 1. Przegląd

Moduł Autentykacji obejmuje trzy kluczowe widoki: logowanie, rejestrację i resetowanie hasła. Celem jest zapewnienie bezpiecznego i intuicyjnego procesu zarządzania tożsamością użytkownika zgodnie ze standardami Firebase Auth. Po pomyślnym zalogowaniu, aplikacja przekieruje użytkownika do odpowiedniej sekcji (Uczestnik, Jury, Organizator) na podstawie jego roli.

## 2. Routing widoku

- **Logowanie**: `/auth/login`
- **Rejestracja**: `/auth/sign-up`
- **Resetowanie hasła**: `/auth/reset`

Wszystkie te widoki będą renderowane w ramach wspólnego layoutu `AuthLayout`, który zapewni spójny wygląd i branding.

## 3. Struktura komponentów

```
<Router>
  ...
  <Route path="/auth" element={<AuthLayout />}>
    <Route path="login" element={<LoginPage />} />
    <Route path="sign-up" element={<SignUpPage />} />
    <Route path="reset" element={<ResetPasswordPage />} />
  </Route>
  ...
</Router>
```

## 4. Szczegóły komponentów

### `AuthLayout`

- **Opis komponentu**: Wspólna ramka dla wszystkich formularzy autentykacji. Wyświetla logo aplikacji i centruje zawartość na stronie.
- **Główne elementy**: `<div>` z odpowiednim stylowaniem, `<Outlet />` z `react-router-dom` do renderowania zagnieżdżonych widoków.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**: Brak.

### `LoginPage`

- **Opis komponentu**: Zawiera formularz logowania. Umożliwia użytkownikowi wprowadzenie adresu e-mail i hasła. Komunikuje się z hookiem `useAuth` w celu przeprowadzenia procesu logowania.
- **Główne elementy**: `<Form>`, `<Input type="email">`, `<Input.Password>`, `<Checkbox>`, `<Button type="primary">`, `<Link>`.
- **Obsługiwane interakcje**: Wprowadzanie danych, przełączanie "Zapamiętaj mnie", wysłanie formularza.
- **Obsługiwana walidacja**:
  - `email`: Pole wymagane, musi być poprawnym formatem adresu e-mail.
  - `password`: Pole wymagane.
- **Typy**: `LoginFormViewModel`.
- **Propsy**: Brak.

### `SignUpPage`

- **Opis komponentu**: Zawiera formularz rejestracji. Umożliwia utworzenie nowego konta i powiązanego z nim profilu użytkownika w bazie danych Firestore.
- **Główne elementy**: `<Form>`, `<Input type="email">`, `<Input.Password>`, `<Button type="primary">`, `<Link>`.
- **Obsługiwane interakcje**: Wprowadzanie danych, wysłanie formularza.
- **Obsługiwana walidacja**:
  - `email`: Pole wymagane, poprawny format.
  - `password`: Pole wymagane, minimalna długość 6 znaków.
  - `confirmPassword`: Pole wymagane, musi być identyczne z polem `password`.
- **Typy**: `SignUpFormViewModel`, `UserDoc`.
- **Propsy**: Brak.

### `ResetPasswordPage`

- **Opis komponentu**: Zawiera formularz do inicjowania procesu resetowania hasła.
- **Główne elementy**: `<Form>`, `<Input type="email">`, `<Button type="primary">`, `<Link>`.
- **Obsługiwane interakcje**: Wprowadzanie adresu e-mail, wysłanie formularza.
- **Obsługiwana walidacja**:
  - `email`: Pole wymagane, poprawny format.
- **Typy**: `ResetPasswordFormViewModel`.
- **Propsy**: Brak.

## 5. Typy

- **`LoginFormViewModel`**:
  ```typescript
  interface LoginFormViewModel {
    email: string;
    password: string;
    rememberMe?: boolean;
  }
  ```
- **`SignUpFormViewModel`**:
  ```typescript
  interface SignUpFormViewModel {
    email: string;
    password: string;
    confirmPassword: string;
  }
  ```
- **`ResetPasswordFormViewModel`**:
  ```typescript
  interface ResetPasswordFormViewModel {
    email: string;
  }
  ```

## 6. Zarządzanie stanem

Centralnym punktem zarządzania stanem autentykacji będzie kontekstowy hook `useAuth`.

- **`useAuth`**:
  - **Cel**: Udostępnienie w całej aplikacji informacji o zalogowanym użytkowniku, stanie ładowania oraz metod do logowania, wylogowywania, rejestracji i resetowania hasła. Hook ten będzie opakowaniem dla funkcji z Firebase SDK.
  - **Dostarcza**: `{ user: User | null, role: UserRole | null, isLoading: boolean, login, signUp, logout, resetPassword }`.
- Stan formularzy (wartości pól, błędy walidacji) będzie zarządzany lokalnie w każdym komponencie za pomocą hooka `Form.useForm()` z Ant Design.

## 7. Integracja API

Integracja odbywa się po stronie klienta za pomocą Firebase Modular SDK.

- **Logowanie**: Wywołanie `signInWithEmailAndPassword` z `firebase/auth`.
- **Rejestracja**:
  1. Wywołanie `createUserWithEmailAndPassword` z `firebase/auth`.
  2. Po sukcesie, wywołanie `setDoc` z `firebase/firestore` w celu utworzenia dokumentu w kolekcji `users` o ID równym `uid` nowo utworzonego użytkownika. Domyślna rola użytkownika zostanie ustawiona na `participant`.
- **Reset hasła**: Wywołanie `sendPasswordResetEmail` z `firebase/auth`.

## 8. Interakcje użytkownika

- **Logowanie**: Użytkownik wypełnia formularz, klika "Zaloguj się". Przycisk pokazuje stan ładowania. W razie sukcesu następuje przekierowanie. W razie błędu, pod polem formularza lub w komponencie `notification` pojawia się komunikat.
- **Rejestracja**: Użytkownik wypełnia formularz. Po kliknięciu "Zarejestruj się", przycisk pokazuje stan ładowania. Po sukcesie wyświetlana jest informacja o pomyślnej rejestracji i następuje przekierowanie na stronę logowania. Błędy (np. zajęty e-mail) są komunikowane.
- **Reset hasła**: Użytkownik podaje e-mail, klika "Wyślij link". Przycisk pokazuje stan ładowania. Po chwili, niezależnie od wyniku, wyświetlany jest komunikat: "Jeśli konto o podanym adresie e-mail istnieje, wysłaliśmy na nie link do resetowania hasła."

## 9. Warunki i walidacja

- Walidacja formularzy odbywa się w czasie rzeczywistym (przy `onBlur` lub `onChange`) dzięki mechanizmom `Form` z Ant Design.
- Logika biznesowa (np. sprawdzanie, czy e-mail jest już zajęty) jest obsługiwana przez Firebase i komunikowana jako błąd po próbie wysłania formularza.
- Próba dostępu do stron `/auth/*` przez zalogowanego użytkownika powinna skutkować automatycznym przekierowaniem do jego panelu głównego.

## 10. Obsługa błędów

- Błędy zwracane przez Firebase Auth (np. `auth/invalid-credential`, `auth/email-already-in-use`) będą mapowane na zrozumiałe dla użytkownika komunikaty w języku polskim.
- Aby zapobiec "user enumeration", komunikaty o błędach logowania i resetowania hasła będą celowo ogólnikowe.
- W krytycznym przypadku, gdyby rejestracja w Firebase Auth powiodła się, ale zapis profilu w Firestore nie, użytkownikowi zostanie wyświetlony komunikat z prośbą o kontakt z pomocą techniczną, a błąd zostanie szczegółowo zalogowany po stronie dewelopera.

## 11. Kroki implementacji

1.  **Konfiguracja Firebase**: Upewnienie się, że projekt Firebase jest poprawnie skonfigurowany i połączony z aplikacją, a autentykacja e-mail/hasło jest włączona.
2.  **Kontekst `Auth`**: Stworzenie `AuthContext` i hooka `useAuth`, który będzie zarządzał stanem użytkownika i zawierał logikę komunikacji z Firebase.
3.  **Layout**: Zaimplementowanie komponentu `AuthLayout`.
4.  **Routing**: Dodanie ścieżek `/auth/*` do głównego routera aplikacji, wykorzystując `AuthLayout`.
5.  **Komponenty formularzy**: Implementacja `LoginPage`, `SignUpPage` i `ResetPasswordPage` z użyciem komponentów `Form` z Ant Design i podłączenie ich do metod z hooka `useAuth`.
6.  **Logika przekierowań**: Zaimplementowanie logiki, która po zalogowaniu sprawdza rolę użytkownika (z custom claims tokena ID) i przekierowuje go do odpowiedniej sekcji. Dodanie ochrony przed dostępem zalogowanych użytkowników do stron autentykacji.
7.  **Obsługa profilu**: Implementacja logiki tworzenia dokumentu `UserDoc` w Firestore po pomyślnej rejestracji.
8.  **Obsługa stanu "bez roli"**: Utworzenie prostej strony lub modala dla nowo zarejestrowanych użytkowników, informującej ich, że oczekują na przypisanie roli przez organizatora.
