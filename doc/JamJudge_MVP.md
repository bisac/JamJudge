# Aplikacja - JamJudge (MVP)

## Główny problem

W trakcie hackathonów i jamów projektowych organizatorzy, uczestnicy i jury potrzebują jednego, spójnego miejsca do rejestracji zespołów, zgłaszania projektów, oceniania według zdefiniowanych kryteriów oraz publikacji wyników. Obecnie proces bywa rozproszony (formularze, arkusze, e‑maile), co zwiększa koszty operacyjne, ryzyko błędów i utrudnia transparentną komunikację wyników.

## Najmniejszy zestaw funkcjonalności

- Rejestracja uczestników i zespołów:
  - Tworzenie zespołu, zapraszanie członków, edycja danych do momentu zgłoszenia projektu.

- Zgłaszanie projektów:
  - Formularz projektu (opis, repozytorium, demo, multimedia), możliwość edycji do deadline'u lub ostatecznego zgłoszenia, blokada edycji po wysłaniu.

- Ocena projektów przez jury:
  - Definiowane przez organizatora kryteria (np. Innowacyjność, Wykonanie, UX) z wagami i skalą (np. 0–10).
  - Wystawianie ocen per kryterium, automatyczne liczenie wyniku łącznego (średnia ważona).
  - Publiczny feedback od jury widoczny dla zespołu.

- Panel organizatora (podstawowy):
  - Tworzenie wydarzenia (opis, regulamin, harmonogram) i definiowanie terminów (rejestracja, zgłoszenia, oceny, wyniki).
  - Zarządzanie kryteriami i rolami (Uczestnik, Jury, Organizator), publikacja wyników po zakończeniu ocen.

- Widoki podsumowań:
  - Ranking projektów po zakończeniu ocen, karta projektu z opisem i materiałami.

- Bezpieczeństwo i dostęp:
  - Kontrola dostępu zgodnie z rolą użytkownika, podstawowa autoryzacja i walidacja uprawnień.

## Co NIE wchodzi w zakres MVP

- Rola Mentora oraz prywatne notatki/komentarze mentorskie.
- Prywatne wątki komentarzy (jury ↔ jury, mentor ↔ mentor) i złożone dyskusje wątkowe.
- Publiczny katalog projektów z rozbudowanymi filtrami i tagami (poza podstawową listą i kartą projektu).
- Eksport wyników i ocen do plików (CSV/PDF) oraz zaawansowane raporty/statystyki.
- Zaawansowane zarządzanie wieloma wydarzeniami równolegle w jednym wdrożeniu (MVP skupia się na jednym aktywnym wydarzeniu).
- Integracje zewnętrzne (SSO, narzędzia analityczne, webhooks) i custom branding poza domyślną stylistyką.

## Kryteria sukcesu

- Organizator może utworzyć wydarzenie, zdefiniować kryteria i terminy oraz opublikować wyniki.
- Uczestnicy zakładają zespoły i zgłaszają projekty do deadline'u bez utraty danych.
- Jury ocenia projekty według kryteriów; system poprawnie liczy wynik łączny (średnia ważona).
- Po zakończeniu ocen dostępny jest ranking oraz publiczny feedback dla zespołów.
- Interfejs jest prosty i czytelny (desktop i mobile), zgodny ze standardami dostępności.
- Aplikacja działa stabilnie w dniach wydarzenia i obsługuje kilkuset równoczesnych użytkowników.
