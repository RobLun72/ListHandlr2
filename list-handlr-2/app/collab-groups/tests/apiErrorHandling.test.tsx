import { afterEach, beforeEach, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../page";
import {
  clickOnButton,
  clickOnElementWithTestId,
  typeInTextBox,
  waitForRender,
} from "@/Helpers/Test/actHelper";
import { ReadonlyURLSearchParams } from "next/navigation";
import { assertTextValueInDoc } from "@/Helpers/Test/assertHelper";
import userEvent from "@testing-library/user-event";
import { UserProvider } from "@/contexts/UserContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CollabGroupsDbFactory } from "@/db/queries/collabGroups/collabGroupsDbFactory";
import { CollabGroupsMockDbQueries } from "@/db/queries/collabGroups/collabGroupsDbMockQueries";
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
    throw new Error("Database connection failed");
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
    usePathname: () => "/collab-groups",
    useRouter: () => ({
      push: vi.fn(),
    }),
  };
});

beforeEach(() => {
  // Seed the mock DB with test data
  const queries =
    CollabGroupsDbFactory.createDbQueries() as CollabGroupsMockDbQueries;
  queries.seedTestData("no-auth-user-id");
  vi.clearAllMocks();
});

afterEach(() => {
  // Clean up the singleton mock instance between tests
  CollabGroupsDbFactory.resetMockInstance();
});

test("Handle API error in list view - verify error toast displays", async () => {
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

  // Verify initial seeded groups loaded (from getCollabGroups, which is not mocked)
  await assertTextValueInDoc("DevTeam");
  await assertTextValueInDoc("Marketing");
  await assertTextValueInDoc("TestGroup");

  // Click add button to open form
  await clickOnElementWithTestId(user, "table-add-button");
  await waitForRender();

  // Verify form opened
  expect(screen.getByText("Add Collaboration Group")).toBeInTheDocument();

  // Fill in the form with valid data
  await typeInTextBox(user, "Group Name", "ErrorTest");
  await typeInTextBox(user, "Description (optional)", "This should fail");

  // Submit the form - this will trigger the mocked error
  await clickOnButton(user, "Create Group");

  // Wait for error handling
  await waitForRender();

  // Verify error toast was called with appropriate message
  expect(toast.error).toHaveBeenCalledWith(
    "Error saving: Error: Database connection failed"
  );

  // Verify the group was NOT added to the list (error prevented creation)
  expect(screen.queryByText("ErrorTest")).not.toBeInTheDocument();
  expect(screen.queryByText("This should fail")).not.toBeInTheDocument();

  // Verify original groups are still there
  await assertTextValueInDoc("DevTeam");
  await assertTextValueInDoc("Marketing");
  await assertTextValueInDoc("TestGroup");

  consoleSpy.mockRestore();
});
