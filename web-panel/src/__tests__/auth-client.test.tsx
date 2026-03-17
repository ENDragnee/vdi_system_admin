import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AuthClientPage from "../app/auth/auth-client";
import { signIn } from "next-auth/react";


// Mock Next.js Router
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

describe("AuthClientPage", () => {
  // Clear mocks and timers before each test to ensure isolation
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("renders the sign in form correctly", () => {
    render(<AuthClientPage />);

    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("handles successful sign in and redirects to dashboard", async () => {
    const user = userEvent.setup();

    // Mock the signIn function to return a successful response
    vi.mocked(signIn).mockResolvedValueOnce({ ok: true, error: null } as any);

    render(<AuthClientPage />);

    // Simulate user typing
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");

    // Simulate clicking submit
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    // Verify signIn was called with correct arguments
    expect(signIn).toHaveBeenCalledWith("credentials", {
      email: "test@example.com",
      password: "password123",
      redirect: false,
    });

    // Verify router functions were called
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("displays an error message when authentication fails", async () => {
    const user = userEvent.setup();

    // Mock the signIn function to return an error
    vi.mocked(signIn).mockResolvedValueOnce({
      ok: false,
      error: "Invalid email or password"
    } as any);

    render(<AuthClientPage />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    // Check if the error is displayed on screen
    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("handles catch block errors if signIn throws an exception", async () => {
    const user = userEvent.setup();

    // Mock signIn to throw an actual JavaScript error
    vi.mocked(signIn).mockRejectedValueOnce(new Error("Network failure"));

    render(<AuthClientPage />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Authentication error: Network failure")).toBeInTheDocument();
  });

  it("clears the error message after 3 seconds", async () => {
    // 1. Hijack the clock
    vi.useFakeTimers();

    vi.mocked(signIn).mockResolvedValueOnce({ error: "Temporary error" } as any);
    render(<AuthClientPage />);

    // 2. Fill the form
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password" } });

    // 3. Click the button to trigger the async handleEmailAuth function
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // 4. THE MAGIC FIX: 
    // Instead of using `findByText` (which relies on frozen timers), 
    // we manually flush the JavaScript promise queue. 
    // This forces `await signIn(...)` to resolve immediately!
    await act(async () => {
      await Promise.resolve();
    });

    // 5. Because we flushed the promises above, the state has updated.
    // We can safely use the SYNCHRONOUS `getByText`. No deadlocks!
    expect(screen.getByText("Temporary error")).toBeInTheDocument();

    // 6. Fast-forward the clock by 3 seconds to trigger the useEffect cleanup.
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // 7. Verify the error is gone
    expect(screen.queryByText("Temporary error")).not.toBeInTheDocument();

    // 8. Restore the real clock for the next tests
    vi.useRealTimers();
  });

  it("disables inputs and shows loading state during submission", async () => {
    // Create a promise that we intentionally DO NOT resolve immediately
    let resolveSignIn: any;
    const signInPromise = new Promise((resolve) => {
      resolveSignIn = resolve;
    });
    vi.mocked(signIn).mockReturnValueOnce(signInPromise as any);

    render(<AuthClientPage />);

    // Fill out form
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });

    // Click submit (using fireEvent so it doesn't hang waiting for the promise)
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // The UI is now frozen in the loading state. We can safely assert the sub-components.
    expect(await screen.findByRole("button", { name: /signing in\.\.\./i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /signing in\.\.\./i })).toBeDisabled();
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();

    // Clean up by resolving the promise inside act() to prevent memory leak warnings
    await act(async () => {
      resolveSignIn({ ok: true });
    });
  });
});
