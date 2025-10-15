import { afterEach, beforeEach, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../page";
import {
  clickOnElementWithTestId,
  waitForRender,
} from "@/Helpers/Test/actHelper";
import { ReadonlyURLSearchParams } from "next/navigation";
import { assertTextValueInDoc } from "@/Helpers/Test/assertHelper";
import userEvent from "@testing-library/user-event";
import { UserProvider } from "@/contexts/UserContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CollabGroupsDbFactory } from "@/db/queries/collabGroups/collabGroupsDbFactory";
import { CollabGroupsMockDbQueries } from "@/db/queries/collabGroups/collabGroupsDbMockQueries";
import { vi } from "vitest";

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
});

afterEach(() => {
  // Clean up the singleton mock instance between tests
  CollabGroupsDbFactory.resetMockInstance();
});

test("Prevent empty group name - form validation prevents submission", async () => {
  const user = userEvent.setup();

  await render(
    <UserProvider>
      <ThemeProvider>
        <Page />
      </ThemeProvider>
    </UserProvider>
  );

  await waitForRender();

  // Verify initial seeded groups
  await assertTextValueInDoc("DevTeam");
  await assertTextValueInDoc("Marketing");
  await assertTextValueInDoc("TestGroup");

  // Click add button to open form
  await clickOnElementWithTestId(user, "table-add-button");
  await waitForRender();

  // Verify form opened
  expect(screen.getByText("Add Collaboration Group")).toBeInTheDocument();

  // Find the Group Name input field and verify it's empty
  const groupNameInput = screen.getByPlaceholderText("Group name");
  expect(groupNameInput).toHaveValue("");

  // Try to submit the form without entering a name
  // First, we need to trigger the form validation by clicking submit
  const createButton = screen.getByRole("button", { name: /Create Group/i });
  
  // The button should be enabled initially (no errors yet)
  expect(createButton).not.toBeDisabled();

  // Click the submit button with empty name
  await user.click(createButton);

  // Wait for validation to trigger
  await waitForRender();

  // Verify the validation error message appears
  expect(screen.getByText("Group name is required")).toBeInTheDocument();

  // Verify the submit button is now disabled due to validation error
  expect(createButton).toBeDisabled();

  // Verify no new groups were created - still only the 3 seeded groups
  await assertTextValueInDoc("DevTeam");
  await assertTextValueInDoc("Marketing");
  await assertTextValueInDoc("TestGroup");

  // Count all groups in the table to ensure no extras were added
  // Each group appears in a table row
  const devTeamElements = screen.getAllByText("DevTeam");
  expect(devTeamElements.length).toBe(1); // Should only appear once in the table
});
