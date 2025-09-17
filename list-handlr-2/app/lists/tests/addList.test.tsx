import { afterEach, beforeEach, test, vi } from "vitest";
import { render } from "@testing-library/react";
import {
  serverWithHandlers,
  setupServerWithHandlers,
} from "../../../MSW/server";
import { testHandlers } from "../../../MSW/handlers";
import Page from "../page";
import {
  blurInput,
  clickOnButton,
  clickOnElementWithTestId,
  getValueByTestId,
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
import { UserProvider } from "@/contexts/UserContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

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

test("Add list", async () => {
  const user = userEvent.setup();

  await render(
    <UserProvider>
      <ThemeProvider>
        <Page />
      </ThemeProvider>
    </UserProvider>
  );

  await waitForRender();

  await assertTextValueInDoc("Matlista");
  await assertTextValueInDoc("Handla");
  await assertTextValueInDoc("testy");
  const loadedTimeStamp = getValueByTestId("current-timestamp");

  await assertElementHasClassname("save-list-icon", "cursor-not-allowed");

  //act add
  await clickOnElementWithTestId(user, "table-add-button");

  await typeInTextBox(user, "List", "List added");

  await blurInput(user, "textbox", "List");

  await assertButtonIsEnabled("Create Item");

  //update client model
  await clickOnButton(user, "Create Item");

  await assertElementHasClassname("save-list-icon", "cursor-pointer");
  await assertTextValueInDoc("List added");

  //save to server
  await clickOnElementWithTestId(user, "save-list");

  await assertTextValueInDoc(/Saving the list.../);
  await waitForRender(400);

  await assertTextValueInDoc("Matlista");
  await assertTextValueInDoc("Handla");
  await assertTextValueInDoc("testy");
  await assertTextValueInDoc("testy da besty");
  await assertTextValueInDoc("List added");

  const updTimeStamp = getValueByTestId("current-timestamp");
  expect(loadedTimeStamp).not.toEqual(updTimeStamp);
});
