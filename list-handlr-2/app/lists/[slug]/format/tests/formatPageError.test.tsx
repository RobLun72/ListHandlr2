import { afterEach, beforeEach, test, vi, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  serverWithHandlers,
  setupServerWithHandlers,
} from "../../../../../MSW/server";
import { testHandlers } from "../../../../../MSW/handlers";
import Page from "../page";
import { waitForRender } from "@/Helpers/Test/actHelper";
import { ReadonlyURLSearchParams } from "next/navigation";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { toast } from "sonner";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

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

vi.mock("@/actions/getNamedList", () => ({
  getNamedList: vi
    .fn()
    .mockImplementation(async (params: { listName: string }) => {
      throw new Error(`load failed for ${params.listName}`);
    }),
}));

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

test("Format page handles API errors gracefully", async () => {
  // Mock a failing API call
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  await render(
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  );

  await waitForRender();

  // Should show error toast with the specific message
  expect(toast.error).toHaveBeenCalledWith(
    "Error loading: Error: load failed for testy"
  );

  consoleSpy.mockRestore();
});
