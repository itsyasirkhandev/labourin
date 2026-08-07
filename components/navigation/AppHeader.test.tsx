import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppHeader } from "./AppHeader";

vi.mock("@clerk/nextjs", () => ({
  UserButton: () => <div data-testid="user-button">UserButton</div>,
  SignOutButton: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="clerk-signout-wrapper">{children}</div>
  ),
}));

describe("AppHeader", () => {
  it("renders brand title, theme toggle, user button and logout button", () => {
    render(<AppHeader role="customer" />);

    expect(screen.getByRole("link", { name: "LabourIn" })).toHaveAttribute("href", "/customer");
    expect(screen.getByText("customer")).toBeInTheDocument();
    expect(screen.getByTestId("user-button")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Log out/i })).toBeInTheDocument();
  });

  it("renders provider role badge and links home to /provider when role is provider", () => {
    render(<AppHeader role="provider" />);

    expect(screen.getByRole("link", { name: "LabourIn" })).toHaveAttribute("href", "/provider");
    expect(screen.getByText("provider")).toBeInTheDocument();
  });
});
