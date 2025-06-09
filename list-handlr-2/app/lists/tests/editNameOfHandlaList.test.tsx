import { afterEach, beforeEach, test, vi } from "vitest";
import { render } from "@testing-library/react";
import {
  serverWithHandlers,
  setupServerWithHandlers,
} from "../../../MSW/server";
import { handlers } from "../../../MSW/handlers";
import Page from "../page";
import {
  blurInput,
  clickOnButton,
  clickOnButtonWithIndex,
  clickOnMenuItem,
  getValueByTestId,
  typeInTextBox,
  waitForRender,
} from "@/Helpers/Test/actHelper";
import { ReadonlyURLSearchParams } from "next/navigation";
import {
  assertButtonIsEnabled,
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

test("Edit name of handla list", async () => {
  const user = userEvent.setup();

  await render(<Page />);

  await waitForRender();

  await assertTextValueInDoc("Matlista");
  await assertTextValueInDoc("Handla");
  await assertTextValueInDoc("testy");

  const loadedTimeStamp = getValueByTestId("current-timestamp");

  await clickOnButtonWithIndex(user, "Open menu", 2);
  await assertMultiplesOfTextValue("Handla", 2);
  await assertTextValueInDoc("Edit");
  await assertTextValueInDoc("Delete");
  await assertTextValueInDoc("View list items");

  //click on view region
  await clickOnMenuItem(user, "Edit");

  await typeInTextBox(user, "List", " edited");

  await blurInput(user, "textbox", "List");

  await assertButtonIsEnabled("Update Item");

  await clickOnButton(user, "Update Item");

  await assertTextValueInDoc(/Saving the list.../);
  await waitForRender(300);

  await assertTextValueInDoc("Matlista");
  await assertTextValueInDoc("Handla edited");
  await assertTextValueInDoc("testy");

  const updTimeStamp = getValueByTestId("current-timestamp");
  expect(loadedTimeStamp).not.toEqual(updTimeStamp);
});
