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
  clickOnButtonWithIndex,
  clickOnElementWithTestId,
  clickOnMenuItem,
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

test("Edit entry in Drive list", async () => {
  const user = userEvent.setup();

  await render(
    <ThemeProvider>
      <Page />
    </ThemeProvider>,
  );

  await waitForRender();

  await assertTextValueInDoc("Test note 1");
  await assertElementHasClassname("save-list-icon", "cursor-not-allowed");

  // Open context menu for first row
  await clickOnButtonWithIndex(user, "Open menu", 0);
  await assertTextValueInDoc("Edit");
  await assertTextValueInDoc("Delete");

  // Open edit form
  await clickOnMenuItem(user, "Edit");
  await waitForRender();

  expect(screen.getByText("Edit Entry")).toBeInTheDocument();

  // Change the start odometer
  const startOdo = screen.getByRole("spinbutton", { name: "Start Odometer" });
  await user.clear(startOdo);
  await user.type(startOdo, "5000");

  // Update the notes
  const notesField = screen.getByRole("textbox", { name: "Notes (Optional)" });
  await user.clear(notesField);
  await typeInTextBox(user, "Notes (Optional)", "Edited note 1");

  // Submit the form
  await clickOnButton(user, "Update Entry");

  // Updated values are visible in the table
  await assertTextValueInDoc("Edited note 1");
  await assertTextValueInDoc("5000");

  // Save button is enabled (dirty)
  await assertElementHasClassname("save-list-icon", "cursor-pointer");

  // Save to server
  await clickOnElementWithTestId(user, "save-list");
  await waitForRender(2000);

  // Save button disabled again after successful save
  await assertElementHasClassname("save-list-icon", "cursor-not-allowed");

  await assertTextValueInDoc("Edited note 1");
  await assertTextValueInDoc("5000");
});
