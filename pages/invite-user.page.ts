import { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Invite Users flow within the Add Users panel.
 * Sourced according to Section 3 (F-INV-01 to F-INV-05) and Section 16 of the Stage 1 plan.
 */
export class InviteUserPage {
  readonly page: Page;

  // Form Controls (L-029, L-035, L-036)
  readonly emailInput: Locator;
  readonly sendInviteButton: Locator;
  readonly cancelButton: Locator;

  // Role Selection Options (L-031, L-032)
  readonly managerRoleOption: Locator;
  readonly contentAdminRoleOption: Locator;
  readonly learnerRoleOption: Locator;

  constructor(page: Page) {
    this.page = page;

    this.emailInput = page.getByRole('textbox', { name: 'Email*' });
    this.sendInviteButton = page.getByRole('button', { name: 'Send Invite' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });

    // Scoped listitems for role selection
    this.managerRoleOption = page.getByRole('listitem').filter({ hasText: 'Manager' });
    this.contentAdminRoleOption = page.getByRole('listitem').filter({ hasText: 'Content Admin' });
    this.learnerRoleOption = page.getByRole('listitem').filter({ hasText: 'Learner' });
  }

  /**
   * Enters the invitee's email into the Email* textbox.
   */
  async enterEmail(email: string) {
    await this.emailInput.fill(email);
  }

  /**
   * Selects a role from the invite dropdown.
   */
  async selectRole(role: 'Learner' | 'Manager' | 'Content Admin') {
    const roleOptions = {
      'Learner': this.learnerRoleOption,
      'Manager': this.managerRoleOption,
      'Content Admin': this.contentAdminRoleOption,
    };
    if (roleOptions[role]) {
      await roleOptions[role].click();
    }
  }

  /**
   * Submits the invitation.
   */
  async clickSendInvite() {
    await this.sendInviteButton.click();
  }

  /**
   * Cancels the invitation process.
   */
  async clickCancel() {
    await this.cancelButton.click();
  }
}
