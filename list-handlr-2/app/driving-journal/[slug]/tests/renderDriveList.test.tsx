import { afterEach, beforeEach, test, vi } from "vitest";
import { render } from "@testing-library/react";
import {
  serverWithHandlers,
  setupServerWithHandlers,
} from "../../../../MSW/server";
import { testHandlers } from "../../../../MSW/handlers";
import Page from "../page";
import { waitForRender } from "@/Helpers/Test/actHelper";
import { ReadonlyURLSearchParams } from "next/navigation";
import {
  assertElementHasClassname,
  assertTextValueInDoc,
} from "@/Helpers/Test/assertHelper";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Mock next/navigation
vi.mock("next/navigation", async () => {
  const mod =
    await vi.importActual<typeof import("next/navigation")>("next/navigation");
  return {
    ...mod,
    useSearchParams: () => new URLSearchParams("") as ReadonlyURLSearchParams,
    usePathname: () => "/driving-journal/Drive",
    useParams: () => ({ slug: "Drive" }),
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

test("Drive list page load", async () => {
  await render(
    <ThemeProvider>
      <Page />
    </ThemeProvider>,
  );

  await waitForRender();

  // List title
  await assertTextValueInDoc("Drive");

  // All 3 seeded entries are visible via their unique notes
  await assertTextValueInDoc("Test note 1");
  await assertTextValueInDoc("Test note 2");
  await assertTextValueInDoc("Test note 3");

  // Odometer and distance values
  await assertTextValueInDoc("1000");
  await assertTextValueInDoc("1300");

  // Save button starts disabled (not dirty)
  await assertElementHasClassname("save-list-icon", "cursor-not-allowed");
});
