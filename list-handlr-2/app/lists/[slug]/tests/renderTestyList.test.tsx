import { afterEach, beforeEach, test, vi } from "vitest";
import { render } from "@testing-library/react";
import {
  serverWithHandlers,
  setupServerWithHandlers,
} from "../../../../MSW/server";
import { testHandlers } from "../../../../MSW/handlers";
import Page from "../page";
import { waitForRender } from "@/Helpers/Test/actHelper";
import { ReadonlyURLSearchParams } from "next/navigation";
import { assertTextValueInDoc } from "@/Helpers/Test/assertHelper";
//import { handleNamedListServerGet } from "@/MSW/RequestHelpers/namedListHelper";

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

// vi.mock("@/actions/getNamedList", () => ({
//   getNamedList: vi
//     .fn()
//     .mockImplementation(async (params: { listName: string }) => {
//       // You could use a helper function similar to handleAllListsServerGet
//       const dynamicData = await handleNamedListServerGet(params.listName);
//       return dynamicData;
//     }),
// }));

beforeEach(async () => {
  setupServerWithHandlers([...testHandlers]);
  await serverWithHandlers.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  serverWithHandlers.close();
});

test("Testy list page load", async () => {
  await render(<Page />);

  await waitForRender();

  await assertTextValueInDoc("testy");
  await assertTextValueInDoc("item1");
});
