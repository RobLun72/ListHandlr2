import { afterEach, beforeEach, test, vi } from "vitest";
import { render } from "@testing-library/react";
import {
  serverWithHandlers,
  setupServerWithHandlers,
} from "../../../../MSW/server";
import { handlers } from "../../../../MSW/handlers";
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
  assertMultiplesOfTextValue,
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

test("Delete item in testy list", async () => {
  const user = userEvent.setup();

  await render(<Page />);

  await waitForRender();

  await assertTextValueInDoc("testy");
  await assertTextValueInDoc("item1");

  await clickOnButtonWithIndex(user, "Open menu", 0);
  await assertMultiplesOfTextValue("item1", 2);
  await assertTextValueInDoc("Edit");
  await assertTextValueInDoc("Delete");
  await assertTextValueInDoc("Toggle Done");

  await assertElementHasClassname("save-list-icon", "cursor-not-allowed");

  //act delete
  await clickOnMenuItem(user, "Delete");

  //update client model

  await assertElementHasClassname("save-list-icon", "cursor-pointer");

  //save to server
  await clickOnElementWithTestId(user, "save-list");

  await assertTextValueInDoc(/Saving the testy list.../);
  await waitForRender(300);

  //check that the save button is disabled after saving
  await assertElementHasClassname("save-list-icon", "cursor-not-allowed");

  await assertTextValueInDoc("testy");
  await assertMissingTextValue("item1");
});
