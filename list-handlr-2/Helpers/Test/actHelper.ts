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

/**
 * Helper to add a member to a collaboration group by clicking the plus icon
 * next to the user in the "Available Users" list
 * @param user - UserEvent instance from userEvent.setup()
 * @param userIdentifier - User's email, username, or display text
 */
export const addMemberToGroup = async (
  user: UserEvent,
  userIdentifier: string
) => {
  // Find the user's row by text content
  const userRow = screen.getByText(userIdentifier).closest("div");
  if (!userRow) {
    throw new Error(`Could not find user row for: ${userIdentifier}`);
  }
  
  // Find the "Add to group" button within that row
  const addButton = userRow.querySelector('button[title="Add to group"]');
  if (!addButton) {
    throw new Error(`Could not find add button for user: ${userIdentifier}`);
  }
  
  await user.click(addButton as HTMLElement);
};

/**
 * Helper to remove a member from a collaboration group by clicking the minus icon
 * next to the user in the "Current Members" list
 * @param user - UserEvent instance from userEvent.setup()
 * @param userIdentifier - User's email, username, or display text
 */
export const removeMemberFromGroup = async (
  user: UserEvent,
  userIdentifier: string
) => {
  // Find the user's row by text content
  const userRow = screen.getByText(userIdentifier).closest("div");
  if (!userRow) {
    throw new Error(`Could not find user row for: ${userIdentifier}`);
  }
  
  // Find the "Remove from group" button within that row
  const removeButton = userRow.querySelector('button[title="Remove from group"]');
  if (!removeButton) {
    throw new Error(`Could not find remove button for user: ${userIdentifier}`);
  }
  
  await user.click(removeButton as HTMLElement);
};
