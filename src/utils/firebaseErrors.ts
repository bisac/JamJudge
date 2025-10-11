// Map Firebase Auth error codes to user-friendly Polish messages

export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    // Login errors
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Nieprawidłowy email lub hasło.";

    case "auth/invalid-email":
      return "Nieprawidłowy format adresu email.";

    case "auth/user-disabled":
      return "To konto zostało zablokowane.";

    case "auth/too-many-requests":
      return "Zbyt wiele nieudanych prób logowania. Spróbuj ponownie później.";

    // Sign up errors
    case "auth/email-already-in-use":
      return "Ten adres email jest już zarejestrowany.";

    case "auth/operation-not-allowed":
      return "Rejestracja jest obecnie niedostępna.";

    case "auth/weak-password":
      return "Hasło jest zbyt słabe. Użyj co najmniej 6 znaków.";

    // Network and permission errors
    case "auth/network-request-failed":
      return "Błąd połączenia sieciowego. Sprawdź swoje połączenie internetowe.";

    case "permission-denied":
      return "Brak uprawnień do wykonania tej operacji.";

    case "unavailable":
      return "Usługa jest tymczasowo niedostępna. Spróbuj ponownie później.";

    // Default
    default:
      return "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.";
  }
};
