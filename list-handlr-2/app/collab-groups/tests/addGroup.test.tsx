import { afterEach, beforeEach, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../page";
import {
  clickOnButton,
  clickOnElementWithTestId,
  getValueByTestId,
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

test("Add new collaboration group", async () => {
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

  const loadedTimeStamp = getValueByTestId("current-timestamp");

  // Click add button to open form
  await clickOnElementWithTestId(user, "table-add-button");

  // Verify form opened with "Add Collaboration Group" title
  await waitForRender();
  expect(screen.getByText("Add Collaboration Group")).toBeInTheDocument();

  // Fill in the form
  await typeInTextBox(user, "Group Name", "QA Team");
  await typeInTextBox(user, "Description (optional)", "Quality assurance team");

  // Submit the form
  await clickOnButton(user, "Create Group");

  // Wait for save to complete and new group to appear
  await waitForRender();

  // Verify the new group appears in the list
  await assertTextValueInDoc("QA Team");
  await assertTextValueInDoc("Quality assurance team");

  // Verify all original groups are still there
  await assertTextValueInDoc("DevTeam");
  await assertTextValueInDoc("Marketing");
  await assertTextValueInDoc("TestGroup");

  // Verify timestamp was updated
  const updatedTimeStamp = getValueByTestId("current-timestamp");
  expect(loadedTimeStamp).not.toEqual(updatedTimeStamp);
});
