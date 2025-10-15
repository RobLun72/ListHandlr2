import { afterEach, beforeEach, test, expect } from "vitest";
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

test("Prevent duplicate group name - attempt to create group with existing name", async () => {
  const user = userEvent.setup();

  await render(
    <UserProvider>
      <ThemeProvider>
        <Page />
      </ThemeProvider>
    </UserProvider>
  );

  await waitForRender();

  // Verify DevTeam exists (seeded data)
  await assertTextValueInDoc("DevTeam");
  await assertTextValueInDoc("Marketing");
  await assertTextValueInDoc("TestGroup");

  // Count initial groups - should have 3 seeded groups
  const initialDevTeamElements = screen.getAllByText("DevTeam");
  const initialGroupCount = initialDevTeamElements.length;

  // Click add button to open form
  await clickOnElementWithTestId(user, "table-add-button");
  await waitForRender();

  // Verify form opened
  expect(screen.getByText("Add Collaboration Group")).toBeInTheDocument();

  // Try to create a group with duplicate name "DevTeam"
  await typeInTextBox(user, "Group Name", "DevTeam");
  await typeInTextBox(
    user,
    "Description (optional)",
    "Duplicate team description"
  );

  // Submit the form
  await clickOnButton(user, "Create Group");

  // Wait for server action to process
  await waitForRender();

  // Verify the duplicate was NOT created by checking group count stays the same
  // DevTeam should still appear only once in the list (not duplicated)
  const finalDevTeamElements = screen.getAllByText("DevTeam");
  expect(finalDevTeamElements.length).toBe(initialGroupCount);

  // Verify all original groups are still there and only once each
  await assertTextValueInDoc("DevTeam");
  await assertTextValueInDoc("Marketing");
  await assertTextValueInDoc("TestGroup");

  // Verify the duplicate description did NOT get added
  expect(
    screen.queryByText("Duplicate team description")
  ).not.toBeInTheDocument();

  // Verify form has closed (form closes even on error)
  expect(screen.queryByText("Add Collaboration Group")).not.toBeInTheDocument();
});
