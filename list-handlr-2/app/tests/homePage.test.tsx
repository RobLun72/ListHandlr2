import { test } from "vitest";
import { render } from "@testing-library/react";
import Page from "../page";
import { waitForRender } from "@/Helpers/Test/actHelper";
import { assertTextValueInDoc } from "@/Helpers/Test/assertHelper";

beforeEach(async () => {});

afterEach(() => {});

test("Home page load", async () => {
  await render(<Page />);

  await waitForRender();

  await assertTextValueInDoc(/Get started by editing/);
  await assertTextValueInDoc(/Go to nextjs.org/);
});
