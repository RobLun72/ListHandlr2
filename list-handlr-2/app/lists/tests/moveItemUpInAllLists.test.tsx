import { afterEach, beforeEach, test, vi } from "vitest";
import { render } from "@testing-library/react";
import {
  serverWithHandlers,
  setupServerWithHandlers,
} from "../../../MSW/server";
import { testHandlers } from "../../../MSW/handlers";
import Page from "../page";
import {
  clickOnElementWithTestId,
  getValueByTestId,
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
import { UserProvider } from "@/contexts/UserContext";

// Mock next/navigation
vi.mock("next/navigation", async () => {
  const mod = await vi.importActual<typeof import("next/navigation")>(
    "next/navigation"
  );
  return {
    ...mod,
    useSearchParams: () => new URLSearchParams("") as ReadonlyURLSearchParams,
    usePathname: () => "/Lists",
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

test("Move item up in All list", async () => {
  const user = userEvent.setup();

  await render(
    <UserProvider>
      <Page />
    </UserProvider>
  );

  await waitForRender();

  await assertTextValueInDoc("Matlista");
  await assertTextValueInDoc("Handla");
  await assertTextValueInDoc("testy");

  const rows = document.querySelectorAll('[data-slot="table-row"]');

  assertNumberOfElementsInList(rows, 4); // 3 items in the list + header row
  assertElementsValueForListIndex(rows[1].childNodes, 1, "testy");
  assertElementsValueForListIndex(rows[2].childNodes, 1, "Matlista");
  assertElementsValueForListIndex(rows[3].childNodes, 1, "Handla");

  const loadedTimeStamp = getValueByTestId("current-timestamp");
  //check that the save button is disabled when not dirty
  await assertElementHasClassname("save-list-icon", "cursor-not-allowed");

  //move item
  await clickOnElementWithTestId(user, "up-button-1");

  //check that the save button is enabled when dirty
  await assertElementHasClassname("save-list-icon", "cursor-pointer");

  await clickOnElementWithTestId(user, "save-list");

  await assertTextValueInDoc(/Saving the list.../);
  await waitForRender(300);

  //check that the save button is disabled after saving
  await assertElementHasClassname("save-list-icon", "cursor-not-allowed");

  await assertTextValueInDoc("testy");
  await assertTextValueInDoc("Handla");
  await assertTextValueInDoc("Matlista");
  const rows2 = document.querySelectorAll('[data-slot="table-row"]');

  //check that the items are in the correct order after saving
  assertNumberOfElementsInList(rows2, 4);
  assertElementsValueForListIndex(rows2[1].childNodes, 1, "Matlista");
  assertElementsValueForListIndex(rows2[2].childNodes, 1, "testy");
  assertElementsValueForListIndex(rows2[3].childNodes, 1, "Handla");

  const updTimeStamp = getValueByTestId("current-timestamp");
  expect(loadedTimeStamp).not.toEqual(updTimeStamp);
});
