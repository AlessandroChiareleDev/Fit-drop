import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthGuard } from "@/components/auth-guard";

// Mock useAuth and useRouter
const mockReplace = vi.fn();
const mockUseAuth = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

vi.mock("@/lib/auth", () => ({
  useAuth: () => mockUseAuth(),
}));

beforeEach(() => {
  mockReplace.mockReset();
  mockUseAuth.mockReset();
});

describe("AuthGuard", () => {
  it("shows loading spinner while auth is loading", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });

    render(
      <AuthGuard allowedRoles={["student"]}>
        <div>Protected Content</div>
      </AuthGuard>,
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("renders children when user has allowed role", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", role: "student", name: "Test" },
      loading: false,
    });

    render(
      <AuthGuard allowedRoles={["student"]}>
        <div>Protected Content</div>
      </AuthGuard>,
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("does not render children when user has wrong role", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", role: "trainer", name: "Test" },
      loading: false,
    });

    render(
      <AuthGuard allowedRoles={["student"]}>
        <div>Protected Content</div>
      </AuthGuard>,
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("redirects to /login when no user", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    render(
      <AuthGuard allowedRoles={["student"]}>
        <div>Protected Content</div>
      </AuthGuard>,
    );

    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("redirects trainer to /trainer when accessing student route", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", role: "trainer", name: "Test" },
      loading: false,
    });

    render(
      <AuthGuard allowedRoles={["student"]}>
        <div>Protected Content</div>
      </AuthGuard>,
    );

    expect(mockReplace).toHaveBeenCalledWith("/trainer");
  });

  it("renders children when no allowedRoles specified (any authenticated user)", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", role: "admin", name: "Test" },
      loading: false,
    });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
