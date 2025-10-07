# Dokument wymagań produktu (PRD) - JamJudge

## 1. Przegląd produktu

JamJudge to lekka aplikacja webowa wspierająca organizację hackathonów i jamów projektowych. Umożliwia rejestrację zespołów, zgłaszanie projektów, ocenianie przez jury zgodnie z ustalonymi kryteriami oraz publikację wyników. MVP koncentruje się na jednym aktywnym wydarzeniu, prostym i niezawodnym przebiegu etapów oraz transparentnym ogłoszeniu wyników.

Zakres MVP obejmuje:

- Rejestrację użytkowników e‑mail/hasło i przypisywanie do zespołów
- Tworzenie zespołów, wypełnianie i wysyłkę zgłoszeń projektów
- Definicję kryteriów ocen z wagami, ocenianie per kryterium przez jury
- Automatyczne liczenie wyniku łącznego (średnia ważona) i publikację rankingu
- Jawny feedback jury ujawniany po zakończeniu etapu ocen

Główne role i dostęp:

- Organizator: pełny odczyt, zarządzanie wydarzeniem, etapami, kryteriami, rolami i publikacją wyników
- Jury: odczyt wszystkich projektów, zapis ocen i feedbacku
- Uczestnik: dostęp do własnego zespołu i projektu
- Publiczny: odczyt opublikowanego rankingu po publikacji

Cykl życia wydarzenia (etapy): Rejestracja → Praca → Zgłoszenia → Oceny → Publikacja wyników. Twarde deadline’y; po Submit edycja zablokowana; odblokowanie tylko przez Organizatora (z audytem).

## 2. Problem użytkownika

Problemy obecne przy organizacji hackathonów/jamów:

- Rozproszony proces (formularze, arkusze, e‑maile) zwiększa koszty operacyjne i ryzyko błędów
- Brak spójnego miejsca do zarządzania zespołami, zgłoszeniami, oceną i publikacją wyników
- Utrudniona transparentność ocen i feedbacku dla zespołów
- Stres i obciążenie dnia wydarzenia przy dużym wolumenie użytkowników

Cele produktu:

- Zapewnić spójny, prosty i niezawodny przepływ: rejestracja → zgłoszenie → ocena → wyniki
- Wymusić zasady fair‑play (twarde deadline’y, niezmienność po Submit)
- Umożliwić szybkie, czytelne ocenianie według zdefiniowanych kryteriów i wag
- Udostępnić publiczny ranking po zakończeniu ocen oraz jawny feedback zespołom

Grupy użytkowników i korzyści:

- Organizator: kontrola etapów, kryteriów i publikacji; niski koszt operacyjny
- Jury: proste wystawianie ocen per kryterium, jasne zasady
- Uczestnik: bezpieczne wypełnianie i wysyłka zgłoszenia na czas; późniejszy dostęp do feedbacku
- Publiczny: przejrzysty ranking po publikacji wyników

## 3. Wymagania funkcjonalne

### 3.1 Uwierzytelnianie i autoryzacja (RBAC)

- Rejestracja i logowanie e‑mail/hasło w Firebase Auth
- Role: Organizer, Jury, Participant; przypisanie roli i zespołu przez Organizatora
- Dostępy wymuszane w UI i Firebase Security Rules (min. uprawnienia do odczytu/zapisu per kolekcja)

### 3.2 Model wydarzenia i etapy

- Jedno aktywne wydarzenie w MVP
- Etapy: Rejestracja, Praca, Zgłoszenia, Oceny, Publikacja wyników
- Twarde deadline’y egzekwowane w aplikacji i zasadach Firestore
- Zgłoszenie po Submit staje się niezmienne; odblokowanie możliwe wyłącznie przez Organizatora (z audytem)

### 3.3 Zespoły

- Tworzenie zespołu przez Uczestnika w ramach aktywnego wydarzenia
- Zarządzanie składem zespołu do momentu Submit (edycja nazwy/opisu)
- Organizator może przypisywać użytkowników do zespołów i korygować skład (audyt)
- Parametry maks. rozmiaru zespołu dookreślane w konfiguracji wydarzenia (MVP: domyślne)

### 3.4 Projekty i zgłoszenia

- Formularz projektu: opis, repozytorium, demo, multimedia (pliki)
- Edycja projektu do deadline’u lub do chwili Submit, w zależności co nastąpi wcześniej
- Po Submit rekord projektu jest zablokowany przed edycją w UI i regułach
- Force‑unlock tylko przez Organizatora; każde odblokowanie odnotowane w audycie

### 3.5 Pliki i multimedia

- Upload do Firebase Storage; w MVP akceptowane dowolne typy/rozmiary
- Soft‑guardy w UI: komunikaty o kosztach/ryzyku, wskaźnik rozmiaru pliku
- Brak twardych limitów w MVP; zalecane logowanie wykorzystania Storage

### 3.6 Kryteria ocen i wagi

- Organizator definiuje kryteria (np. Innowacyjność, Wykonanie, UX) z wagami i skalą punktową (np. 0–10)
- Możliwość edycji kryteriów do startu etapu Oceny; po starcie zablokowane

### 3.7 Oceny i wynik łączny

- Każdy juror ocenia każdy projekt per kryterium
- System liczy wynik łączny jako średnią ważoną i zaokrągla do 2 miejsc po przecinku
- Brak kolejek/przydziałów w MVP; brak wskaźnika postępu jury (świadome ograniczenie)
- Tie‑break: do doprecyzowania; tymczasowo stabilne sortowanie po identyfikatorze projektu

### 3.8 Feedback jury

- Feedback jest jawny (nieanonimowy)
- Feedback staje się widoczny dla zespołów dopiero po zakończeniu etapu Oceny

### 3.9 Ranking i publikacja

- Po zakończeniu etapu Oceny Organizator publikuje ranking
- Publiczny read‑model rankingu dostępny bez logowania
- Zakres prezentacji per‑kryterium do doprecyzowania; w MVP minimum: nazwa zespołu/projektu i wynik łączny

### 3.10 Panel Organizatora

- Tworzenie wydarzenia, definicja etapów i deadline’ów
- Zarządzanie rolami i przypisaniami do zespołów
- Definiowanie kryteriów i wag; publikacja wyników
- Force‑unlock zgłoszeń z audytem
- Podgląd podstawowych KPI: liczba zespołów, rejestracje/odwiedziny, odsetek zgłoszeń on‑time

### 3.11 Widoki i nawigacja (UX)

- Uczestnik: dashboard zespołu i formularz projektu; status etapów i Submit
- Jury: lista projektów i karta oceny per kryterium
- Organizator: konfiguracja wydarzenia, kryteriów, ról; akcja publikacji
- Publiczny: ranking po publikacji

### 3.12 Telemetria i KPI

- Rejestrowane eventy: rejestracja, wizyty, Submit (on‑time / po czasie)
- Prosty dashboard KPI w panelu Organizatora (agregaty oparte o Firestore/Analytics)

### 3.13 Bezpieczeństwo i zgodność

- Firebase Security Rules wymuszające RBAC i etapy
- Niezmienność danych po Submit; odblokowanie tylko przez uprawnioną akcję
- Audyt kluczowych akcji (force‑unlock, publikacja wyników)

## 4. Granice produktu

Poza zakresem MVP:

- Rola Mentora i prywatne notatki/komentarze mentorskie
- Prywatne wątki komentarzy i złożone dyskusje
- Publiczny katalog z rozbudowanymi filtrami i tagami (poza podstawową listą i kartą projektu)
- Eksport wyników (CSV/PDF) i zaawansowane raporty/statystyki
- Zaawansowane zarządzanie wieloma wydarzeniami równolegle
- Integracje zewnętrzne (SSO, analityka zaawansowana, webhooks) i custom branding
- Kolejki/przydziały projektów dla jury oraz wskaźnik postępu

Ograniczenia/ryzyka świadomie zaakceptowane w MVP:

- Brak twardych limitów typów/rozmiarów plików; jedynie soft‑guardy i monitoring
- Tie‑break do doprecyzowania; tymczasowy stabilny porządek sortowania
- Zakres danych w rankingu per‑kryterium do ustalenia
- Polityka retencji danych i kosztów Storage dookreślana operacyjnie
- Weryfikacja e‑mail opcjonalna; domyślnie brak wymogu

Niefunkcjonalne (kluczowe):

- Stabilność w dniach wydarzenia (kilkuset równoczesnych użytkowników)
- Responsywność mobile‑first, dostępność podstawowa
- Wydajność odczytów: indeksy, paginacja, cache po stronie klienta, proste retry

## 5. Historyjki użytkowników

US‑001
Tytuł: Rejestracja konta e‑mail/hasło
Opis: Jako Użytkownik chcę zarejestrować konto za pomocą e‑maila i hasła, aby uzyskać dostęp do aplikacji.
Kryteria akceptacji:

- Użytkownik podaje unikalny e‑mail i hasło spełniające minimalne wymagania
- Po pomyślnej rejestracji konto jest tworzone w Firebase Auth i profil w bazie
- W razie błędu (zajęty e‑mail) wyświetlany jest komunikat

US‑002
Tytuł: Logowanie do aplikacji
Opis: Jako Użytkownik chcę zalogować się e‑mail/hasło, aby korzystać z funkcji zgodnych z moją rolą.
Kryteria akceptacji:

- Po podaniu poprawnych danych sesja jest aktywowana
- W razie niepoprawnych danych użytkownik otrzymuje komunikat bez ujawniania szczegółów
- Po wylogowaniu sesja i lokalne dane są wyczyszczone

US‑003
Tytuł: Reset hasła
Opis: Jako Użytkownik chcę móc zresetować hasło, aby odzyskać dostęp do konta.
Kryteria akceptacji:

- Użytkownik może wysłać link resetu hasła na e‑mail zarejestrowany w systemie
- Po użyciu linku może ustawić nowe hasło
- Próby na nieistniejący e‑mail nie ujawniają, czy konto istnieje

US‑004
Tytuł: Egzekwowanie dostępu opartego o role (RBAC)
Opis: Jako Właściciel danych chcę, aby tylko uprawnione role miały odpowiedni dostęp do odczytu/zapisu.
Kryteria akceptacji:

- Uczestnik widzi wyłącznie własny zespół/projekt
- Jury może czytać wszystkie projekty, ale zapisywać tylko oceny i feedback
- Organizator ma pełny odczyt i administracyjne akcje; reguły Firestore blokują niedozwolone zapisy

US‑010
Tytuł: Utworzenie wydarzenia
Opis: Jako Organizator chcę utworzyć wydarzenie, aby rozpocząć konfigurację etapów i kryteriów.
Kryteria akceptacji:

- Formularz tworzy dokument Event z podstawowymi danymi
- Domyślny stan: Rejestracja
- Zdarzenie pojawia się w panelu Organizatora

US‑011
Tytuł: Konfiguracja etapów i deadline’ów
Opis: Jako Organizator chcę zdefiniować etapy i twarde deadline’y, aby sterować przebiegiem wydarzenia.
Kryteria akceptacji:

- Możliwość ustawienia dat dla: Rejestracja, Praca, Zgłoszenia, Oceny, Publikacja wyników
- Po przekroczeniu czasu aplikacja i reguły uniemożliwiają akcje sprzeczne z etapem
- Zmiana etapu wymaga uprawnień Organizatora

US‑012
Tytuł: Definicja kryteriów i wag
Opis: Jako Organizator chcę skonfigurować kryteria, skale i wagi, aby jury oceniało spójnie.
Kryteria akceptacji:

- Dodawanie/edycja/usuwanie kryteriów do startu etapu Oceny
- Walidacja sumy wag (rekomendacja: 100%) lub normalizacja przy obliczeniach
- Blokada edycji po rozpoczęciu ocen

US‑020
Tytuł: Utworzenie zespołu
Opis: Jako Uczestnik chcę utworzyć zespół w ramach wydarzenia, aby móc zgłosić projekt.
Kryteria akceptacji:

- Formularz tworzy Team z nazwą i właścicielem
- Zespół widoczny tylko dla członków i Organizatora
- Edycja nazwy/opisu do momentu Submit

US‑021
Tytuł: Zarządzanie członkami zespołu
Opis: Jako Uczestnik chcę dodać/usunąć członków zespołu przed Submit, aby skompletować skład.
Kryteria akceptacji:

- Dodanie członka wymaga potwierdzenia ze strony użytkownika lub przypisania przez Organizatora
- Skład zespołu jest widoczny członkom i Organizatorowi
- Po Submit edycja składu zablokowana

US‑022
Tytuł: Przypisanie użytkownika do zespołu przez Organizatora
Opis: Jako Organizator chcę przypisywać użytkowników do zespołów, aby szybko korygować składy.
Kryteria akceptacji:

- Formularz przypisuje użytkownika do wybranego zespołu
- Akcja zapisywana w audycie
- Ograniczenia zgodne z etapem i Security Rules

US‑030
Tytuł: Wypełnienie formularza projektu
Opis: Jako Uczestnik chcę wypełnić opis projektu, repozytorium, demo i multimedia, aby przygotować zgłoszenie.
Kryteria akceptacji:

- Formularz waliduje wymagane pola
- Zmiany zapisywane w szkicu do momentu Submit lub deadline’u
- Dane są widoczne w podglądzie projektu

US‑031
Tytuł: Upload plików projektu
Opis: Jako Uczestnik chcę wgrać pliki/multimedia do projektu, aby dołączyć materiały.
Kryteria akceptacji:

- Upload do Firebase Storage z prezentacją rozmiaru
- Brak twardych limitów w MVP; UI wyświetla ostrzeżenia o dużych plikach
- Linki do plików zapisane przy projekcie

US‑032
Tytuł: Submit projektu i blokada edycji
Opis: Jako Uczestnik chcę wysłać finalne zgłoszenie, aby zamknąć edycję projektu przed oceną.
Kryteria akceptacji:

- Po Submit edycja pól projektu i składu zespołu jest zablokowana
- Status projektu zmienia się na wysłany i jest widoczny w UI
- Próba edycji po Submit odrzucona w UI i przez Security Rules

US‑033
Tytuł: Edycja projektu przed Submit i przed deadline’em
Opis: Jako Uczestnik chcę móc edytować wszystkie dane projektu przed wysyłką w ramach wyznaczonych terminów.
Kryteria akceptacji:

- Edycja możliwa wyłącznie przed Submit i przed końcem etapu Zgłoszenia
- Po przekroczeniu deadline’u zapis odrzucony
- UI wyraźnie pokazuje czas do deadline’u

US‑034
Tytuł: Force‑unlock przez Organizatora
Opis: Jako Organizator chcę czasowo odblokować projekt po Submit, aby umożliwić poprawki wyjątkowe.
Kryteria akceptacji:

- Akcja dostępna tylko dla Organizatora, wymaga podania powodu
- Każde odblokowanie odnotowane z czasem i użytkownikiem
- Po zakończeniu edycji Organizator ponownie blokuje projekt

US‑040
Tytuł: Lista projektów dla jury
Opis: Jako Juror chcę przeglądać listę wszystkich projektów, aby wybrać projekt do oceny.
Kryteria akceptacji:

- Lista projektów z podstawowymi metadanymi
- Filtrowanie/sortowanie podstawowe (opcjonalne w MVP)
- Wejście w kartę projektu

US‑041
Tytuł: Wystawienie oceny per kryterium
Opis: Jako Juror chcę wprowadzić ocenę dla każdego kryterium projektu, aby wypełnić kartę ocen.
Kryteria akceptacji:

- Formularz oceny waliduje zakresy skali
- Zapis pojedynczych ocen i stanu wypełnienia
- Juror może uzupełniać/aktualizować oceny do końca etapu Oceny

US‑042
Tytuł: Edycja/aktualizacja ocen do deadline’u
Opis: Jako Juror chcę móc poprawić swoje oceny przed zakończeniem etapu Oceny.
Kryteria akceptacji:

- Edycja możliwa do końca etapu Oceny
- Po zamknięciu etapu edycja zablokowana
- System zachowuje ostatnią wersję ocen jurora

US‑043
Tytuł: Obliczenie wyniku łącznego
Opis: Jako System chcę policzyć średnią ważoną ocen per projekt i zaokrąglić do 2 miejsc po przecinku.
Kryteria akceptacji:

- Wynik łączny liczony deterministycznie na podstawie wag i ocen
- Zaokrąglenie do 2 miejsc po przecinku
- Zmiana kryteriów po starcie etapu Oceny nie wpływa na bieżące obliczenia

US‑050
Tytuł: Wprowadzenie jawnego feedbacku
Opis: Jako Juror chcę dodać komentarz do projektu, aby przekazać zespołowi feedback.
Kryteria akceptacji:

- Feedback zapisywany z identyfikatorem jurora
- Widoczność opóźniona do zakończenia etapu Oceny
- Próba podglądu wcześniej jest zablokowana dla zespołów

US‑051
Tytuł: Podgląd feedbacku po zakończeniu ocen
Opis: Jako Zespół chcę zobaczyć feedback jurorów po zakończeniu etapu Oceny.
Kryteria akceptacji:

- Po zamknięciu etapu Oceny feedback staje się dostępny dla członków zespołu
- Feedback jest niefiltrowany i jawny (z nazwą jurora)
- Brak możliwości edycji feedbacku przez zespół

US‑060
Tytuł: Publikacja rankingu
Opis: Jako Organizator chcę opublikować ranking projektów po zakończeniu ocen, aby udostępnić wyniki.
Kryteria akceptacji:

- Akcja publikacji tworzy publiczny read‑model rankingu
- Ranking jest nieedytowalny po publikacji; ewentualne korekty przez republish (audyt)
- Zakres prezentowanych danych minimalnie obejmuje nazwę projektu i wynik łączny

US‑061
Tytuł: Publiczny podgląd rankingu
Opis: Jako Gość chcę zobaczyć ranking projektów bez logowania.
Kryteria akceptacji:

- Strona publiczna dostępna po publikacji
- Brak dostępu do projektów nieopublikowanych lub w trakcie ocen
- Stabilne sortowanie; rozwiązanie remisów do doprecyzowania

US‑070
Tytuł: Ograniczenie widoczności danych według roli i etapu
Opis: Jako System chcę egzekwować widoczność danych adekwatnie do roli użytkownika i etapu wydarzenia.
Kryteria akceptacji:

- Security Rules blokują niedozwolone odczyty/zapisy
- UI nie pokazuje akcji niedostępnych w danym etapie
- Próby naruszeń zapisane w logach klienta (telemetria)

US‑080
Tytuł: Ostrzeżenia przy dużych uploadach
Opis: Jako Uczestnik chcę otrzymać ostrzeżenie przy dużych plikach, aby świadomie zarządzać kosztami i ryzykiem.
Kryteria akceptacji:

- UI pokazuje rozmiar pliku i ostrzega powyżej progu soft
- Upload nie jest blokowany w MVP
- Rozmiary sumaryczne mogą być prezentowane w panelu Organizatora (podstawowo)

US‑081
Tytuł: Monitoring podstawowych metryk Storage
Opis: Jako Organizator chcę widzieć podstawowe informacje o wykorzystaniu Storage, aby reagować na nadużycia.
Kryteria akceptacji:

- Widok agreguje liczbę i przybliżony rozmiar plików per projekt
- Brak operacji kasowania masowego w MVP
- Dane odświeżane okresowo lub na żądanie

US‑090
Tytuł: Blokada Submit po deadline’ie
Opis: Jako System chcę uniemożliwić wysyłkę zgłoszenia po upływie deadline’u.
Kryteria akceptacji:

- Przycisk Submit nieaktywny po deadline’ie
- Próba wymuszenia zapisu odrzucona przez Security Rules
- Komunikat w UI informuje o przekroczeniu czasu

US‑091
Tytuł: Blokada edycji ocen po zakończeniu etapu
Opis: Jako System chcę zablokować edycję ocen po zamknięciu etapu Oceny.
Kryteria akceptacji:

- Formularze oceny stają się tylko do odczytu po zakończeniu etapu
- Zapisy po czasie są odrzucane przez Security Rules
- Widoczny jest czas zamknięcia etapu

US‑094
Tytuł: Audyt akcji administracyjnych
Opis: Jako Organizator chcę, aby kluczowe akcje administracyjne były audytowane.
Kryteria akceptacji:

- Każdy force‑unlock i publikacja wyników zapisane z użytkownikiem, czasem i powodem
- Log audytu dostępny Organizatorowi do wglądu
- Brak możliwości edycji wpisów audytu

US‑100
Tytuł: Rejestracja telemetrii KPI
Opis: Jako System chcę rejestrować zdarzenia kluczowe dla KPI, aby mierzyć sukces MVP.
Kryteria akceptacji:

- Zdarzenia: rejestracja, wizyty, Submit on‑time
- Agregaty prezentowane w panelu Organizatora w prostym dashboardzie
- Dane możliwe do eksportu ręcznego poza aplikacją (poza MVP automatyzacja)

## 6. Metryki sukcesu

KPI główne (MVP):

- Liczba zespołów biorących udział w wydarzeniu
- Zainteresowanie: liczba rejestracji i odwiedzin w okresie wydarzenia
- Odsetek projektów zgłoszonych na czas (Submit przed deadline’em)

Kryteria sukcesu produktu:

- Organizator może skonfigurować wydarzenie, kryteria, terminy i opublikować wyniki
- Uczestnicy tworzą zespoły i zgłaszają projekty bez utraty danych
- Jury ocenia projekty zgodnie z kryteriami; system wylicza wynik łączny (średnia ważona, 2 miejsca po przecinku)
- Po zakończeniu ocen dostępny jest ranking i jawny feedback dla zespołów

Lista kontrolna PRD:

- Każda historyjka posiada jasne, testowalne kryteria akceptacji
- Kryteria akceptacji są konkretne, oparte o zachowania systemu i reguły dostępu
- Zestaw historyjek pokrywa pełny przepływ MVP dla Organizatora, Jury, Uczestnika i Gościa
- Uwzględniono wymagania uwierzytelniania i autoryzacji (RBAC, Security Rules)
