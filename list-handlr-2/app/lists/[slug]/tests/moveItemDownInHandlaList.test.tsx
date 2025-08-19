import { afterEach, beforeEach, test, vi } from "vitest";
import { render } from "@testing-library/react";
import {
  serverWithHandlers,
  setupServerWithHandlers,
} from "../../../../MSW/server";
import { testHandlers } from "../../../../MSW/handlers";
import Page from "../page";
import {
  clickOnElementWithTestId,
  waitForRender,
} from "@/Helpers/Test/actHelper";
import { ReadonlyURLSearchParams } from "next/navigation";
import {
  assertElementHasClassname,
  assertElementsValueForListIndex,
  assertNumberOfElementsInList,
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
    useParams: () => ({ slug: "Handla" }),
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

test("Move item down in Handla list", async () => {
  const user = userEvent.setup();

  await render(<Page />);

  await waitForRender();

  await assertTextValueInDoc("Ris");
  await assertTextValueInDoc("Tesil");
  await assertTextValueInDoc("Tomat");

  const rows = document.querySelectorAll('[data-slot="table-row"]');

  assertNumberOfElementsInList(rows, 9); // 8 items in the list + header row
  assertElementsValueForListIndex(rows[1].childNodes, 1, "Ris");
  assertElementsValueForListIndex(rows[2].childNodes, 1, "Tesil");
  assertElementsValueForListIndex(rows[3].childNodes, 1, "Tomat");

  //check that the save button is disabled when not dirty
  await assertElementHasClassname("save-list-icon", "cursor-not-allowed");

  //move item
  await clickOnElementWithTestId(user, "down-button-1");

  //check that the save button is enabled when dirty
  await assertElementHasClassname("save-list-icon", "cursor-pointer");

  await clickOnElementWithTestId(user, "save-list");

  await assertTextValueInDoc(/Saving the Handla list.../);
  await waitForRender(300);

  //check that the save button is disabled after saving
  await assertElementHasClassname("save-list-icon", "cursor-not-allowed");

  //check that the items are in the correct order after saving
  const rows2 = document.querySelectorAll('[data-slot="table-row"]');
  assertNumberOfElementsInList(rows2, 9); // 8 items in the list + header row
  assertElementsValueForListIndex(rows2[1].childNodes, 1, "Ris");
  assertElementsValueForListIndex(rows2[2].childNodes, 1, "Tomat");
  assertElementsValueForListIndex(rows2[3].childNodes, 1, "Tesil");
});
