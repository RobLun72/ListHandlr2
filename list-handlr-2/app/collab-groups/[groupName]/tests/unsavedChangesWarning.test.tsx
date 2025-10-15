import { afterEach, beforeEach, test, vi, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Page from "../page";
import {
  addMemberToGroup,
  waitForRender,
  clickOnElementWithTestId,
  clickOnButton,
} from "@/Helpers/Test/actHelper";
import { ReadonlyURLSearchParams } from "next/navigation";
import { assertTextValueInDoc } from "@/Helpers/Test/assertHelper";
import userEvent from "@testing-library/user-event";
import { UserProvider } from "@/contexts/UserContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CollabGroupsDbFactory } from "@/db/queries/collabGroups/collabGroupsDbFactory";
import { CollabGroupsMockDbQueries } from "@/db/queries/collabGroups/collabGroupsDbMockQueries";
import { serverWithHandlers, setupServerWithHandlers } from "@/MSW/server";
import { testHandlers } from "@/MSW/Handlers/handlerData";

// Mock next/navigation with a spy for router.push
const mockRouterPush = vi.fn();

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
  setupServerWithHandlers([...testHandlers]);
  serverWithHandlers.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  // Clean up the singleton mock instance between tests
  CollabGroupsDbFactory.resetMockInstance();
  vi.clearAllMocks();
  serverWithHandlers.close();
});

test("Show unsaved changes warning and cancel navigation", async () => {
  const user = userEvent.setup();

  await render(
    <UserProvider>
      <ThemeProvider>
        <Page />
      </ThemeProvider>
    </UserProvider>
  );

  await waitForRender();

  // Verify initial state
  await assertTextValueInDoc("Current Members (3)");
  await assertTextValueInDoc("Available Users (3)");

  // Make a change to trigger isDirty
  await addMemberToGroup(user, "diana@example.com");
  await waitForRender(200);

  // Verify member was added (isDirty should be true)
  await assertTextValueInDoc("Current Members (4)");

  // Click back button
  await clickOnElementWithTestId(user, "back-button");
  await waitForRender(200);

  // Verify the unsaved changes dialog appears
  await waitFor(
    async () => {
      const dialogTitle = screen.queryByText("Unsaved Changes");
      expect(dialogTitle).toBeInTheDocument();
    },
    { timeout: 1000 }
  );

  // Verify the dialog description
  await assertTextValueInDoc(
    "You have unsaved changes. Are you sure you want to leave without saving?"
  );

  // Verify router.push was NOT called yet
  expect(mockRouterPush).not.toHaveBeenCalled();

  // Click Cancel button to stay on page
  await clickOnButton(user, "Cancel");
  await waitForRender(200);

  // Verify dialog is closed
  await waitFor(
    () => {
      const dialogTitle = screen.queryByText("Unsaved Changes");
      expect(dialogTitle).not.toBeInTheDocument();
    },
    { timeout: 1000 }
  );

  // Verify we're still on the page (router.push was not called)
  expect(mockRouterPush).not.toHaveBeenCalled();

  // Verify we're still on the detail page with our changes
  await assertTextValueInDoc("DevTeam - Members");
  await assertTextValueInDoc("Current Members (4)");
  await assertTextValueInDoc("diana@example.com");
}, 10000);

test("Show unsaved changes warning and confirm navigation", async () => {
  const user = userEvent.setup();

  await render(
    <UserProvider>
      <ThemeProvider>
        <Page />
      </ThemeProvider>
    </UserProvider>
  );

  await waitForRender();

  // Verify initial state
  await assertTextValueInDoc("Current Members (3)");

  // Make a change to trigger isDirty
  await addMemberToGroup(user, "diana@example.com");
  await waitForRender(200);

  // Verify member was added
  await assertTextValueInDoc("Current Members (4)");

  // Click back button
  await clickOnElementWithTestId(user, "back-button");
  await waitForRender(200);

  // Verify the unsaved changes dialog appears
  await waitFor(
    async () => {
      const dialogTitle = screen.queryByText("Unsaved Changes");
      expect(dialogTitle).toBeInTheDocument();
    },
    { timeout: 1000 }
  );

  // Click OK button to confirm leaving
  await clickOnButton(user, "Continue");
  await waitForRender(200);

  // Verify router.push was called with the correct path
  await waitFor(
    () => {
      expect(mockRouterPush).toHaveBeenCalledWith("/collab-groups");
    },
    { timeout: 1000 }
  );
}, 10000);

test("Navigate away without warning when no changes made", async () => {
  const user = userEvent.setup();

  await render(
    <UserProvider>
      <ThemeProvider>
        <Page />
      </ThemeProvider>
    </UserProvider>
  );

  await waitForRender();

  // Verify initial state
  await assertTextValueInDoc("Current Members (3)");

  // Don't make any changes - isDirty should be false

  // Click back button
  await clickOnElementWithTestId(user, "back-button");
  await waitForRender(200);

  // Verify the dialog does NOT appear
  const dialogTitle = screen.queryByText("Unsaved Changes");
  expect(dialogTitle).not.toBeInTheDocument();

  // Verify router.push was called immediately (no warning)
  await waitFor(
    () => {
      expect(mockRouterPush).toHaveBeenCalledWith("/collab-groups");
    },
    { timeout: 1000 }
  );
}, 10000);
