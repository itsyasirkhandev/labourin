import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConvexError } from "convex/values";
import { RoleSelectionWizard } from "./RoleSelectionWizard";
import { useQuery } from "convex/react";

const { routerPush, routerReplace, selectRoleMock } = vi.hoisted(() => ({
  routerPush: vi.fn(),
  routerReplace: vi.fn(),
  selectRoleMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush, replace: routerReplace }),
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: true }),
}));

vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: () => selectRoleMock,
}));

function mockViewer(role?: string | undefined) {
  vi.mocked(useQuery).mockReturnValue({ _id: "user_1", role });
}

describe("RoleSelectionWizard", () => {
  beforeEach(() => {
    routerPush.mockClear();
    routerReplace.mockClear();
    selectRoleMock.mockReset();
    mockViewer(undefined);
  });

  it("renders Welcome then Choose steps", () => {
    render(<RoleSelectionWizard />);

    expect(
      screen.getByRole("heading", { name: "Welcome to LabourIn" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Get started/ }));

    expect(
      screen.getByRole("heading", { name: "What do you need from LabourIn?" })
    ).toBeInTheDocument();
  });

  it("choosing a role calls selectRole and navigates to the destination", async () => {
    selectRoleMock.mockResolvedValue({ _id: "user_1", role: "provider" });
    render(<RoleSelectionWizard />);

    fireEvent.click(screen.getByRole("button", { name: /Get started/ }));
    fireEvent.click(screen.getByRole("button", { name: /I Provide a Service/ }));

    await waitFor(() => {
      expect(selectRoleMock).toHaveBeenCalledWith({ role: "provider" });
      expect(routerPush).toHaveBeenCalledWith("/provider");
    });
  });

  it("shows an inline error with a retry action when the mutation fails", async () => {
    selectRoleMock.mockRejectedValue(
      new ConvexError({
        tag: "RoleAlreadySelectedError",
        data: { message: "A role has already been selected for this account." },
      })
    );
    render(<RoleSelectionWizard />);

    fireEvent.click(screen.getByRole("button", { name: /Get started/ }));
    fireEvent.click(screen.getByRole("button", { name: /I Need a Service/ }));

    await screen.findByRole("alert");
    expect(
      screen.getByText(
        "A role has already been selected for this account."
      )
    ).toBeInTheDocument();
    expect(routerPush).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /I Need a Service/ }));
    await waitFor(() => expect(selectRoleMock).toHaveBeenCalledTimes(2));
  });
});
