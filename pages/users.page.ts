import { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Users Listing view (/users).
 * Handles table listing, searching, column sorting, selection, and navigation to Add Users.
 */
export class UsersPage {
  readonly page: Page;

  // Navigation & Actions
  readonly usersNavLink: Locator;
  readonly addUsersButton: Locator;

  // Table Column Headers (L-006 to L-010)
  readonly columnHeaderName: Locator;
  readonly columnHeaderRole: Locator;
  readonly columnHeaderDepartment: Locator;
  readonly columnHeaderLastActive: Locator;
  readonly columnHeaderDateCreated: Locator;

  // Selection & Search
  readonly selectAllCheckbox: Locator;
  readonly searchInput: Locator;

  // Dashboard / Info Cards (L-013, L-014 - resilient to dynamic count values)
  readonly activeUsersCard: Locator;
  readonly userStatusCard: Locator;

  // Sorting Controls (L-016, L-018 to L-023)
  readonly dateCreatedSortButton: Locator;
  readonly sortDirectionAscendingOption: Locator;
  readonly sortDirectionDescendingOption: Locator;
  readonly addSortButton: Locator;
  readonly sortBadgeButton: Locator;
  readonly clearSortButton: Locator;

  // Filtering Controls
  readonly roleFilterButton: Locator;
  readonly statusFilterButton: Locator;
  readonly teamFilterButton: Locator;
  readonly resetFiltersButton: Locator;

  // Pagination Controls
  readonly firstPageButton: Locator;
  readonly prevPageButton: Locator;
  readonly nextPageButton: Locator;
  readonly lastPageButton: Locator;
  readonly pageSizeDropdown: Locator;
  readonly paginationSummaryText: Locator;

  // Modals & Action confirmations
  readonly confirmationDialog: Locator;
  readonly confirmModalButton: Locator;
  readonly cancelModalButton: Locator;

  // Bulk Actions
  readonly bulkActionDropdown: Locator;
  readonly bulkDeactivateOption: Locator;
  readonly bulkActivateOption: Locator;
  readonly bulkDeleteOption: Locator;

  // Table Body & Rows
  readonly tableBody: Locator;
  readonly tableRows: Locator;
  readonly emptyStateContainer: Locator;

  constructor(page: Page) {
    this.page = page;

    // Navigation & Primary CTA
    this.usersNavLink = page.getByRole('link', { name: 'Users', exact: true });
    this.addUsersButton = page.getByRole('button', { name: 'Add Users' });

    // Table Column Headers
    this.columnHeaderName = page.getByRole('columnheader', { name: 'Name' });
    this.columnHeaderRole = page.getByRole('columnheader', { name: 'Role' });
    this.columnHeaderDepartment = page.getByRole('columnheader', { name: 'Department' });
    this.columnHeaderLastActive = page.getByRole('columnheader', { name: 'Last Active' });
    this.columnHeaderDateCreated = page.getByRole('columnheader', { name: 'Date Created' });

    // Selection & Search
    this.selectAllCheckbox = page.locator('#option-all').or(page.getByRole('checkbox', { name: /Select all/i }));
    this.searchInput = page.getByRole('textbox', { name: 'Search' });

    // Dashboard Cards
    this.activeUsersCard = page.getByRole('heading', { name: /Active Users/i }).or(page.getByText(/Active Users/i));
    this.userStatusCard = page.getByRole('heading', { name: /User Status/i }).or(page.getByText(/User Status/i));

    // Sorting Controls
    this.dateCreatedSortButton = page.getByRole('button', { name: 'Date Created' });
    this.sortDirectionAscendingOption = page.getByRole('option', { name: 'Ascending' }).or(page.getByText('Ascending', { exact: true }));
    this.sortDirectionDescendingOption = page.getByRole('option', { name: 'Descending' }).or(page.getByText('Descending', { exact: true }));
    this.addSortButton = page.getByRole('button', { name: 'Add Sort' });
    this.sortBadgeButton = page.getByRole('button', { name: /\d+ sorts/i }).or(page.getByRole('button', { name: 'sorts' }));
    this.clearSortButton = page.getByRole('button', { name: 'Clear Sort' });

    // Filtering Controls
    this.roleFilterButton = page.getByRole('button', { name: /Role Filter|Filter by Role|All Roles/i });
    this.statusFilterButton = page.getByRole('button', { name: /Status Filter|Filter by Status|All Statuses/i });
    this.teamFilterButton = page.getByRole('button', { name: /Team Filter|Filter by Team|All Teams/i });
    this.resetFiltersButton = page.getByRole('button', { name: /Reset Filters|Clear Filters/i });

    // Pagination Controls
    this.firstPageButton = page.getByRole('button', { name: /First Page|First|«/i });
    this.prevPageButton = page.getByRole('button', { name: /Previous Page|Previous|<|‹/i });
    this.nextPageButton = page.getByRole('button', { name: /Next Page|Next|>|›/i });
    this.lastPageButton = page.getByRole('button', { name: /Last Page|Last|»/i });
    this.pageSizeDropdown = page.getByRole('combobox', { name: /Rows per page|Page size|Show/i }).or(page.locator('select[name="pageSize"]'));
    this.paginationSummaryText = page.locator('[data-testid="pagination-summary"], .pagination-info, text=/\\d+ of \\d+/i');

    // Modals
    this.confirmationDialog = page.getByRole('dialog');
    this.confirmModalButton = page.getByRole('button', { name: /Confirm|Yes, Delete|Yes, Deactivate|Activate/i });
    this.cancelModalButton = page.getByRole('button', { name: /Cancel|No, Keep/i });

    // Bulk Actions
    this.bulkActionDropdown = page.getByRole('button', { name: /Bulk Actions|Actions/i });
    this.bulkDeactivateOption = page.getByRole('menuitem', { name: /Deactivate/i }).or(page.getByText(/Bulk Deactivate/i));
    this.bulkActivateOption = page.getByRole('menuitem', { name: /Activate/i }).or(page.getByText(/Bulk Activate/i));
    this.bulkDeleteOption = page.getByRole('menuitem', { name: /Delete/i }).or(page.getByText(/Bulk Delete/i));

    // Table Content
    this.tableBody = page.locator('tbody');
    this.tableRows = page.locator('tbody tr');
    this.emptyStateContainer = page.getByText(/No users found|No users match the selected filters/i);
  }

  /**
   * Navigates directly to the Users management module.
   */
  async navigate() {
    await this.page.goto('/users');
    await this.page.waitForLoadState('domcontentloaded');
    await this.columnHeaderName.or(this.usersNavLink).first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  }

  /**
   * Navigates via the left-hand navigation link.
   */
  async clickUsersNavLink() {
    await this.usersNavLink.click();
  }

  /**
   * Performs user search by entering query into Search box.
   */
  async search(term: string) {
    await this.searchInput.fill(term);
    await this.searchInput.press('Enter').catch(() => {});
    await this.page.waitForTimeout(600);
  }

  /**
   * Clears the active search query.
   */
  async clearSearch() {
    await this.searchInput.fill('');
    await this.searchInput.press('Enter').catch(() => {});
    await this.page.waitForTimeout(600);
  }

  /**
   * Toggles the select all checkbox.
   */
  async toggleSelectAll() {
    await this.selectAllCheckbox.click();
  }

  /**
   * Opens the Date Created sort panel.
   */
  async openDateCreatedSort() {
    await this.dateCreatedSortButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Selects a sort direction ('Ascending' or 'Descending') from the active sort menu.
   */
  async selectSortDirection(direction: 'Ascending' | 'Descending') {
    const directionCombobox = this.page.getByRole('combobox', { name: /Descending|Ascending/i })
      .or(this.page.locator('mat-select').nth(1))
      .or(this.page.locator('.cdk-overlay-pane mat-select').last());
    await directionCombobox.first().click();
    await this.page.waitForTimeout(300);
    const targetOption = this.page.getByRole('option', { name: direction })
      .or(this.page.locator('mat-option').filter({ hasText: direction }));
    await targetOption.first().click();
  }

  /**
   * Closes any open dropdown or sort panel overlay via cdk backdrop.
   */
  async closeSortPanel() {
    const backdrop = this.page.locator('.cdk-overlay-backdrop');
    if (await backdrop.isVisible().catch(() => false)) {
      await backdrop.click();
    }
  }

  /**
   * Clicks 'Add Sort' to append a secondary sort criterion.
   */
  async clickAddSort() {
    await this.addSortButton.click();
  }

  /**
   * Clicks the multi-sort summary badge button (e.g. '2 sorts') to open the sort management panel.
   */
  async openSortBadge() {
    await this.sortBadgeButton.click();
  }

  /**
   * Clears all applied sorts and dismisses overlay.
   */
  async clickClearSort() {
    await this.clearSortButton.click();
    await this.closeSortPanel();
  }

  /**
   * Clicks a specific column header to toggle column sorting.
   */
  async clickColumnHeader(name: 'Name' | 'Role' | 'Department' | 'Last Active' | 'Date Created') {
    const headers = {
      'Name': this.columnHeaderName,
      'Role': this.columnHeaderRole,
      'Department': this.columnHeaderDepartment,
      'Last Active': this.columnHeaderLastActive,
      'Date Created': this.columnHeaderDateCreated,
    };
    await headers[name].click();
  }

  /**
   * Opens the Add Users drawer/dialog.
   */
  async clickAddUsers() {
    await this.addUsersButton.click();
  }

  /**
   * Returns a table row matching specific user identifier (name or email).
   */
  getUserRow(identifier: string): Locator {
    return this.tableRows.filter({ hasText: identifier });
  }

  /**
   * Applies a role filter.
   */
  async applyRoleFilter(role: string) {
    await this.roleFilterButton.click();
    await this.page.getByRole('option', { name: role }).or(this.page.getByText(role, { exact: true })).click();
  }

  /**
   * Applies a status filter.
   */
  async applyStatusFilter(status: 'Active' | 'Inactive' | 'Invited' | string) {
    await this.statusFilterButton.click();
    await this.page.getByRole('option', { name: status }).or(this.page.getByText(status, { exact: true })).click();
  }

  /**
   * Resets all applied filters.
   */
  async resetFilters() {
    await this.resetFiltersButton.click();
  }

  /**
   * Pagination controls.
   */
  async clickNextPage() {
    await this.nextPageButton.click();
  }

  async clickPrevPage() {
    await this.prevPageButton.click();
  }

  async clickFirstPage() {
    await this.firstPageButton.click();
  }

  async clickLastPage() {
    await this.lastPageButton.click();
  }

  async selectPageSize(size: string | number) {
    if (await this.pageSizeDropdown.count() > 0) {
      await this.pageSizeDropdown.selectOption(String(size)).catch(async () => {
        await this.pageSizeDropdown.click();
        await this.page.getByRole('option', { name: String(size) }).click();
      });
    }
  }

  /**
   * Row action menu triggers.
   */
  getUserActionMenuButton(identifier: string): Locator {
    const row = this.getUserRow(identifier);
    return row.locator('#action-select-button').or(row.getByRole('button', { name: /Action|More options|⋯|⋮/i })).or(row.locator('.action-menu-btn'));
  }

  async openRowActionMenu(identifier: string) {
    await this.getUserActionMenuButton(identifier).click();
  }

  async triggerRowAction(identifier: string, action: 'View' | 'Edit' | 'Activate' | 'Deactivate' | 'Delete') {
    await this.openRowActionMenu(identifier);
    await this.page.waitForTimeout(200);
    await this.page.getByRole('menuitem', { name: new RegExp(action, 'i') }).or(this.page.getByText(action, { exact: true })).first().click();
  }

  /**
   * Clicks on the user's name link to navigate directly to their profile overview.
   */
  async clickUserProfile(identifier: string) {
    await this.page.getByRole('link', { name: new RegExp(identifier, 'i') }).first().click();
  }

  /**
   * Confirmation Modal controls.
   */
  async confirmModal() {
    await this.confirmModalButton.click();
  }

  async cancelModal() {
    await this.cancelModalButton.click();
  }
}
