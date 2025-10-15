import { afterEach, beforeEach, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../page";
import {
  clickOnButton,
  clickOnButtonWithIndex,
  clickOnMenuItem,
  getValueByTestId,
  waitForRender,
} from "@/Helpers/Test/actHelper";
import { ReadonlyURLSearchParams } from "next/navigation";
import {
  assertMultiplesOfTextValue,
  assertTextValueInDoc,
} from "@/Helpers/Test/assertHelper";
import userEvent from "@testing-library/user-event";
import { UserProvider } from "@/contexts/UserContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CollabGroupsDbFactory } from "@/db/queries/collabGroups/collabGroupsDbFactory";
import { CollabGroupsMockDbQueries } from "@/db/queries/collabGroups/collabGroupsDbMockQueries";

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

test("Edit description of collaboration group", async () => {
  const user = userEvent.setup();

  await render(
    <UserProvider>
      <ThemeProvider>
        <Page />
      </ThemeProvider>
    </UserProvider>
  );

  await waitForRender();

  // Verify initial state - seeded groups are present
  await assertTextValueInDoc("DevTeam");
  await assertTextValueInDoc("Marketing");
  await assertTextValueInDoc("TestGroup");

  // Verify initial description
  await assertTextValueInDoc("Development team collaboration");

  const loadedTimeStamp = getValueByTestId("current-timestamp");

  // Open context menu for DevTeam (first group, index 0)
  await clickOnButtonWithIndex(user, "Open menu", 0);

  // Verify context menu items appear
  await assertMultiplesOfTextValue("DevTeam", 2); // One in list, one in menu header
  await assertTextValueInDoc("Edit");
  await assertTextValueInDoc("Delete");
  await assertTextValueInDoc("Manage members");

  // Click Edit menu item
  await clickOnMenuItem(user, "Edit");

  // Wait for form to open
  await waitForRender();
  expect(screen.getByText("Edit Collaboration Group")).toBeInTheDocument();

  // Clear and type new description
  const descriptionInput = screen.getByLabelText("Description (optional)");
  await user.clear(descriptionInput);
  await user.type(descriptionInput, "Updated dev team description");

  // Submit the form
  await clickOnButton(user, "Update Group");

  // Wait for save to complete
  await waitForRender(1000);

  // Verify the updated description appears in the list
  await assertTextValueInDoc("Updated dev team description");

  // Verify the group name is still there
  await assertTextValueInDoc("DevTeam");

  // Verify other groups are still there
  await assertTextValueInDoc("Marketing");
  await assertTextValueInDoc("TestGroup");

  // Verify the original description is no longer present
  const oldDescElements = screen.queryAllByText(
    "Development team collaboration"
  );
  expect(oldDescElements.length).toBe(0);

  // Verify timestamp was updated
  const updatedTimeStamp = getValueByTestId("current-timestamp");
  expect(loadedTimeStamp).not.toEqual(updatedTimeStamp);
});
