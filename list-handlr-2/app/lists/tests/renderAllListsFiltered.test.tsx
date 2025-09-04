import { afterEach, beforeEach, test, vi } from "vitest";
import { render } from "@testing-library/react";
import {
  serverWithHandlers,
  setupServerWithHandlers,
} from "../../../MSW/server";
import { testHandlers } from "../../../MSW/handlers";
import Page from "../page";
import { waitForRender } from "@/Helpers/Test/actHelper";
import { ReadonlyURLSearchParams } from "next/navigation";
import { assertTextValueInDoc } from "@/Helpers/Test/assertHelper";
import { UserProvider } from "@/contexts/UserContext";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

// Mock next/navigation
vi.mock("next/navigation", async () => {
  const mod = await vi.importActual<typeof import("next/navigation")>(
    "next/navigation"
  );
  return {
    ...mod,
    useSearchParams: () => new URLSearchParams("") as ReadonlyURLSearchParams,
    usePathname: () => "/Lists",
    useRouter: () => ({
      push: vi.fn(),
    }),
  };
});

beforeEach(async () => {
  setupServerWithHandlers([...testHandlers]);
  await serverWithHandlers.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  serverWithHandlers.close();
});

test("Lists page load", async () => {
  // Override the mock for this test
  vi.mocked(useKindeBrowserClient).mockReturnValue({
    user: {
      id: "userWithFeverLists",
      email: "test@example.com",
      given_name: "Test",
      family_name: "User",
      picture: "https://example.com/avatar.jpg",
    },
    isAuthenticated: true,
    isLoading: false,
    userOrganizations: {
      orgCodes: ["test-org-1", "test-org-2"],
      orgs: [
        {
          code: "test-org-1",
          name: "Test Organization 1",
        },
        {
          code: "test-org-2",
          name: "Test Organization 2",
        },
      ],
    },
    getPermissions: vi.fn().mockResolvedValue({ permissions: [] }),
    getClaim: vi.fn().mockReturnValue(null),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  await render(
    <UserProvider>
      <Page />
    </UserProvider>
  );

  await waitForRender();

  await assertTextValueInDoc("Handla");
  await assertTextValueInDoc("testy");
});
