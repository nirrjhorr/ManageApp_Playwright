import { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Add Users overlay/dialog.
 * Serves as the branching point between "Invite Users" (default tab/view)
 * and "Add / Create Users" (via exact 'Add' action button).
 */
export class AddUsersPage {
  readonly page: Page;

  // Dialog & Flow Buttons (L-029, L-035, L-036, L-037)
  readonly addExactButton: Locator;
  readonly cancelButton: Locator;
  readonly inviteEmailInput: Locator;
  readonly sendInviteButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // L-037: exact: true distinguishes 'Add' sub-tab/button from 'Add Users' main button
    this.addExactButton = page.getByRole('button', { name: 'Add', exact: true });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.inviteEmailInput = page.getByRole('textbox', { name: 'Email*' });
    this.sendInviteButton = page.getByRole('button', { name: 'Send Invite' });
  }

  /**
   * Switches to the manual user creation flow by clicking 'Add'.
   */
  async openCreateUserForm() {
    await this.addExactButton.click();
    await this.page.getByRole('textbox', { name: 'john@example.com' }).first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  }

  /**
   * Closes the Add Users overlay without taking action.
   */
  async cancel() {
    await this.cancelButton.click();
  }
}
