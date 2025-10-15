import { afterEach, beforeEach, test, vi } from "vitest";
import { render } from "@testing-library/react";
import Page from "../page";
import { waitForRender } from "@/Helpers/Test/actHelper";
import { ReadonlyURLSearchParams } from "next/navigation";
import { assertTextValueInDoc } from "@/Helpers/Test/assertHelper";
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
    usePathname: () => "/collab-groups",
    useParams: () => ({ groupName: "DevTeam" }),
    useRouter: () => ({
      push: vi.fn(),
    }),
  };
});

beforeEach(() => {
  // Seed the mock DB with test data using the same user ID that UserContext provides
  // when NEXT_PUBLIC_AUTH_ACTIVE=false (from .env.test)
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

test("Group members page loads and displays group details", async () => {
  await render(
    <UserProvider>
      <ThemeProvider>
        <Page />
      </ThemeProvider>
    </UserProvider>
  );

  await waitForRender();

  // Verify the group name appears in the header
  await assertTextValueInDoc("DevTeam - Members");

  // Verify current members section exists
  await assertTextValueInDoc("Current Members (3)");

  // The seedTestData creates DevTeam with 3 members:
  // user-1 (Alice Johnson), user-2 (Bob Smith), user-3 (Charlie Davis)
  await assertTextValueInDoc("alice@example.com");
  await assertTextValueInDoc("bob@example.com");
  await assertTextValueInDoc("charlie@example.com");

  // Verify available users section exists
  await assertTextValueInDoc("Available Users (3)");
}, 10000);
