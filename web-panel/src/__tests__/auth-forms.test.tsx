import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { SignInForm } from "../components/auth/signin-form";
import { SignUpForm } from "../components/auth/signup-form";
import { AuthErrorDisplay } from "../components/auth/auth-error-display";

describe("auth forms", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the sign in form and forwards submit events", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<SignInForm onSubmit={onSubmit} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /forgot password/i })).toHaveAttribute("href", "/forgot-password");
    expect(screen.getByRole("button", { name: /sign in/i })).toBeEnabled();

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("shows loading state in the sign in form", () => {
    render(<SignInForm onSubmit={vi.fn().mockResolvedValue(undefined)} isLoading />);

    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();
  });

  it("validates sign up fields before enabling submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<SignUpForm onSubmit={onSubmit} />);

    const submitButton = screen.getByRole("button", { name: /create account/i });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText(/^email$/i), "invalid-email");
    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await user.clear(screen.getByLabelText(/^email$/i));
    await user.type(screen.getByLabelText(/^email$/i), "new.user@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");

    expect(submitButton).toBeEnabled();

    await user.click(submitButton);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("shows password mismatch feedback in the sign up form", async () => {
    const user = userEvent.setup();

    render(<SignUpForm onSubmit={vi.fn().mockResolvedValue(undefined)} />);

    await user.type(screen.getByLabelText(/^email$/i), "new.user@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password456");

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeDisabled();
  });

  it("renders auth errors only when provided", () => {
    const { rerender } = render(<AuthErrorDisplay error="" />);

    expect(screen.queryByText(/./)).not.toBeInTheDocument();

    rerender(<AuthErrorDisplay error="Invalid password" />);

    expect(screen.getByText("Invalid password")).toBeInTheDocument();
  });
});