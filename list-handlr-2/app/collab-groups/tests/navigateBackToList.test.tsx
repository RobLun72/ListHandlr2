import { afterEach, beforeEach, test, vi, expect } from "vitest";
import { render } from "@testing-library/react";
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

test("Navigate back to settings from collab groups list view", async () => {
  const user = userEvent.setup();

  await render(
    <UserProvider>
      <ThemeProvider>
        <Page />
      </ThemeProvider>
    </UserProvider>
  );

  await waitForRender();

  // Verify we're on the collab groups list page
  await assertTextValueInDoc("Collaboration Groups");
  await assertTextValueInDoc("DevTeam");

  // Click the back button
  await clickOnElementWithTestId(user, "back-button");
  await waitForRender(200);

  // Verify router.push was called with /settings
  expect(mockRouterPush).toHaveBeenCalledWith("/settings");
  expect(mockRouterPush).toHaveBeenCalledTimes(1);
}, 10000);
