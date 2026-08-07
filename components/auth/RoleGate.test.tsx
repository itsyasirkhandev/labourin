import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RoleGate } from "./RoleGate";
import { useQuery } from "convex/react";

const { routerReplace, authState } = vi.hoisted(() => ({
  routerReplace: vi.fn(),
  authState: { isLoaded: true, isSignedIn: true },
}));

let currentPathname = "/customer";

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => authState,
  SignInButton: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  SignOutButton: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  UserButton: () => <div data-testid="user-button">UserButton</div>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: routerReplace }),
  usePathname: () => currentPathname,
  redirect: vi.fn((path: string) => {
    routerReplace(path);
    throw new Error(`MOCK_REDIRECT:${path}`);
  }),
}));

vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
}));

function mockViewer(role?: string | undefined, onboardingStatus: string = "approved") {
  let callIndex = 0;
  vi.mocked(useQuery).mockImplementation(() => {
    callIndex++;
    if (callIndex > 1) {
      return { status: onboardingStatus };
    }
    return { _id: "user_1", role };
  });
}


describe("RoleGate", () => {
  beforeEach(() => {
    authState.isLoaded = true;
    authState.isSignedIn = true;
    currentPathname = "/customer";
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

    try {
      render(
        <RoleGate role="customer">
          <div>guarded content</div>
        </RoleGate>
      );
    } catch {}

    expect(routerReplace).toHaveBeenCalledWith("/select-role");
    expect(screen.queryByText("guarded content")).not.toBeInTheDocument();
  });

  it("redirects a customer away from the provider gate", async () => {
    mockViewer("customer");

    try {
      render(
        <RoleGate role="provider">
          <div>provider content</div>
        </RoleGate>
      );
    } catch {}

    expect(routerReplace).toHaveBeenCalledWith("/customer");
  });

  it("renders children for the matching customer role without redirecting", async () => {
    mockViewer("customer");

    render(
      <RoleGate role="customer">
        <div>customer content</div>
      </RoleGate>
    );

    expect(screen.getByText("customer content")).toBeInTheDocument();
    expect(routerReplace).not.toHaveBeenCalled();
  });

  it("redirects unonboarded provider to /provider/onboarding", async () => {
    currentPathname = "/provider";
    mockViewer("provider", "unonboarded");

    try {
      render(
        <RoleGate role="provider">
          <div>provider dashboard</div>
        </RoleGate>
      );
    } catch {}

    expect(routerReplace).toHaveBeenCalledWith("/provider/onboarding");
  });

  it("redirects pending provider to /provider/pending", async () => {
    currentPathname = "/provider";
    mockViewer("provider", "pending");

    try {
      render(
        <RoleGate role="provider">
          <div>provider dashboard</div>
        </RoleGate>
      );
    } catch {}

    expect(routerReplace).toHaveBeenCalledWith("/provider/pending");
  });

  it("renders approved provider dashboard without redirecting", async () => {
    currentPathname = "/provider";
    mockViewer("provider", "approved");

    render(
      <RoleGate role="provider">
        <div>provider dashboard</div>
      </RoleGate>
    );

    expect(screen.getByText("provider dashboard")).toBeInTheDocument();
    expect(routerReplace).not.toHaveBeenCalled();
  });
});
