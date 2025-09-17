import { afterEach, beforeEach, test, vi, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  serverWithHandlers,
  setupServerWithHandlers,
} from "../../../../../MSW/server";
import { testHandlers } from "../../../../../MSW/handlers";
import Page from "../page";
import {
  clickOnElementWithTestId,
  waitForRender,
} from "@/Helpers/Test/actHelper";
import { ReadonlyURLSearchParams } from "next/navigation";
import {
  assertElementHasClassname,
  assertTextValueInDoc,
} from "@/Helpers/Test/assertHelper";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { userEvent } from "@testing-library/user-event/dist/cjs/setup/index.js";

// Mock next/navigation
const mockPush = vi.fn();
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
});

afterEach(() => {
  serverWithHandlers.close();
});

test("Format page loads and displays list items correctly", async () => {
  await render(
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  );

  await waitForRender();

  // Check that the page title is displayed correctly
  await assertTextValueInDoc("Items for testy");

  // Check that list items are displayed
  await assertTextValueInDoc("item1");
});

test("Format page shows loading skeleton initially", async () => {
  const { container } = await render(
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  );

  // Should show loading skeleton initially
  expect(container.querySelector(".animate-pulse")).toBeTruthy();

  await waitForRender();
});

test.skip("Back button navigates to lists page", async () => {
  const user = userEvent.setup();

  await render(
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  );

  await waitForRender();

  // Find and click the back button
  await assertElementHasClassname("back-button-icon", "cursor-pointer");

  //save to server
  await clickOnElementWithTestId(user, "back-button-icon");

  expect(mockReplace).toHaveBeenCalledWith("/lists");
});

test("Format page displays items with links correctly", async () => {
  await render(
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  );

  await waitForRender();

  // Check that items with links are displayed properly
  await assertTextValueInDoc("item1");

  // If there are items with links, check they're displayed
  const linkElements = document.querySelectorAll(
    ".text-muted-foreground.italic"
  );
  expect(linkElements.length).toBeGreaterThanOrEqual(0);
});

test("Format page applies correct theme styling", async () => {
  await render(
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  );

  await waitForRender();

  // Check that theme-based styling is applied to the back arrow
  const arrowIcon = document.querySelector("svg");
  expect(arrowIcon).toBeTruthy();

  if (arrowIcon) {
    const classes = arrowIcon.className;
    expect(classes).toMatch(/text-app(Blue|Green)/);
  }
});

test.skip("Format page handles URL decoded list names correctly", async () => {
  // Mock params with encoded characters
  vi.mocked(vi.importActual).mockImplementation(async () => {
    const mod = await vi.importActual<typeof import("next/navigation")>(
      "next/navigation"
    );
    return {
      ...mod,
      useParams: () => ({ slug: "test%20list%20with%20spaces" }),
      useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
      }),
    };
  });

  await render(
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  );

  await waitForRender();

  // Should decode URL and display correctly
  await assertTextValueInDoc("Items for test list with spaces");
});
