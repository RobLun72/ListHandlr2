import { afterEach, beforeEach, test, vi } from "vitest";
import { render } from "@testing-library/react";
import {
  serverWithHandlers,
  setupServerWithHandlers,
} from "../../../MSW/server";
import { handlers } from "../../../MSW/handlers";
import Page from "../page";
import {
  clickOnButton,
  clickOnButtonWithIndex,
  clickOnMenuItem,
  getValueByTestId,
  waitForRender,
} from "@/Helpers/Test/actHelper";
import { ReadonlyURLSearchParams } from "next/navigation";
import {
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

test("Delete testy list", async () => {
  const user = userEvent.setup();

  await render(<Page />);

  await waitForRender();

  await assertTextValueInDoc("Matlista");
  await assertTextValueInDoc("Handla");
  await assertTextValueInDoc("testy");
  const loadedTimeStamp = getValueByTestId("current-timestamp");

  await clickOnButtonWithIndex(user, "Open menu", 0);
  await assertMultiplesOfTextValue("testy", 2);
  await assertTextValueInDoc("Edit");
  await assertTextValueInDoc("Delete");
  await assertTextValueInDoc("View list items");

  await clickOnMenuItem(user, "Delete");

  await assertTextValueInDoc("Are you sure you want to delete this list?");
  await clickOnButton(user, "Continue");

  await assertTextValueInDoc(/Saving the list.../);
  await waitForRender(300);

  await assertTextValueInDoc("Matlista");
  await assertTextValueInDoc("Handla");
  await assertMissingTextValue("testy");

  const updTimeStamp = getValueByTestId("current-timestamp");
  expect(loadedTimeStamp).not.toEqual(updTimeStamp);
});
