# Test Plan - Cloud Functions

## Przygotowanie testów

### 1. Uruchom aplikację
```bash
npm run dev
```

### 2. Zaloguj się jako Organizer
- Przejdź do: http://localhost:5173
- Zaloguj się kontem z rolą `organizer`
- Jeśli nie masz takiego konta, utwórz je i ustaw rolę w Firestore:
  ```
  users/{uid}/role = "organizer"
  ```

## Test funkcji forceUnlockProject

### Krok 1: Przygotuj dane testowe

W Firestore utwórz testowy projekt:
```
projects/{projectId}
{
  eventId: "test-event",
  teamId: "test-team",
  name: "Test Project",
  description: "Test",
  status: "submitted",  // WAŻNE: musi być submitted!
  submittedAt: [current timestamp],
  createdBy: "some-uid",
  createdAt: [timestamp],
  updatedAt: [timestamp]
}
```

### Krok 2: Otwórz DevTools Console (F12)

### Krok 3: Przejdź do Projects Management
```
http://localhost:5173/organizer/projects
```

### Krok 4: Znajdź projekt ze statusem "Submitted"
- Powinieneś zobaczyć projekt w tabeli
- Przy projekcie submitted powinien być przycisk z menu (trzy kropki)

### Krok 5: Kliknij "Force Unlock"
1. Kliknij trzy kropki przy projekcie
2. Wybierz "Force Unlock"
3. Potwierdź w dialogu
4. Wypełnij formularz:
   - Reason: "Testing force unlock functionality"
   - Unlock Minutes: 60
5. Kliknij "Unlock"

### Oczekiwany rezultat:
✅ Komunikat sukcesu: "Project unlocked successfully"
✅ W tabeli pojawi się kolumna "Force Unlock Until" z datą
✅ W Firestore w dokumencie projektu pojawi się pole `forceUnlockUntil`
✅ W kolekcji `audits` pojawi się nowy wpis

---

## Weryfikacja w Firestore

### 1. Sprawdź dokument projektu:
```
projects/{projectId}
Powinien mieć:
- forceUnlockUntil: [timestamp za ~60 minut]
- updatedAt: [aktualny timestamp]
```

### 2. Sprawdź wpis audytowy:
```
audits/{auditId}
{
  action: "forceUnlockProject",
  actorUid: "[twoje uid]",
  eventId: "test-event",
  projectId: "[project id]",
  teamId: "test-team",
  reason: "Testing force unlock functionality",
  payload: {
    unlockMinutes: 60,
    forceUnlockUntil: [timestamp]
  },
  createdAt: [timestamp]
}
```

---

## Test błędów (opcjonalnie)

### Test 1: Próba unlock przez non-organizer
1. Zaloguj się jako participant/jury
2. W konsoli DevTools wykonaj:
```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const forceUnlock = httpsCallable(functions, 'forceUnlockProject');

forceUnlock({ 
  projectId: 'test-project-id',
  reason: 'Test',
  unlockMinutes: 60
})
.then(result => console.log('Success:', result))
.catch(error => console.error('Error:', error));
```

**Oczekiwany błąd:** "permission-denied: Only organizers can unlock projects"

### Test 2: Próba unlock projektu w statusie "draft"
Zmień projekt na status "draft" i spróbuj unlock

**Oczekiwany błąd:** "failed-precondition: Only submitted projects can be unlocked"

### Test 3: Brak reason
Spróbuj unlock bez powodu lub z za krótkim powodem (<10 znaków)

**Oczekiwany błąd:** "invalid-argument: reason is required and must be at least 10 characters"

---

## Monitoring logów

### W czasie testu obserwuj logi w konsoli Firebase:
https://console.firebase.google.com/project/jamjudge/functions/logs

Powinieneś zobaczyć:
- ✅ Wywołanie funkcji forceUnlockProject
- ✅ Status: 200 OK (sukces) lub 403/400 (błędy autoryzacji/walidacji)
- ✅ Czas wykonania funkcji

---

## Troubleshooting

### Błąd: "Function not found"
- Sprawdź czy funkcja jest wdrożona: https://console.firebase.google.com/project/jamjudge/functions
- Sprawdź region funkcji (powinna być us-central1 domyślnie)

### Błąd: "CORS error"
- Firebase Functions automatycznie obsługują CORS dla Callable Functions
- Jeśli widzisz błąd CORS, sprawdź czy używasz `httpsCallable` (nie zwykły fetch)

### Błąd: "Internal error"
- Sprawdź logi w konsoli Firebase
- Prawdopodobnie problem z Firestore permissions lub danymi

### Funkcja się nie wywołuje
- Otwórz Network tab w DevTools i zobacz czy request jest wysyłany
- Sprawdź czy `firebase.ts` ma poprawną konfigurację

