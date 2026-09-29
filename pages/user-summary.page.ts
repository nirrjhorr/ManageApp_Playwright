import { Page, Locator } from '@playwright/test';

/**
 * Page Object for Step 3 of User Creation: User Summary & Final Submission.
 * Sourced according to Section 3 (F-CREATE-09, F-CREATE-10) and Section 14-15 of the Stage 1 plan.
 */
export class UserSummaryPage {
  readonly page: Page;

  // Summary Container and Final Submit Button (L-048, L-049)
  readonly summaryTabpanel: Locator;
  readonly addSubmitButton: Locator;

  // Step Tabs for reviewing and navigating back
  readonly userDetailsTab: Locator;
  readonly assignRolesTab: Locator;
  readonly userSummaryTab: Locator;

  constructor(page: Page) {
    this.page = page;

    // L-048: semantic tabpanel for User Summary
    this.summaryTabpanel = page.getByRole('tabpanel', { name: 'User Summary' });

    // L-049: final Add button scoped directly to the User Summary tabpanel
    this.addSubmitButton = this.summaryTabpanel.getByRole('button', { name: 'Add' });

    // Step Tabs
    this.userDetailsTab = page.getByRole('tab', { name: 'User Details' });
    this.assignRolesTab = page.getByRole('tab', { name: 'Assign Roles' });
    this.userSummaryTab = page.getByRole('tab', { name: 'User Summary' });
  }

  /**
   * Returns a Locator for a specific user detail item inside the summary container.
   */
  getUserDetailLocator(detailText: string): Locator {
    return this.summaryTabpanel.getByText(detailText, { exact: false }).first();
  }

  /**
   * Clicks the final 'Add' button in User Summary to complete user creation.
   */
  async clickAddUser() {
    await this.addSubmitButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.getByRole('dialog').waitFor({ state: 'hidden', timeout: 6000 }).catch(() => {});
    await this.page.waitForTimeout(1000);
  }

  /**
   * Navigates back to User Details or Assign Roles tab.
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
