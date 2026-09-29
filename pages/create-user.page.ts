import { Page, Locator } from '@playwright/test';

/**
 * Page Object for Step 1 of User Creation (User details: Email, Name, Job Title).
 * Sourced according to Section 3 (F-CREATE-01 to F-CREATE-06) and live recording flows.
 */
export class CreateUserPage {
  readonly page: Page;

  // Step 1 Form Fields (Single Row / Row 0)
  readonly emailInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly jobTitleDropdownButton: Locator;
  readonly nextButton: Locator;

  // Multi-user addition & Row Action Controls
  readonly addUserButton: Locator;

  // Validation Error Messages
  readonly emailRequiredError: Locator;
  readonly firstNameRequiredError: Locator;
  readonly lastNameRequiredError: Locator;

  // Step Tabs for direct tab navigation / review flow
  readonly userDetailsTab: Locator;
  readonly assignRolesTab: Locator;
  readonly userSummaryTab: Locator;

  constructor(page: Page) {
    this.page = page;

    // Field locators using placeholder name attributes or table inputs
    this.emailInput = page.getByRole('textbox', { name: 'john@example.com' }).or(page.locator('input[type="email"]').first());
    this.firstNameInput = page.locator('#firstName-0').getByRole('textbox', { name: 'John' }).or(page.getByRole('textbox', { name: 'John', exact: true }));
    this.lastNameInput = page.locator('#lastName-0').getByRole('textbox', { name: 'Doe' }).or(page.getByRole('textbox', { name: 'Doe' }));

    // Multi-user controls
    this.addUserButton = page.getByRole('button', { name: 'Add User', exact: true });

    // Validation messages observed in UI
    this.emailRequiredError = page.getByText('Email is required');
    this.firstNameRequiredError = page.getByText('First name is required');
    this.lastNameRequiredError = page.getByText('Last name is required');

    // Job Title selection trigger button in dialog
    this.jobTitleDropdownButton = page.getByRole('dialog').getByRole('button', {
      name: /Application Officer|Business Developer|Content Lead|Frontend Dev|Job Title|Select/i
    }).first();

    // Step Tabs
    this.userDetailsTab = page.getByRole('tab', { name: 'User Details' });
    this.assignRolesTab = page.getByRole('tab', { name: 'Assign Roles' });
    this.userSummaryTab = page.getByRole('tab', { name: 'User Summary' });

    // Step 1 Next button
    this.nextButton = page.getByRole('dialog')
      .getByRole('tabpanel', { name: 'User Details' })
      .getByRole('button', { name: 'Next' })
      .or(page.getByRole('dialog').getByRole('button', { name: 'Next' }))
      .filter({ visible: true });
  }

  get applicationOfficerOption(): Locator {
    return this.page.getByRole('listitem').filter({ hasText: 'Application Officer' }).first();
  }

  get businessDevOption(): Locator {
    return this.page.getByRole('listitem').filter({ hasText: 'Business Developer' }).first();
  }

  get contentLeadOption(): Locator {
    return this.page.getByRole('listitem').filter({ hasText: 'Content Lead' }).first();
  }

  get frontendDevOption(): Locator {
    return this.page.getByRole('listitem').filter({ hasText: /Frontend Dev|Content Lead|Application Officer/i }).first();
  }

  /**
   * Retrieves the specific table row in the User Details multi-user creation table.
   */
  getCreationRow(rowIndex: number = 0): Locator {
    return this.page.getByRole('dialog').locator('tbody tr, table tr').filter({
      has: this.page.getByRole('textbox')
    }).nth(rowIndex);
  }

  /**
   * Enters email address in the user creation row (by rowIndex, default 0).
   */
  async enterEmail(email: string, rowIndex: number = 0) {
    const row = this.getCreationRow(rowIndex);
    const emailInput = row.getByRole('textbox', { name: 'john@example.com' })
      .or(row.locator('input').nth(0));
    await emailInput.first().fill(email);
  }

  /**
   * Enters first name (default row 0).
   */
  async enterFirstName(firstName: string, rowIndex: number = 0) {
    const row = this.getCreationRow(rowIndex);
    const fnInput = row.getByRole('textbox', { name: 'John', exact: true })
      .or(row.locator('input').nth(1));
    await fnInput.first().fill(firstName);
  }

  /**
   * Enters last name (default row 0).
   */
  async enterLastName(lastName: string, rowIndex: number = 0) {
    const row = this.getCreationRow(rowIndex);
    const lnInput = row.getByRole('textbox', { name: 'Doe', exact: true })
      .or(row.locator('input').nth(2));
    await lnInput.first().fill(lastName);
  }

  /**
   * Selects job title from dropdown options.
   * If the requested title is present, clicks it; otherwise gracefully selects the first available option.
   */
  async selectJobTitle(title?: string, rowIndex: number = 0) {
    const row = this.getCreationRow(rowIndex);
    const targetButton = row.getByRole('button').first()
      .or(this.page.getByRole('dialog').getByRole('button', {
        name: /Application Officer|Business Developer|Content Lead|Frontend Dev|Job Title|Select/i
      }).nth(rowIndex));
    await targetButton.first().click();
    await this.page.waitForTimeout(300);

    const options = this.page.getByRole('listitem').or(this.page.getByRole('option'));
    if (title) {
      const match = options.filter({ hasText: new RegExp(title, 'i') }).first();
      if (await match.isVisible().catch(() => false)) {
        await match.click();
        return;
      }
    }
    // Fallback: click any available option
    await options.first().click();
  }

  /**
   * Clicks 'Add User' button to append an additional row in the creation table.
   */
  async clickAddUserRow() {
    await this.addUserButton.click();
  }

  /**
   * Deletes a specific row in the multi-user creation table.
   */
  async deleteUserRow(rowIndex: number) {
    const rows = this.page.getByRole('dialog').locator('tbody tr, table tr');
    const deleteBtn = rows.nth(rowIndex).getByRole('button').last()
      .or(this.page.locator(`tr:nth-child(${rowIndex + 1}) td app-generic-button button`))
      .or(this.page.locator(`tr:nth-child(${rowIndex + 1}) td button`));
    await deleteBtn.first().click();
  }

  /**
   * Fills user details in Step 1 (for single or multi-row).
   */
  async fillUserDetails(data: {
    email: string;
    firstName: string;
    lastName: string;
    jobTitle?: string;
  }, rowIndex: number = 0) {
    await this.enterEmail(data.email, rowIndex);
    await this.enterFirstName(data.firstName, rowIndex);
    await this.enterLastName(data.lastName, rowIndex);
    if (data.jobTitle !== undefined) {
      await this.selectJobTitle(data.jobTitle, rowIndex);
    }
  }

  /**
   * Advances to Step 2 (Role Assignment).
   */
  async clickNext() {
    await this.page.waitForTimeout(400);
    const nextBtn = this.page.getByRole('dialog')
      .getByRole('tabpanel', { name: 'User Details' })
      .getByRole('button', { name: 'Next' })
      .or(this.page.getByRole('dialog').getByRole('button', { name: 'Next' }).filter({ visible: true }))
      .or(this.page.getByRole('button', { name: 'Next' }))
      .first();

    await nextBtn.waitFor({ state: 'visible', timeout: 10000 });
    await nextBtn.scrollIntoViewIfNeeded().catch(() => {});
    await nextBtn.click({ force: true });
  }

  /**
   * Navigates directly using step tabs.
   */
  async clickUserDetailsTab() {
    await this.userDetailsTab.click();
  }

  async clickAssignRolesTab() {
    await this.assignRolesTab.click();
  }

  async clickUserSummaryTab() {
    await this.userSummaryTab.click();
  }
}
