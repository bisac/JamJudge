 
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../LoginPage";
import { AuthContext } from "../../../contexts/AuthContext";
import type { AuthContextType } from "../../../contexts/AuthContext";
// Helper to render component with necessary providers
const renderWithProviders = (
  ui: React.ReactElement,
  contextValue: Partial<AuthContextType>,
) => {
  const fullContextValue: AuthContextType = {
    user: null,
    firebaseUser: null,
    isLoading: false,
    hasMultipleRoles: false,
    login: async () => {},
    signUp: async () => {},
    resetPassword: async () => {},
    signOut: async () => {},
    ...contextValue,
  };

  return render(
    <AuthContext.Provider value={fullContextValue}>
      <MemoryRouter>{ui}</MemoryRouter>
    </AuthContext.Provider>,
  );
};

describe("LoginPage", () => {
  it("renders the login form correctly", () => {
    renderWithProviders(<LoginPage />, {});
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Hasło/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Zaloguj się/i }),
    ).toBeInTheDocument();
  });

  it("allows the user to log in successfully", async () => {
    const user = userEvent.setup();
    const loginMock = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(<LoginPage />, { login: loginMock });

    await user.type(screen.getByLabelText(/Email/i), "test@example.com");
    await user.type(screen.getByLabelText(/Hasło/i), "password123");
    await user.click(screen.getByRole("button", { name: /Zaloguj się/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith("test@example.com", "password123");
    });
  });

  it("shows an error message on failed login", async () => {
    const user = userEvent.setup();
    const loginMock = vi.fn().mockRejectedValue({
      code: "auth/invalid-credential",
    });

    renderWithProviders(<LoginPage />, { login: loginMock });

    await user.type(screen.getByLabelText(/Email/i), "wrong@example.com");
    await user.type(screen.getByLabelText(/Hasło/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /Zaloguj się/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Nieprawidłowy email lub hasło./i),
      ).toBeInTheDocument();
    });
  });
});
