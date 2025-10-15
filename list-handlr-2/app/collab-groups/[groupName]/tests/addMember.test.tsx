import { afterEach, beforeEach, test, vi, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../page";
import { addMemberToGroup, waitForRender } from "@/Helpers/Test/actHelper";
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

test("Add member to collaboration group", async () => {
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
  // (testHandlers provides 6 users total: alice, bob, charlie, diana, eve, brent
  // DevTeam has alice, bob, charlie as members
  // Current user is no-auth-user-id which is not in the mock users
  // So available should be: diana, eve, brent)
  await assertTextValueInDoc("Available Users (3)");
  await assertTextValueInDoc("diana@example.com");

  // Verify save icon is disabled (isDirty=false)
  const saveIcon = screen.getByTestId("save-members-icon");
  expect(saveIcon.classList.contains("text-neutral-300")).toBe(true);
  expect(saveIcon.classList.contains("cursor-not-allowed")).toBe(true);

  // Add Diana to the group
  await addMemberToGroup(user, "diana@example.com");

  // Wait for state update
  await waitForRender(200);

  // Verify Diana moved from available to current members
  await assertTextValueInDoc("Current Members (4)");
  await assertTextValueInDoc("Available Users (2)");

  // Verify Diana is in current members
  const currentMembersSection = screen
    .getByText("Current Members (4)")
    .closest("div");
  expect(currentMembersSection).toBeInTheDocument();
  const dianaInCurrent = currentMembersSection
    ?.querySelector('[class*="space-y-2"]')
    ?.textContent?.includes("diana@example.com");
  expect(dianaInCurrent).toBe(true);

  // Verify Diana is NOT in available users anymore
  const availableSection = screen
    .getByText("Available Users (2)")
    .closest("div");
  const dianaInAvailable = availableSection
    ?.querySelector('[class*="space-y-2"]')
    ?.textContent?.includes("diana@example.com");
  expect(dianaInAvailable).toBe(false);

  // Verify save icon is now enabled (isDirty=true)
  expect(saveIcon.classList.contains("text-neutral-300")).toBe(false);
  expect(saveIcon.classList.contains("cursor-not-allowed")).toBe(false);

  // Verify other members are still present
  await assertTextValueInDoc("alice@example.com");
  await assertTextValueInDoc("bob@example.com");
  await assertTextValueInDoc("charlie@example.com");
}, 10000);
