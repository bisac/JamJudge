# JamJudge – wymagania biznesowe

## 🎯 Cel projektu

JamJudge to platforma do obsługi hackathonów i jamów projektowych.
Umożliwia uczestnikom rejestrację zespołów i zgłaszanie projektów, jurorom – ocenianie według ustalonych kryteriów, a organizatorom – sprawne zarządzanie wydarzeniem i publikację wyników.

## ✅ Wymagania funkcjonalne

### Role użytkowników

- **Uczestnik** – tworzy i zarządza zespołem, zgłasza projekt, widzi feedback od jury.
- **Jury** – ocenia projekty według kryteriów, zostawia komentarze.
- **Mentor** – wspiera uczestników komentarzami i prywatnymi notatkami.
- **Organizator (Admin)** – zarządza wydarzeniami, kryteriami oceny, użytkownikami i publikacją wyników.

### Obszary funkcjonalne

#### Zarządzanie wydarzeniem
- Tworzenie wydarzeń z opisem, regulaminem i harmonogramem.
- Definiowanie terminów (rejestracja, zgłoszenia, oceny, wyniki).
- Definiowanie kryteriów oceny (np. Innowacyjność, Wykonanie, UX).

#### Rejestracja uczestników i zespołów
- Tworzenie zespołu i zapraszanie członków.
- Edycja danych zespołu do momentu zgłoszenia projektu.

#### Zgłaszanie projektów
- Formularz projektu (opis, repozytorium, demo, multimedia).
- Możliwość edycji do momentu ostatecznego zgłoszenia lub deadline'u.
- Blokada edycji po wysłaniu.

#### Ocena projektów
- Jury wystawia oceny wg kryteriów.
- Każde kryterium oceniane w skali (np. 0–10).
- Automatyczne obliczanie wyniku łącznego (średnia ważona).
- Widok rankingowy projektów po zakończeniu ocen.

#### Komentarze i feedback
- Komentarze publiczne widoczne dla zespołu.
- Komentarze prywatne (jury ↔ jury, mentor ↔ mentor).
- Możliwość prowadzenia wątków dyskusyjnych przy projekcie.

#### Panel organizatora
- Zarządzanie wydarzeniem, kryteriami, rolami i użytkownikami.
- Podgląd zgłoszeń, postępów ocen, statystyk.
- Eksport wyników i ocen (np. CSV/PDF).
- Możliwość publikacji wyników na stronie wydarzenia.

#### Publiczny katalog projektów (opcjonalnie)
- Lista wszystkich zgłoszeń w danym wydarzeniu.
- Filtry po kategoriach, tagach.
- Karta projektu z opisem i materiałami.

## 📋 Wymagania niefunkcjonalne

- **Dostępność czasowa** – system działa 24/7, szczególnie w dniach wydarzenia.
- **Wydajność** – obsługa co najmniej kilkuset użytkowników jednocześnie.
- **Bezpieczeństwo** – kontrola dostępu w zależności od roli użytkownika.
- **Niezawodność** – brak utraty danych po zgłoszeniu projektu ani po zakończeniu ocen.
- **Prostota obsługi** – interfejs intuicyjny i przyjazny dla osób nietechnicznych.
- **Skalowalność** – możliwość obsługi wielu wydarzeń równolegle.
- **Transparentność** – jasne zasady ocen i wgląd w komentarze.
- **Konfigurowalność** – elastyczna definicja kryteriów i harmonogramu wydarzenia.
- **Dostęp mobilny** – pełna dostępność przez przeglądarki desktopowe i mobilne.
- **Rzetelność wyników** – brak możliwości manipulacji ocenami.
- **Raportowanie** – możliwość generowania wyników i statystyk.

## 🛠️ Stack technologiczny

Do realizacji projektu zostanie wykorzystany nowoczesny, szybki i skalowalny zestaw technologii:

### Frontend:
- **React + TypeScript** – szybki rozwój i bezpieczeństwo typów,
- **Ant Design** – spójny i estetyczny zestaw komponentów UI.

### Backend i baza danych:
- **Firebase** (Firestore, Auth, Cloud Functions, Storage) – serwerless, skalowalne i proste w utrzymaniu środowisko,
- **Firebase Hosting** – szybkie i bezpieczne hostowanie aplikacji.

### CI/CD i jakość:
- **GitHub Actions** – automatyzacja buildów, testów i deploymentu,
- Zintegrowane testy jednostkowe i end-to-end,
- Repozytorium kodu w GitHub z kontrolą wersji.

### Środowisko pracy:
- **Node.js** (do uruchamiania narzędzi i funkcji backendowych),
- narzędzia developerskie: linting, formatowanie kodu, testy automatyczne.
