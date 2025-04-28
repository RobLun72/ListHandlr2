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

  await assertTextValueInDoc(
    /Create a list of items you want to keep track of./
  );
  await assertTextValueInDoc(/deployed on vercel hosting/);
});
