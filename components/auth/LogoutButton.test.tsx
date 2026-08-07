import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LogoutButton } from "./LogoutButton";

vi.mock("@clerk/nextjs", () => ({
  SignOutButton: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="clerk-signout-wrapper">{children}</div>
  ),
}));

describe("LogoutButton", () => {
  it("renders the sign out button with text and icon by default", () => {
    render(<LogoutButton />);

    expect(screen.getByTestId("clerk-signout-wrapper")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Log out/i })).toBeInTheDocument();
  });

  it("renders without text when showText is false", () => {
    render(<LogoutButton showText={false} />);

    expect(screen.getByTestId("clerk-signout-wrapper")).toBeInTheDocument();
    expect(screen.queryByText("Log out")).not.toBeInTheDocument();
  });
});
