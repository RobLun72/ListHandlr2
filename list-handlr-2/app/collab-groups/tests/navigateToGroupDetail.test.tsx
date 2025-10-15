import { afterEach, beforeEach, test, vi, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../page";
import {
  clickOnButtonWithIndex,
  clickOnMenuItem,
  waitForRender,
} from "@/Helpers/Test/actHelper";
import { ReadonlyURLSearchParams } from "next/navigation";
import { assertTextValueInDoc } from "@/Helpers/Test/assertHelper";
import userEvent from "@testing-library/user-event";
import { UserProvider } from "@/contexts/UserContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CollabGroupsDbFactory } from "@/db/queries/collabGroups/collabGroupsDbFactory";
import { CollabGroupsMockDbQueries } from "@/db/queries/collabGroups/collabGroupsDbMockQueries";

// Mock next/navigation with a spy for router.push
const mockRouterPush = vi.fn();

vi.mock("next/navigation", async () => {
  const mod = await vi.importActual<typeof import("next/navigation")>(
    "next/navigation"
  );
  return {
    ...mod,
    useSearchParams: () => new URLSearchParams("") as ReadonlyURLSearchParams,
    usePathname: () => "/collab-groups",
    useRouter: () => ({
      push: mockRouterPush,
    }),
  };
});

beforeEach(() => {
  // Reset the mock
  mockRouterPush.mockClear();

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

test("Navigate to group detail page via Manage members menu item", async () => {
  const user = userEvent.setup();

  await render(
    <UserProvider>
      <ThemeProvider>
        <Page />
      </ThemeProvider>
    </UserProvider>
  );

  await waitForRender();

  // Verify groups are displayed
  await assertTextValueInDoc("DevTeam");
  await assertTextValueInDoc("Marketing");
  await assertTextValueInDoc("TestGroup");

  // Open context menu for DevTeam (first group, index 0)
  await clickOnButtonWithIndex(user, "Open menu", 0);
  await waitForRender(200);

  // Verify context menu items appear
  await assertTextValueInDoc("Edit");
  await assertTextValueInDoc("Delete");
  await assertTextValueInDoc("Manage members");

  // Click "Manage members" menu item
  await clickOnMenuItem(user, "Manage members");
  await waitForRender(200);

  // Verify router.push was called with correct path
  expect(mockRouterPush).toHaveBeenCalledWith("/collab-groups/DevTeam");
  expect(mockRouterPush).toHaveBeenCalledTimes(1);
}, 10000);

test("Navigate to group detail page via clicking group name row", async () => {
  const user = userEvent.setup();

  await render(
    <UserProvider>
      <ThemeProvider>
        <Page />
      </ThemeProvider>
    </UserProvider>
  );

  await waitForRender();

  // Verify groups are displayed
  await assertTextValueInDoc("DevTeam");
  await assertTextValueInDoc("Marketing");

  // Click on the DevTeam group name in the table
  // The group name should be clickable and navigate to detail page
  const devTeamLink = screen.getByText("DevTeam");
  await user.click(devTeamLink);
  await waitForRender(200);

  // Verify router.push was called with correct path
  expect(mockRouterPush).toHaveBeenCalledWith("/collab-groups/DevTeam");
  expect(mockRouterPush).toHaveBeenCalledTimes(1);
}, 10000);
