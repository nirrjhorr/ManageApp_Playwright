import { Page, Locator } from '@playwright/test';

/**
 * Page Object for Edit User view/modal.
 * Handles editing user details, phone, job title, role, department reassignment, and team reassignment.
 */
export class EditUserPage {
  readonly page: Page;

  // Form Fields
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly jobTitleDropdownButton: Locator;
  readonly roleDropdownButton: Locator;
  readonly departmentDropdownButton: Locator;
  readonly teamsPickerButton: Locator;

  // Buttons
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  // Unsaved changes dialog
  readonly unsavedChangesDialog: Locator;
  readonly leaveButton: Locator;
  readonly stayButton: Locator;

  // Validation messages
  readonly emailErrorText: Locator;
  readonly requiredErrorText: Locator;

  constructor(page: Page) {
    this.page = page;

    this.firstNameInput = page.getByRole('textbox', { name: /First Name|John/i });
    this.lastNameInput = page.getByRole('textbox', { name: /Last Name|Doe/i });
    this.emailInput = page.getByRole('textbox', { name: /Email/i });
    this.phoneInput = page.getByRole('textbox', { name: /Phone/i });

    this.jobTitleDropdownButton = page.getByRole('button', { name: /Job Title|Select Job Title|Application Officer|Business Developer|Content Lead|Frontend Dev/i });
    this.roleDropdownButton = page.getByRole('button', { name: /Administrator|Author|Learner|Manager|Role/i });
    this.departmentDropdownButton = page.getByRole('button', { name: /Department|Select Department|Sales|Marketing|Finance/i });
    this.teamsPickerButton = page.getByRole('button', { name: /Teams|Select Teams/i });

    this.saveButton = page.getByRole('button', { name: /Save Changes|Save|Update User/i });
    this.cancelButton = page.getByRole('button', { name: /Cancel/i });

    this.unsavedChangesDialog = page.getByRole('dialog').filter({ hasText: /Unsaved changes/i });
    this.leaveButton = page.getByRole('button', { name: /Leave|Discard/i });
    this.stayButton = page.getByRole('button', { name: /Stay|Keep Editing/i });

    this.emailErrorText = page.getByText(/Enter a valid email address|Email already in use/i);
    this.requiredErrorText = page.getByText(/is required|cannot be empty/i);
  }

  async updateFirstName(name: string) {
    await this.firstNameInput.fill(name);
  }

  async updateLastName(name: string) {
    await this.lastNameInput.fill(name);
  }

  async updatePhone(phone: string) {
    await this.phoneInput.fill(phone);
  }

  async selectJobTitle(title?: string) {
    await this.jobTitleDropdownButton.first().click();
    await this.page.waitForTimeout(300);
    const options = this.page.getByRole('listitem').or(this.page.getByRole('option'));
    if (title) {
      const match = options.filter({ hasText: new RegExp(title, 'i') }).first();
      if (await match.isVisible().catch(() => false)) {
        await match.click();
        return;
      }
    }
    await options.first().click();
  }

  async selectRole(role?: string) {
    await this.roleDropdownButton.first().click();
    await this.page.waitForTimeout(300);
    const options = this.page.getByRole('listitem').or(this.page.getByRole('option'));
    if (role) {
      const match = options.filter({ hasText: new RegExp(role, 'i') }).first();
      if (await match.isVisible().catch(() => false)) {
        await match.click();
        return;
      }
    }
    await options.first().click();
  }

  async selectDepartment(deptName: string) {
    await this.departmentDropdownButton.click();
    await this.page.getByRole('listitem').filter({ hasText: deptName }).or(this.page.getByText(deptName, { exact: true })).click();
  }

  async clickSave() {
    await this.saveButton.click();
  }

  async clickCancel() {
    await this.cancelButton.click();
  }
}
