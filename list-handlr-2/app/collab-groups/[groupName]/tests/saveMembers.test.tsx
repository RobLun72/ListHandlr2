import { afterEach, beforeEach, test, vi, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Page from "../page";
import {
  addMemberToGroup,
  removeMemberFromGroup,
  getValueByTestId,
  waitForRender,
  clickOnElementWithTestId,
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

beforeEach(() => {
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

test("Save member changes and verify complete workflow", async () => {
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

  // Capture initial timestamp
  const initialTimestamp = getValueByTestId("current-timestamp");

  // Verify save icon is disabled initially (isDirty=false)
  const saveIcon = screen.getByTestId("save-members-icon");
  expect(saveIcon.classList.contains("text-neutral-300")).toBe(true);
  expect(saveIcon.classList.contains("cursor-not-allowed")).toBe(true);

  // Add a member (Diana)
  await addMemberToGroup(user, "diana@example.com");
  await waitForRender(200);

  // Verify member was added
  await assertTextValueInDoc("Current Members (4)");
  await assertTextValueInDoc("Available Users (2)");

  // Verify save icon is now enabled (isDirty=true)
  expect(saveIcon.classList.contains("text-neutral-300")).toBe(false);
  expect(saveIcon.classList.contains("cursor-not-allowed")).toBe(false);

  // Remove a member (Charlie)
  await removeMemberFromGroup(user, "charlie@example.com");
  await waitForRender(200);

  // Verify member was removed
  await assertTextValueInDoc("Current Members (3)");
  await assertTextValueInDoc("Available Users (3)");

  // Verify isDirty persists
  expect(saveIcon.classList.contains("text-neutral-300")).toBe(false);
  expect(saveIcon.classList.contains("cursor-not-allowed")).toBe(false);

  // Click save icon
  await clickOnElementWithTestId(user, "save-members");

  // Wait for save to complete - isDirty becomes false (save icon disabled)
  await waitFor(
    async () => {
      expect(saveIcon.classList.contains("text-neutral-300")).toBe(true);
      expect(saveIcon.classList.contains("cursor-not-allowed")).toBe(true);
    },
    { timeout: 3000 }
  );

  // Note: Toast messages are ephemeral and may not be reliably testable in unit tests
  // Instead, we verify the outcome: isDirty state reset and data persisted

  // Verify timestamp was updated
  await waitForRender(300);
  const updatedTimestamp = getValueByTestId("current-timestamp");
  expect(updatedTimestamp).not.toEqual(initialTimestamp);

  // Verify save icon remains disabled (isDirty=false after save)
  expect(saveIcon.classList.contains("text-neutral-300")).toBe(true);
  expect(saveIcon.classList.contains("cursor-not-allowed")).toBe(true);

  // Verify final member list is correct
  // Should have Alice, Bob, Diana (Charlie was removed, Diana was added)
  await assertTextValueInDoc("alice@example.com");
  await assertTextValueInDoc("bob@example.com");
  await assertTextValueInDoc("diana@example.com");

  // Verify Charlie is now in available users
  const availableSection = screen
    .getByText("Available Users (3)")
    .closest("div");
  const charlieInAvailable = availableSection
    ?.querySelector('[class*="space-y-2"]')
    ?.textContent?.includes("charlie@example.com");
  expect(charlieInAvailable).toBe(true);
}, 15000);
