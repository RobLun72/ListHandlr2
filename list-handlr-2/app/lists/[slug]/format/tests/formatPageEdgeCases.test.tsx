import { afterEach, beforeEach, test, vi } from "vitest";
import { render } from "@testing-library/react";
import {
  serverWithHandlers,
  setupServerWithHandlers,
} from "../../../../../MSW/server";
import { testHandlers } from "../../../../../MSW/handlers";
import Page from "../page";
import { waitForRender } from "@/Helpers/Test/actHelper";
import { ReadonlyURLSearchParams } from "next/navigation";
import { assertTextValueInDoc } from "@/Helpers/Test/assertHelper";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Mock next/navigation with different scenarios
const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", async () => {
  const mod = await vi.importActual<typeof import("next/navigation")>(
    "next/navigation"
  );
  return {
    ...mod,
    useSearchParams: () => new URLSearchParams("") as ReadonlyURLSearchParams,
    usePathname: () => "/Lists/testy%20da%20besty/format",
    useParams: () => ({ slug: "testy%20da%20besty" }),
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
    }),
  };
});

beforeEach(async () => {
  setupServerWithHandlers([...testHandlers]);
  await serverWithHandlers.listen({ onUnhandledRequest: "error" });
  mockPush.mockClear();
  mockReplace.mockClear();
  vi.clearAllMocks();
});

afterEach(() => {
  serverWithHandlers.close();
});

test("Format page handles special characters in list names", async () => {
  await render(
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  );

  await waitForRender();

  // Should decode special characters correctly - use the helper function
  await assertTextValueInDoc("Items for testy da besty");
});
