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

- ⏳ Utworzenie struktury projektu React z TypeScript
- ⏳ Konfiguracja Vite/Create React App
- ⏳ Dodanie ESLint, Prettier, pre-commit hooks
- ⏳ Konfiguracja podstawowego pliku package.json z zależnościami
- **Test**: Projekt się buduje bez błędów (`npm run build`)

### 1.2 Konfiguracja Firebase 👤

- ⏳ Utworzenie projektu Firebase w konsoli
- ⏳ Konfiguracja Firebase Auth, Firestore, Storage
- ⏳ Ustawienie reguł bezpieczeństwa Firestore (podstawowe)
- ⏳ Dodanie konfiguracji Firebase do aplikacji React
- **Test**: Połączenie z Firebase działa (console.log z Firebase config)

### 1.3 Setup UI Framework 🤖

- ⏳ Instalacja i konfiguracja Ant Design
- ⏳ Utworzenie podstawowego layoutu aplikacji
- ⏳ Konfiguracja routingu (React Router)
- ⏳ Utworzenie komponentów Layout, Header, Footer
- **Test**: Strona główna wyświetla się z podstawowym layoutem

---

## ETAP 2: System autoryzacji i użytkownicy

### 2.1 Strona logowania 🤖

- ⏳ Utworzenie komponentu LoginForm z Ant Design
- ⏳ Implementacja logowania przez email/hasło
- ⏳ Dodanie opcji "Zapamiętaj mnie"
- ⏳ Obsługa błędów logowania
- **Test**: Możliwość logowania istniejącym użytkownikiem

### 2.2 Rejestracja użytkowników 🤖

- ⏳ Formularz rejestracji z walidacją
- ⏳ Integracja z Firebase Auth
- ⏳ Weryfikacja email (opcjonalna)
- ⏳ Przekierowanie po rejestracji
- **Test**: Nowy użytkownik może się zarejestrować i zalogować

### 2.3 Zarządzanie sesjami 🤖

- ⏳ Context dla stanu autoryzacji
- ⏳ Protected routes
- ⏳ Automatyczne wylogowanie przy wygaśnięciu sesji
- ⏳ Komponent wylogowania
- **Test**: Niezalogowany użytkownik nie ma dostępu do chronionych stron

### 2.4 Profile użytkownika 🤖

- ⏳ Strona profilu użytkownika
- ⏳ Edycja danych podstawowych (imię, nazwisko, bio)
- ⏳ Upload avatara do Firebase Storage
- ⏳ Zapisywanie profilu w Firestore
- **Test**: Użytkownik może edytować swój profil i zmiany są zapisywane

---

## ETAP 3: Podstawowe struktury danych i admin panel

### 3.1 Model danych wydarzeń 👤

- ⏳ Projekt struktury danych w Firestore (wydarzenia, zespoły, projekty)
- ⏳ Utworzenie kolekcji i dokumentów przykładowych
- ⏳ Reguły bezpieczeństwa Firestore dla różnych ról
- **Test**: Dane zapisują się poprawnie w Firestore

### 3.2 Podstawowy admin panel 🤖

- ⏳ Strona dashboard dla organizatora
- ⏳ Lista wydarzeń z podstawowymi informacjami
- ⏳ Formularz tworzenia nowego wydarzenia
- ⏳ Podstawowa edycja wydarzenia
- **Test**: Organizator może utworzyć i edytować wydarzenie

### 3.3 System ról użytkowników 🤖

- ⏳ Implementacja ról w profilu użytkownika
- ⏳ Middleware dla sprawdzania uprawnień
- ⏳ Przypisywanie ról przez organizatora
- ⏳ Różne widoki w zależności od roli
- **Test**: Różne role widzą różne menu i funkcjonalności

---

## ETAP 4: Zarządzanie wydarzeniami

### 4.1 Szczegóły wydarzenia 🤖

- ⏳ Strona szczegółów wydarzenia
- ⏳ Edycja opisu, regulaminu, harmonogramu
- ⏳ Konfiguracja terminów (rejestracja, zgłoszenia, oceny)
- ⏳ Upload dokumentów i materiałów
- **Test**: Wszystkie dane wydarzenia zapisują się i wyświetlają poprawnie

### 4.2 Kryteria oceny 🤖

- ⏳ Formularz definiowania kryteriów oceny
- ⏳ Ustawianie wag dla kryteriów
- ⏳ Skala ocen (0-10)
- ⏳ Podgląd i edycja kryteriów
- **Test**: Kryteria można dodawać, edytować i usuwać

### 4.3 Publikacja wydarzenia 🤖

- ⏳ Status wydarzenia (draft/published/archived)
- ⏳ Publiczna strona wydarzenia
- ⏳ Widok dla niezalogowanych użytkowników
- ⏳ Link do rejestracji
- **Test**: Opublikowane wydarzenie jest widoczne publicznie

---

## ETAP 5: Rejestracja zespołów

### 5.1 Tworzenie zespołu 🤖

- ⏳ Formularz tworzenia zespołu
- ⏳ Wybór wydarzenia do którego zespół się rejestruje
- ⏳ Podstawowe dane zespołu (nazwa, opis)
- ⏳ Automatyczne dodanie twórcy jako lidera
- **Test**: Użytkownik może utworzyć zespół i zostaje jego liderem

### 5.2 Zarządzanie członkami zespołu 🤖

- ⏳ Zapraszanie członków przez email
- ⏳ System zaproszeń (pending/accepted/declined)
- ⏳ Usuwanie członków zespołu
- ⏳ Przenoszenie roli lidera
- **Test**: Lider może zarządzać członkami zespołu

### 5.3 Edycja danych zespołu 🤖

- ⏳ Edycja nazwy i opisu zespołu
- ⏳ Upload logo zespołu
- ⏳ Kontakt zespołu
- ⏳ Blokada edycji po zgłoszeniu projektu
- **Test**: Dane zespołu można edytować do momentu zgłoszenia projektu

---

## ETAP 6: Zgłaszanie projektów

### 6.1 Formularz projektu 🤖

- ⏳ Formularz zgłoszenia projektu
- ⏳ Pola: nazwa, opis, link do repo, link do demo
- ⏳ Upload zdjęć i plików
- ⏳ Wybór kategorii/tagów
- **Test**: Zespół może wypełnić i zapisać draft projektu

### 6.2 Materiały projektu 🤖

- ⏳ Upload multiple plików (zdjęcia, dokumenty, video)
- ⏳ Podgląd uploadowanych materiałów
- ⏳ Usuwanie i zastępowanie plików
- ⏳ Limity rozmiarów plików
- **Test**: Wszystkie typy plików można uploadować i zarządzać nimi

### 6.3 Finalizacja zgłoszenia 🤖

- ⏳ Podgląd przed wysłaniem
- ⏳ Walidacja wymaganych pól
- ⏳ Potwierdzenie zgłoszenia
- ⏳ Blokada edycji po zgłoszeniu
- **Test**: Po zgłoszeniu projekt nie może być edytowany

---

## ETAP 7: System oceniania

### 7.1 Panel jury 🤖

- ⏳ Lista projektów do oceny
- ⏳ Filtrowanie i sortowanie projektów
- ⏳ Status oceny (nie ocenione/w trakcie/zakończone)
- ⏳ Podgląd materiałów projektu
- **Test**: Jury widzi wszystkie projekty przypisane do oceny

### 7.2 Formularz oceny 🤖

- ⏳ Oceny według zdefiniowanych kryteriów
- ⏳ Suwaki/pola numeryczne (0-10)
- ⏳ Pole na komentarz publiczny
- ⏳ Pole na komentarz prywatny (dla jury)
- **Test**: Jury może wystawić oceny i zapisać komentarze

### 7.3 Obliczanie wyników 🤖

- ⏳ Automatyczne obliczanie średniej ważonej
- ⏳ Ranking projektów w czasie rzeczywistym
- ⏳ Widok postępu oceniania dla organizatora
- ⏳ Blokada zmian po zakończeniu okresu ocen
- **Test**: Wyniki są obliczane poprawnie według wag kryteriów

---

## ETAP 8: Komentarze i feedback

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
