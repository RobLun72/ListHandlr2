import { afterEach, beforeEach, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../page";
import {
  clickOnElementWithTestId,
  waitForRender,
  addMemberToGroup,
} from "@/Helpers/Test/actHelper";
import { ReadonlyURLSearchParams } from "next/navigation";
import userEvent from "@testing-library/user-event";
import { UserProvider } from "@/contexts/UserContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CollabGroupsDbFactory } from "@/db/queries/collabGroups/collabGroupsDbFactory";
import { CollabGroupsMockDbQueries } from "@/db/queries/collabGroups/collabGroupsDbMockQueries";
import {
  serverWithHandlers,
  setupServerWithHandlers,
} from "@/MSW/server";
import { testHandlers } from "@/MSW/handlers";
import { toast } from "sonner";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock editCollabGroup to throw an error
vi.mock("@/actions/editCollabGroup", () => ({
  editCollabGroup: vi.fn().mockImplementation(async () => {
    throw new Error("Failed to update group members");
  }),
}));

// Mock next/navigation
vi.mock("next/navigation", async () => {
  const mod = await vi.importActual<typeof import("next/navigation")>(
    "next/navigation"
  );
  return {
    ...mod,
    useSearchParams: () => new URLSearchParams("") as ReadonlyURLSearchParams,
    usePathname: () => "/collab-groups/DevTeam",
    useParams: () => ({ groupName: "DevTeam" }),
    useRouter: () => ({
      push: vi.fn(),
    }),
  };
});

beforeEach(async () => {
  // Seed the mock DB with test data
  const queries =
    CollabGroupsDbFactory.createDbQueries() as CollabGroupsMockDbQueries;
  queries.seedTestData("no-auth-user-id");

  // Set up MSW server for user data
  setupServerWithHandlers([...testHandlers]);
  await serverWithHandlers.listen({ onUnhandledRequest: "error" });

  vi.clearAllMocks();
});

afterEach(() => {
  // Clean up the singleton mock instance between tests
  CollabGroupsDbFactory.resetMockInstance();
  serverWithHandlers.close();
});

test("Handle API error in detail view - save members failure with retry capability", async () => {
  const user = userEvent.setup();

  // Mock console.error to avoid cluttering test output
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  await render(
    <UserProvider>
      <ThemeProvider>
        <Page />
      </ThemeProvider>
    </UserProvider>
  );

  await waitForRender();

  // Verify page loaded - check for key UI elements
  expect(screen.getByText(/DevTeam/i)).toBeInTheDocument();
  expect(screen.getByText(/Current Members/i)).toBeInTheDocument();

  // Verify initial members (Alice, Bob, Charlie are seeded members)
  expect(screen.getByText(/alice@example.com/i)).toBeInTheDocument();
  expect(screen.getByText(/bob@example.com/i)).toBeInTheDocument();
  expect(screen.getByText(/charlie@example.com/i)).toBeInTheDocument();

  // Add a new member (Diana) to trigger save
  await addMemberToGroup(user, "diana@example.com");

  // Verify Diana moved to current members
  const currentMembersSection = screen.getByText(/Current Members/i).parentElement;
  expect(currentMembersSection).toHaveTextContent("diana@example.com");

  // Verify isDirty state by checking save icon is enabled
  const saveIcon = screen.getByTestId("save-members-icon");
  expect(saveIcon).toBeInTheDocument();

  // Click save icon to attempt save - this will trigger the mocked error
  await clickOnElementWithTestId(user, "save-members");

  // Wait for error handling
  await waitForRender();

  // Verify error toast was called with appropriate message
  expect(toast.error).toHaveBeenCalledWith(
    "Error saving: Error: Failed to update group members"
  );

  // Verify isDirty state remains true (save failed, so changes still pending)
  // The save icon should still be visible since isDirty wasn't reset
  expect(saveIcon).toBeInTheDocument();

  // Verify the member changes are still visible in the UI (user can retry)
  // Diana should still be in the current members list
  expect(currentMembersSection).toHaveTextContent("diana@example.com");

  // Verify original members are still there
  expect(screen.getByText(/alice@example.com/i)).toBeInTheDocument();
  expect(screen.getByText(/bob@example.com/i)).toBeInTheDocument();
  expect(screen.getByText(/charlie@example.com/i)).toBeInTheDocument();

  consoleSpy.mockRestore();
});
