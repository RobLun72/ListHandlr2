import { afterEach, beforeEach, test, vi, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  serverWithHandlers,
  setupServerWithHandlers,
} from "../../../../../MSW/server";
import { testHandlers } from "../../../../../MSW/handlers";
import Page from "../page";
import { waitForRender } from "@/Helpers/Test/actHelper";
import { ReadonlyURLSearchParams } from "next/navigation";
import { ThemeProvider } from "@/contexts/ThemeContext";

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
    usePathname: () => "/Lists/empty/format",
    useParams: () => ({ slug: "empty" }),
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

test("Format page shows no items message when list is empty", async () => {
  await render(
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  );

  await waitForRender();

  // Should show no items message
  expect(screen.queryByText("No items found.")).toBeTruthy();
});
