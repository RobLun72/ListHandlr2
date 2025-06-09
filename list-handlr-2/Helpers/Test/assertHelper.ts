import { screen } from "@testing-library/react";
import { Mock, MockInstance, expect } from "vitest";

export const assertMultiplesOfTextValue = async (
  value: string | RegExp,
  nrOfInstances: number
) => {
  try {
    expect((await screen.findAllByText(value)).length).toBe(nrOfInstances);
  } catch (error: unknown) {
    throw new Error(`Looking for text: ${value} got Error: ${error}`);
  }
};
export const assertTextValue = async (value: string | RegExp) => {
  expect(await screen.findByText(value)).toBeVisible();
};
export const assertTextValueInDoc = async (value: string | RegExp) => {
  expect(await screen.findByText(value)).toBeInTheDocument();
};

export const assertAltTextValue = async (value: string) => {
  expect(await screen.findByLabelText(`${value}`)).toBeInTheDocument();
};
export const assertFileValue = async (name: string, value: string) => {
  expect(
    ((await screen.findByPlaceholderText(`${name}`)) as HTMLInputElement).value
  ).toBe(value);
};
export const assertInputValue = async (
  type: string,
  name: string,
  value: string
) => {
  //try {
  expect(
    (
      (await screen.findByRole(type, {
        name: name,
      })) as HTMLInputElement
    ).value
  ).toBe(value);
  // } catch (error: unknown) {
  //   throw new Error(
  //     `Looking for input: ${name} type: ${type} got Error: ${error}`
  //   );
  // }
};

export const assertSelectSearchValue = async (name: string, value: string) => {
  expect(
    (
      (await screen.findByRole("combobox", {
        name: name,
      })) as HTMLButtonElement
    ).textContent
  ).toBe(value);
};

export const assertByDisplayValue = async (name: string, value: string) => {
  try {
    expect(
      ((await screen.findByDisplayValue(value)) as HTMLInputElement).name
    ).toBe(name);
  } catch (error: unknown) {
    throw new Error(`Looking for input: ${name} got Error: ${error}`);
  }
};
export const assertCheckboxValue = async (name: string, checked: boolean) => {
  expect(
    (
      (await screen.findByRole("checkbox", {
        name: name,
      })) as HTMLInputElement
    ).checked
  ).toBe(checked);
};
export const assertRadioValue = async (name: string, checked: boolean) => {
  expect(
    (
      (await screen.findByRole("radio", {
        name: name,
      })) as HTMLInputElement
    ).checked
  ).toBe(checked);
};
export const assertElementFillColor = async (
  element: HTMLElement,
  color: string
) => {
  expect(element.getAttribute("fill")).toBe(color);
};

export const assertNumberOfElementsWithClassname = (
  className: string,
  nrOfElements: number
) => {
  const elements = document.querySelectorAll(className);
  expect(elements).toHaveLength(nrOfElements);
};
export const assertNumberOfElementsInList = (
  list: HTMLCollection,
  nrOfElements: number
) => {
  expect(list).toHaveLength(nrOfElements);
};

export const assertEditorWithClassname = (className: string, text: string) => {
  const element = document.querySelector(className);
  expect(element!.getAttribute("contenteditable")).toBe("true");
  expect(element!.textContent).toBe(text);
};

export const assertMissingTextValue = async (value: string) => {
  expect(await screen.queryByText(`${value}`)).toBe(null);
};
export const assertMissingAltTextValue = async (value: string) => {
  expect(await screen.queryByLabelText(`${value}`)).toBe(null);
};
export const assertMissingPlaceholderValue = async (name: string) => {
  expect(await screen.queryByPlaceholderText(`${name}`)).toBe(null);
};
export const assertMissingInputValue = async (type: string, name: string) => {
  expect(await screen.queryByRole(type, { name: name })).toBe(null);
};
export const assertMissingCheckboxValue = async (name: string) => {
  expect(await screen.queryByRole("checkbox", { name: name })).toBe(null);
};

export const assertElementHasClassname = async (
  testId: string,
  className: string
) => {
  expect(
    await (screen.getByTestId(testId) as HTMLElement).classList.contains(
      className
    )
  ).toBe(true);
};

export const assertButtonHasClassname = async (
  buttonName: string,
  className: string
) => {
  expect(
    await (
      screen.getByRole("button", {
        name: buttonName,
      }) as HTMLButtonElement
    ).classList.contains(className)
  ).toBe(true);
};

export const assertButtonIsEnabled = async (buttonName: string) => {
  expect(
    await (
      screen.getByRole("button", {
        name: buttonName,
      }) as HTMLButtonElement
    ).disabled
  ).toBe(false);
};

export const assertButtonIsDisabled = async (buttonName: string) => {
  expect(
    await (
      screen.getByRole("button", {
        name: buttonName,
      }) as HTMLButtonElement
    ).disabled
  ).toBe(true);
};

export const assertBrowserUrlIs = (url: string) => {
  const queryPart = window.location.pathname;
  expect(queryPart).toEqual(url);
};

export const assertLinkHasHref = async (linkText: string, href: string) => {
  expect(
    (
      screen.getByRole("link", {
        name: linkText,
      }) as HTMLAnchorElement
    ).href
  ).toBe(href);
};

export const assertMockIsCalledWith = async (
  mock: Mock | MockInstance,
  value: string | number
) => {
  expect(mock).toHaveBeenCalledWith(value);
};

export const assertMockIsCalledWithTwoValues = async (
  mock: Mock | MockInstance,
  value1: string | number,
  value2: string | number
) => {
  expect(mock).toHaveBeenCalledWith(value1, value2);
};

export const assertMockIsCalledNrOfTimes = async (
  mock: Mock | MockInstance,
  nrOfTimes: number
) => {
  expect(mock).toHaveBeenCalledTimes(nrOfTimes);
};
