import { afterEach, beforeEach, test, vi } from "vitest";
import { render } from "@testing-library/react";
import {
  serverWithHandlers,
  setupServerWithHandlers,
} from "../../../MSW/server";
import { testHandlers } from "../../../MSW/handlers";
import Page from "../page";
import { waitForRender } from "@/Helpers/Test/actHelper";
import { ReadonlyURLSearchParams } from "next/navigation";
import { assertTextValueInDoc } from "@/Helpers/Test/assertHelper";
//import { handleAllListsServerGet } from "@/MSW/RequestHelpers/allListsHelper";

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

// vi.mock("@/actions/getLists", () => ({
//   getLists: vi.fn().mockImplementation(async () => {
//     // This function runs each time getLists is called
//     const dynamicData = await handleAllListsServerGet();
//     return dynamicData;
//   }),
// }));

beforeEach(async () => {
  setupServerWithHandlers([...testHandlers]);
  await serverWithHandlers.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  serverWithHandlers.close();
});

test("Lists page load", async () => {
  await render(<Page />);

  await waitForRender();

  await assertTextValueInDoc("Matlista");
  await assertTextValueInDoc("Handla");
  await assertTextValueInDoc("testy");
});
