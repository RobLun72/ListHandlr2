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
import userEvent from "@testing-library/user-event";

// Mock next/navigation
const mockReplace = vi.fn();

vi.mock("next/navigation", async () => {
  const mod = await vi.importActual<typeof import("next/navigation")>(
    "next/navigation"
  );
  return {
    ...mod,
    useSearchParams: () => new URLSearchParams("") as ReadonlyURLSearchParams,
    usePathname: () => "/Lists/testy/format",
    useParams: () => ({ slug: "testy" }),
    useRouter: () => ({
      push: vi.fn(),
      replace: mockReplace,
    }),
  };
});

beforeEach(async () => {
  setupServerWithHandlers([...testHandlers]);
  await serverWithHandlers.listen({ onUnhandledRequest: "error" });
  mockReplace.mockClear();
});

afterEach(() => {
  serverWithHandlers.close();
});

test("Format page loads and displays testy list items", async () => {
  await render(
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  );

  await waitForRender();

  // Check that the page title displays the decoded list name
  await assertTextValueInDoc("Items for testy");

  // Check that list items are displayed
  await assertTextValueInDoc("item1");
});

test("Format page back button navigates to lists", async () => {
  const user = userEvent.setup();

  await render(
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  );

  await waitForRender();

  // Find and click the back button (ArrowLeftStartOnRectangleIcon)
  const backIcon = document.querySelector("svg");
  if (backIcon) {
    await user.click(backIcon);
    expect(mockReplace).toHaveBeenCalledWith("/lists");
  }
});

test("Format page shows loading skeleton initially", async () => {
  const { container } = await render(
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  );

  // Should show loading content initially
  const loadingContent = container.querySelector(".pt-8");
  expect(loadingContent).toBeTruthy();

  await waitForRender();

  // After loading completes, should show the actual list
  await assertTextValueInDoc("Items for testy");
});
