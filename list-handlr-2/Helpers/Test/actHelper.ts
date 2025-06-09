import { act, screen } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event";

export const waitForRender = async (timeout?: number) => {
  const waitTime = timeout ? timeout : 500;
  await act(async () => {
    await new Promise((r) => setTimeout(r, waitTime));
  });
};

export const getValueByTestId = (testId: string) => {
  return (screen.getByTestId(testId) as HTMLElement).innerText;
};

export const typeInTextBox = async (
  user: UserEvent,
  name: string,
  value: string
) => {
  await user.type(screen.getByRole("textbox", { name: name }), value);
};

export const blurInput = async (
  user: UserEvent,
  inputType: string,
  inputName: string
) => {
  await user.type(screen.getByRole(inputType, { name: inputName }), "[Tab]");
};

export const clickOnLink = async (user: UserEvent, linktext: string) => {
  await user.click(screen.getByRole("link", { name: linktext }));
};

export const clickOnMenu = async (user: UserEvent, menuName: string) => {
  await user.click(screen.getByRole("menu", { name: menuName }));
};
export const clickOnMenuItem = async (user: UserEvent, menuName: string) => {
  await user.click(screen.getByRole("menuitem", { name: menuName }));
};

export const clickOnButton = async (user: UserEvent, buttonName: string) => {
  await user.click(screen.getByRole("button", { name: buttonName }));
};
export const clickOnButtonWithIndex = async (
  user: UserEvent,
  buttonName: string,
  index: number
) => {
  await user.click(screen.getAllByRole("button", { name: buttonName })[index]);
};

export const clickOnIconButton = async (user: UserEvent, altText: string) => {
  await user.click(screen.getByLabelText(`${altText}`));
};

export const clickOnPlaceholder = async (user: UserEvent, text: string) => {
  await user.click(screen.getByPlaceholderText(`${text}`));
};

export const clickOnCheckbox = async (
  user: UserEvent,
  checkboxName: string
) => {
  await user.click(screen.getByRole("checkbox", { name: checkboxName }));
};

export const clickOnElementWithTestId = async (
  user: UserEvent,
  testId: string
) => {
  await user.click(screen.getByTestId(testId));
};

export const clickOnTextElement = async (
  user: UserEvent,
  text: string,
  index: number
) => {
  await user.click(screen.getAllByText(text)[index]);
};

export const selectOptionInCombo = async (
  user: UserEvent,
  comboName: string,
  option: string
) => {
  const selectElement = screen.getByRole("combobox", { name: comboName });
  await user.selectOptions(selectElement, option);
};

export const selectOptionInRadixCombo = async (
  user: UserEvent,
  comboName: string,
  option: string
) => {
  // Open the Radix Select dropdown
  const triggerButton = screen.getByRole("combobox", { name: comboName });
  await user.click(triggerButton);
  // Wait for the dropdown to appear and select the option
  const opt = screen.getByRole("option", { name: option });
  await user.click(opt);
};
