import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RoleGate } from "./RoleGate";
import { useQuery } from "convex/react";

const { routerReplace, authState } = vi.hoisted(() => ({
  routerReplace: vi.fn(),
  authState: { isLoaded: true, isSignedIn: true },
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => authState,
  SignInButton: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: routerReplace }),
}));

vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
}));

function mockViewer(role?: string | undefined) {
  vi.mocked(useQuery).mockReturnValue({ _id: "user_1", role });
}

describe("RoleGate", () => {
  beforeEach(() => {
    authState.isLoaded = true;
    authState.isSignedIn = true;
    routerReplace.mockClear();
    vi.mocked(useQuery).mockReset();
    mockViewer("customer");
  });

  it("shows the sign-in panel and never queries while signed out", () => {
    authState.isSignedIn = false;

    render(
      <RoleGate role="customer">
        <div>guarded content</div>
      </RoleGate>
    );

    expect(screen.getByText("Sign in required")).toBeInTheDocument();
    expect(vi.mocked(useQuery)).not.toHaveBeenCalled();
    expect(screen.queryByText("guarded content")).not.toBeInTheDocument();
  });

  it("redirects a viewer without a role to /select-role", async () => {
    mockViewer(undefined);

    render(
      <RoleGate role="customer">
        <div>guarded content</div>
      </RoleGate>
    );

    await waitFor(() => {
      expect(routerReplace).toHaveBeenCalledWith("/select-role");
    });
    expect(screen.queryByText("guarded content")).not.toBeInTheDocument();
  });

  it("redirects a customer away from the provider gate", async () => {
    mockViewer("customer");

    render(
      <RoleGate role="provider">
        <div>provider content</div>
      </RoleGate>
    );

    await waitFor(() => {
      expect(routerReplace).toHaveBeenCalledWith("/customer");
    });
    expect(screen.queryByText("provider content")).not.toBeInTheDocument();
  });

  it("renders children for the matching role without redirecting", async () => {
    mockViewer("customer");

    render(
      <RoleGate role="customer">
        <div>customer content</div>
      </RoleGate>
    );

    expect(screen.getByText("customer content")).toBeInTheDocument();
    expect(routerReplace).not.toHaveBeenCalled();
  });
});
