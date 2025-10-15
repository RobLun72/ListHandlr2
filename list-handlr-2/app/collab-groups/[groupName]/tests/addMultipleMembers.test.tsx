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

test("Add multiple members to collaboration group in sequence", async () => {
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

  // Verify available users - should have 3 available users
  await assertTextValueInDoc("Available Users (3)");
  await assertTextValueInDoc("diana@example.com");
  await assertTextValueInDoc("eve@example.com");
  await assertTextValueInDoc("brent@gmail.com");

  // Verify save icon is disabled initially (isDirty=false)
  const saveIcon = screen.getByTestId("save-members-icon");
  expect(saveIcon.classList.contains("text-neutral-300")).toBe(true);
  expect(saveIcon.classList.contains("cursor-not-allowed")).toBe(true);

  // Add first member: Diana
  await addMemberToGroup(user, "diana@example.com");
  await waitForRender(200);

  // Verify Diana was added
  await assertTextValueInDoc("Current Members (4)");
  await assertTextValueInDoc("Available Users (2)");
  await assertTextValueInDoc("diana@example.com");

  // Verify save icon is enabled after first addition
  expect(saveIcon.classList.contains("text-neutral-300")).toBe(false);
  expect(saveIcon.classList.contains("cursor-not-allowed")).toBe(false);

  // Add second member: Eve
  await addMemberToGroup(user, "eve@example.com");
  await waitForRender(200);

  // Verify Eve was added
  await assertTextValueInDoc("Current Members (5)");
  await assertTextValueInDoc("Available Users (1)");
  await assertTextValueInDoc("eve@example.com");

  // Verify save icon still enabled (isDirty persists)
  expect(saveIcon.classList.contains("text-neutral-300")).toBe(false);
  expect(saveIcon.classList.contains("cursor-not-allowed")).toBe(false);

  // Add third member: Brent
  await addMemberToGroup(user, "brent@gmail.com");
  await waitForRender(200);

  // Verify Brent was added
  await assertTextValueInDoc("Current Members (6)");
  await assertTextValueInDoc("Available Users (0)");
  await assertTextValueInDoc("brent@gmail.com");

  // Verify save icon still enabled (isDirty persists through all operations)
  expect(saveIcon.classList.contains("text-neutral-300")).toBe(false);
  expect(saveIcon.classList.contains("cursor-not-allowed")).toBe(false);

  // Verify all current members section contains all 6 members
  const currentMembersSection = screen
    .getByText("Current Members (6)")
    .closest("div");
  expect(currentMembersSection).toBeInTheDocument();

  const membersContent = currentMembersSection?.querySelector(
    '[class*="space-y-2"]'
  )?.textContent;

  // Verify all original members still present
  expect(membersContent).toContain("alice@example.com");
  expect(membersContent).toContain("bob@example.com");
  expect(membersContent).toContain("charlie@example.com");

  // Verify all newly added members present
  expect(membersContent).toContain("diana@example.com");
  expect(membersContent).toContain("eve@example.com");
  expect(membersContent).toContain("brent@gmail.com");

  // Verify available users section shows "No available users"
  const availableSection = screen
    .getByText("Available Users (0)")
    .closest("div");
  const noAvailableMsg =
    availableSection?.textContent?.includes("No available users");
  expect(noAvailableMsg).toBe(true);
}, 10000);
