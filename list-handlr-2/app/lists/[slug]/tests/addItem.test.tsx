import { afterEach, beforeEach, test, vi } from "vitest";
import { render } from "@testing-library/react";
import {
  serverWithHandlers,
  setupServerWithHandlers,
} from "../../../../MSW/server";
import { handlers } from "../../../../MSW/handlers";
import Page from "../page";
import {
  blurInput,
  clickOnButton,
  clickOnElementWithTestId,
  typeInTextBox,
  waitForRender,
} from "@/Helpers/Test/actHelper";
import { ReadonlyURLSearchParams } from "next/navigation";
import {
  assertButtonIsEnabled,
  assertElementHasClassname,
  assertTextValueInDoc,
} from "@/Helpers/Test/assertHelper";
import userEvent from "@testing-library/user-event";

// Mock next/navigation
vi.mock("next/navigation", async () => {
  const mod = await vi.importActual<typeof import("next/navigation")>(
    "next/navigation"
  );
  return {
    ...mod,
    useSearchParams: () => new URLSearchParams("") as ReadonlyURLSearchParams,
    usePathname: () => "/Lists",
    useParams: () => ({ slug: "testy" }),
    useRouter: () => ({
      push: vi.fn(),
    }),
  };
});

beforeEach(async () => {
  setupServerWithHandlers([...handlers]);
  await serverWithHandlers.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  serverWithHandlers.close();
});

test("Add item in testy list", async () => {
  const user = userEvent.setup();

  await render(<Page />);

  await waitForRender();

  await assertTextValueInDoc("testy");
  await assertTextValueInDoc("item1");

  await assertElementHasClassname("save-list-icon", "cursor-not-allowed");

  //act add
  await clickOnElementWithTestId(user, "table-add-button");

  await typeInTextBox(user, "Item", "Item added");

  await blurInput(user, "textbox", "Item");

  await assertButtonIsEnabled("Create Item");

  //update client model
  await clickOnButton(user, "Create Item");

  await assertTextValueInDoc("testy");
  await assertTextValueInDoc("item1");
  await assertTextValueInDoc("Item added");

  await assertElementHasClassname("save-list-icon", "cursor-pointer");
  //save to server
  await clickOnElementWithTestId(user, "save-list");

  await assertTextValueInDoc(/Saving the testy list.../);
  await waitForRender(300);

  //check that the save button is disabled after saving
  await assertElementHasClassname("save-list-icon", "cursor-not-allowed");

  await assertTextValueInDoc("testy");
  await assertTextValueInDoc("item1");
  await assertTextValueInDoc("Item added");
});
