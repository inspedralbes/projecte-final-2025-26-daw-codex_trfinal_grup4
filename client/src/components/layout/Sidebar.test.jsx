import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "./Sidebar";
import { describe, it, expect, vi } from "vitest";

// Mock useAuth hook
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { name: "Test User", username: "testuser", avatar: null },
    logout: vi.fn(),
  }),
}));

describe("Sidebar Component", () => {
  it("renders the new XC logo image", () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );

    const logoImg = screen.getByAltText("XC Logo");
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute("src", "/logo-transparent.png");
  });
});
