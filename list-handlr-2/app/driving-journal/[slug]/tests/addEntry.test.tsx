import { afterEach, beforeEach, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  serverWithHandlers,
  setupServerWithHandlers,
} from "../../../../MSW/server";
import { testHandlers } from "../../../../MSW/handlers";
import Page from "../page";
import {
  clickOnButton,
  clickOnElementWithTestId,
  typeInTextBox,
  waitForRender,
} from "@/Helpers/Test/actHelper";
import { ReadonlyURLSearchParams } from "next/navigation";
import {
  assertElementHasClassname,
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

test("Add entry to Drive list", async () => {
  const user = userEvent.setup();

  await render(
    <ThemeProvider>
      <Page />
    </ThemeProvider>,
  );

  await waitForRender();

  await assertTextValueInDoc("Test note 1");
  await assertElementHasClassname("save-list-icon", "cursor-not-allowed");

  // Open the add form
  await clickOnElementWithTestId(user, "table-add-button");
  await waitForRender();

  // Fill in odometer readings
  const startOdo = screen.getByRole("spinbutton", { name: "Start Odometer" });
  await user.clear(startOdo);
  await user.type(startOdo, "9000");

  const endOdo = screen.getByRole("spinbutton", { name: "End Odometer" });
  await user.clear(endOdo);
  await user.type(endOdo, "9200");

  // Fill in notes
  await typeInTextBox(user, "Notes (Optional)", "New entry notes");

  // Submit the form
  await clickOnButton(user, "Add Entry");

  // New entry appears in table
  await assertTextValueInDoc("New entry notes");

  // Save button is now enabled (dirty)
  await assertElementHasClassname("save-list-icon", "cursor-pointer");

  // Save to server
  await clickOnElementWithTestId(user, "save-list");
  await waitForRender(2000);

  // Save button disabled again after successful save
  await assertElementHasClassname("save-list-icon", "cursor-not-allowed");

  // Entry still visible after save
  await assertTextValueInDoc("New entry notes");
});
