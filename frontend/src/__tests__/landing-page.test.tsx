import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock useAuth and useRouter
const mockReplace = vi.fn();
const mockUseAuth = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

vi.mock("@/lib/auth", () => ({
  useAuth: () => mockUseAuth(),
}));

// We need to import after mocking
const { default: RootPage } = await import("@/app/page");

beforeEach(() => {
  mockReplace.mockReset();
  mockUseAuth.mockReset();
});

describe("Landing Page", () => {
  it("shows loading spinner when auth is loading", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });

    render(<RootPage />);

    // Should not show landing content while loading
    expect(screen.queryByText("FitDrop")).not.toBeInTheDocument();
  });

  it("redirects authenticated student to /explore", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", role: "student", name: "Test" },
      loading: false,
    });

    render(<RootPage />);

    expect(mockReplace).toHaveBeenCalledWith("/explore");
  });

  it("redirects authenticated admin to /admin", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", role: "admin", name: "Admin" },
      loading: false,
    });

    render(<RootPage />);

    expect(mockReplace).toHaveBeenCalledWith("/admin");
  });

  it("shows marketing landing page for unauthenticated users", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    render(<RootPage />);

    expect(screen.getByText(/treino premium/i)).toBeInTheDocument();
    expect(screen.getByText(/encontrar meu trainer/i)).toBeInTheDocument();
    expect(screen.getByText(/como funciona/i)).toBeInTheDocument();
  });

  it("shows feature cards on landing page", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    render(<RootPage />);

    expect(screen.getByText("Onde você quiser")).toBeInTheDocument();
    expect(screen.getByText("Agendamento rápido")).toBeInTheDocument();
    expect(screen.getByText("Trainers verificados")).toBeInTheDocument();
    expect(screen.getByText("Personalizado")).toBeInTheDocument();
  });

  it("shows CTA section", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    render(<RootPage />);

    expect(screen.getByText(/começar agora/i)).toBeInTheDocument();
  });

  it("shows 'Sou personal trainer' button", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    render(<RootPage />);

    expect(screen.getByText("Sou personal trainer")).toBeInTheDocument();
  });
});
