import { afterEach, beforeEach, test, vi, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../page";
import { removeMemberFromGroup, waitForRender } from "@/Helpers/Test/actHelper";
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

test("Remove member from collaboration group", async () => {
  const user = userEvent.setup();

  await render(
    <UserProvider>
      <ThemeProvider>
        <Page />
      </ThemeProvider>
    </UserProvider>
  );

  await waitForRender();

  // Verify initial state - DevTeam has 3 current members
  await assertTextValueInDoc("Current Members (3)");
  await assertTextValueInDoc("alice@example.com");
  await assertTextValueInDoc("bob@example.com");
  await assertTextValueInDoc("charlie@example.com");

  // Verify available users section - should have 3 available users
  await assertTextValueInDoc("Available Users (3)");
  await assertTextValueInDoc("diana@example.com");
  await assertTextValueInDoc("eve@example.com");
  await assertTextValueInDoc("brent@gmail.com");

  // Verify save icon is disabled (isDirty=false)
  const saveIcon = screen.getByTestId("save-members-icon");
  expect(saveIcon.classList.contains("text-neutral-300")).toBe(true);
  expect(saveIcon.classList.contains("cursor-not-allowed")).toBe(true);

  // Remove Charlie from the group
  await removeMemberFromGroup(user, "charlie@example.com");

  // Wait for state update
  await waitForRender(200);

  // Verify Charlie moved from current members to available users
  await assertTextValueInDoc("Current Members (2)");
  await assertTextValueInDoc("Available Users (4)");

  // Verify Charlie is in available users
  const availableSection = screen
    .getByText("Available Users (4)")
    .closest("div");
  expect(availableSection).toBeInTheDocument();
  const charlieInAvailable = availableSection
    ?.querySelector('[class*="space-y-2"]')
    ?.textContent?.includes("charlie@example.com");
  expect(charlieInAvailable).toBe(true);

  // Verify Charlie is NOT in current members anymore
  const currentMembersSection = screen
    .getByText("Current Members (2)")
    .closest("div");
  const charlieInCurrent = currentMembersSection
    ?.querySelector('[class*="space-y-2"]')
    ?.textContent?.includes("charlie@example.com");
  expect(charlieInCurrent).toBe(false);

  // Verify save icon is now enabled (isDirty=true)
  expect(saveIcon.classList.contains("text-neutral-300")).toBe(false);
  expect(saveIcon.classList.contains("cursor-not-allowed")).toBe(false);

  // Verify other current members are still present
  await assertTextValueInDoc("alice@example.com");
  await assertTextValueInDoc("bob@example.com");

  // Verify other available users are still present
  await assertTextValueInDoc("diana@example.com");
  await assertTextValueInDoc("eve@example.com");
  await assertTextValueInDoc("brent@gmail.com");
}, 10000);
