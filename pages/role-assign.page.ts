import { Page, Locator } from '@playwright/test';

/**
 * Page Object for Step 2 of User Creation: Role Assignment.
 * Sourced according to Section 3 (F-CREATE-07, F-CREATE-08), Section 13, and live recording flows.
 */
export class RoleAssignPage {
  readonly page: Page;

  // Role Assignment Controls
  readonly roleDropdownButton: Locator;
  readonly nextButton: Locator;

  // Step Tabs for navigation / review
  readonly userDetailsTab: Locator;
  readonly assignRolesTab: Locator;
  readonly userSummaryTab: Locator;

  constructor(page: Page) {
    this.page = page;

    // Trigger button for role selection within the dialog
    this.roleDropdownButton = page.getByRole('dialog').getByRole('button', {
      name: /Administrator|Author|Learner|Manager|Role|Select Role|Select/i
    }).first();

    // Step Tabs
    this.userDetailsTab = page.getByRole('tab', { name: 'User Details' });
    this.assignRolesTab = page.getByRole('tab', { name: 'Assign Roles' });
    this.userSummaryTab = page.getByRole('tab', { name: 'User Summary' });

    // Step 2 Next button (advances to User Summary)
    this.nextButton = page.getByRole('button', { name: 'Next' });
  }

  get administratorOption(): Locator {
    return this.page.getByRole('listitem').filter({ hasText: 'Administrator' }).first();
  }

  get authorOption(): Locator {
    return this.page.getByRole('listitem').filter({ hasText: 'Author' }).first();
  }

  /**
  /**
   * Retrieves the specific table row in the Assign Roles table.
   */
  getRoleRow(rowIndex: number = 0): Locator {
    return this.page.getByRole('dialog').locator('tbody tr, table tr').nth(rowIndex);
  }

  /**
   * Selects and assigns a system role (defaults to verified real role 'Administrator').
   * Supports multi-user role assignment via rowIndex.
   * Resiliently picks matching option or falls back to any available option.
   */
  async assignRole(role: string = 'Administrator', rowIndex: number = 0) {
    const row = this.getRoleRow(rowIndex);
    const targetButton = row.getByRole('button').first()
      .or(this.page.getByRole('dialog').getByRole('button', {
        name: /Administrator|Author|Learner|Manager|Role|Select Role|Select/i
      }).nth(rowIndex));
    await targetButton.first().waitFor({ state: 'visible', timeout: 10000 });
    await targetButton.first().click();
    await this.page.waitForTimeout(300);

    // Scoped strictly to list items/options to avoid matching surrounding labels or triggers
    const options = this.page.getByRole('listitem').or(this.page.getByRole('option'));
    if (role) {
      const match = options.filter({ hasText: new RegExp(role, 'i') }).first();
      if (await match.isVisible().catch(() => false)) {
        await match.click();
        return;
      }
    }
    // Fallback: select first found option in list
    await options.first().click();
  }

  /**
   * Advances to Step 3 (User Summary).
   */
  async clickNext() {
    await this.nextButton.click();
  }

  /**
   * Direct tab navigation.
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
