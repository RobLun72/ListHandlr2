import { afterEach, beforeEach, describe, test, vi } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Page from "../page";
import { UserProvider } from "@/contexts/UserContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CollabGroupsDbFactory } from "@/db/queries/collabGroups/collabGroupsDbFactory";
import { CollabGroupsMockDbQueries } from "@/db/queries/collabGroups/collabGroupsDbMockQueries";
import {
  clickOnButton,
  clickOnButtonWithIndex,
  clickOnMenuItem,
  waitForRender,
} from "@/Helpers/Test/actHelper";
import {
  assertMissingTextValue,
  assertTextValueInDoc,
} from "@/Helpers/Test/assertHelper";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/collab-groups",
}));

describe("Delete collaboration group", () => {
  beforeEach(() => {
    // Seed the mock DB with test data
    const queries =
      CollabGroupsDbFactory.createDbQueries() as CollabGroupsMockDbQueries;
    queries.seedTestData("no-auth-user-id");
  });

  afterEach(() => {
    // Clean up the singleton mock instance between tests
    CollabGroupsDbFactory.resetMockInstance();
    vi.clearAllMocks();
  });

  test("Delete collaboration group", async () => {
    // TODO: This test is being skipped because the delete operation
    // calls a server action (editCollabGroup) that doesn't complete in the test environment.
    // The edit tests work because they don't trigger the server action immediately.
    // This needs investigation - possibly the action needs to be mocked or
    // the test environment needs additional setup for server actions.

    const user = userEvent.setup();

    render(
      <UserProvider>
        <ThemeProvider>
          <Page />
        </ThemeProvider>
      </UserProvider>
    );

    // Wait for initial render
    await waitForRender();

    // Verify initial groups display
    await assertTextValueInDoc("DevTeam");
    await assertTextValueInDoc("Development team collaboration");
    await assertTextValueInDoc("Marketing");
    await assertTextValueInDoc("TestGroup");

    // Open context menu for DevTeam (first group, index 0)
    await clickOnButtonWithIndex(user, "Open menu", 0);

    // Verify context menu items
    await assertTextValueInDoc("Edit");
    await assertTextValueInDoc("Delete");

    // Click Delete menu item
    await clickOnMenuItem(user, "Delete");

    // Verify confirmation dialog appears
    await assertTextValueInDoc("Delete group");
    await assertTextValueInDoc(
      "Are you sure you want to delete this group? All members will be removed."
    );

    // Confirm deletion
    await clickOnButton(user, "Continue");

    // Wait for deletion to complete
    await waitForRender(1000);

    // Verify DevTeam is removed from the list
    await assertMissingTextValue("DevTeam");
    //await assertMissingTextValue("Development team collaboration");

    // Verify other groups still display
    await assertTextValueInDoc("Marketing");
    await assertTextValueInDoc("TestGroup");
  });
});
