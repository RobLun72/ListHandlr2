import { afterEach, beforeEach, test, vi } from "vitest";
import { render } from "@testing-library/react";
import {
  serverWithHandlers,
  setupServerWithHandlers,
} from "../../../../MSW/server";
import { testHandlers } from "../../../../MSW/handlers";
import Page from "../page";
import {
  clickOnButtonWithIndex,
  clickOnElementWithTestId,
  clickOnMenuItem,
  waitForRender,
} from "@/Helpers/Test/actHelper";
import { ReadonlyURLSearchParams } from "next/navigation";
import {
  assertElementHasClassname,
  assertMissingTextValue,
  assertTextValueInDoc,
} from "@/Helpers/Test/assertHelper";
import userEvent from "@testing-library/user-event";
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

test("Delete entry from Drive list", async () => {
  const user = userEvent.setup();

  await render(
    <ThemeProvider>
      <Page />
    </ThemeProvider>,
  );

  await waitForRender();

  await assertTextValueInDoc("Test note 1");
  await assertTextValueInDoc("Test note 2");
  await assertTextValueInDoc("Test note 3");
  await assertElementHasClassname("save-list-icon", "cursor-not-allowed");

  // Open context menu for first row and delete it
  await clickOnButtonWithIndex(user, "Open menu", 0);
  await clickOnMenuItem(user, "Delete");

  // First entry is immediately removed from the table
  await assertMissingTextValue("Test note 1");

  // Remaining entries are still present
  await assertTextValueInDoc("Test note 2");
  await assertTextValueInDoc("Test note 3");

  // Save button is enabled (dirty)
  await assertElementHasClassname("save-list-icon", "cursor-pointer");

  // Save to server
  await clickOnElementWithTestId(user, "save-list");
  await waitForRender(2000);

  // Save button disabled again after successful save
  await assertElementHasClassname("save-list-icon", "cursor-not-allowed");

  // Deleted entry is still absent; others remain
  await assertMissingTextValue("Test note 1");
  await assertTextValueInDoc("Test note 2");
  await assertTextValueInDoc("Test note 3");
});
