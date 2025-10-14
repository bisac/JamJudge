import { describe, it, expect } from "vitest";
import { getAuthErrorMessage } from "../firebaseErrors";

describe("getAuthErrorMessage", () => {
  it('should return "Nieprawidłowy email lub hasło." for invalid credentials', () => {
    expect(getAuthErrorMessage("auth/invalid-credential")).toBe(
      "Nieprawidłowy email lub hasło.",
    );
    expect(getAuthErrorMessage("auth/user-not-found")).toBe(
      "Nieprawidłowy email lub hasło.",
    );
    expect(getAuthErrorMessage("auth/wrong-password")).toBe(
      "Nieprawidłowy email lub hasło.",
    );
  });

  it('should return "Ten adres email jest już zarejestrowany." for email-already-in-use', () => {
    expect(getAuthErrorMessage("auth/email-already-in-use")).toBe(
      "Ten adres email jest już zarejestrowany.",
    );
  });

  it('should return "Hasło jest zbyt słabe. Użyj co najmniej 6 znaków." for weak-password', () => {
    expect(getAuthErrorMessage("auth/weak-password")).toBe(
      "Hasło jest zbyt słabe. Użyj co najmniej 6 znaków.",
    );
  });

  it("should return a default error message for an unknown error code", () => {
    expect(getAuthErrorMessage("auth/some-unknown-error")).toBe(
      "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
    );
  });

  it("should return a default error message for an empty string", () => {
    expect(getAuthErrorMessage("")).toBe(
      "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
    );
  });
});
