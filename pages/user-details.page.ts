import { Page, Locator } from '@playwright/test';

/**
 * Page Object for User Details view (/users/:id or profile detail view).
 * Covers profile view, assigned role/teams/department, status badges, activity, and security/learning tabs.
 */
export class UserDetailsPage {
  readonly page: Page;

  // Header and Profile fields
  readonly pageHeading: Locator;
  readonly userNameHeading: Locator;
  readonly userEmailText: Locator;
  readonly userPhoneText: Locator;
  readonly userJobTitleText: Locator;
  readonly userDepartmentText: Locator;
  readonly statusBadge: Locator;
  readonly avatarImage: Locator;

  // Navigation Links to related entities & sub-modules
  readonly roleLink: Locator;
  readonly teamLinks: Locator;
  readonly departmentLink: Locator;
  readonly learningLink: Locator;
  readonly securityLink: Locator;

  // Overview Action Buttons
  readonly viewProfileButton: Locator;
  readonly resetPasswordButton: Locator;

  // Tabs
  readonly profileTab: Locator;
  readonly roleTab: Locator;
  readonly teamsTab: Locator;
  readonly activityTab: Locator;
  readonly enrolledContentTab: Locator;
  readonly auditRecordsTab: Locator;
  readonly loginHistoryTab: Locator;

  // Content sections
  readonly activitySummarySection: Locator;
  readonly activityItems: Locator;
  readonly loginHistoryRows: Locator;
  readonly enrolledContentList: Locator;
  readonly auditRecordRows: Locator;
  readonly emptyStateContainer: Locator;

  constructor(page: Page) {
    this.page = page;

    // Profile metadata
    this.pageHeading = page.getByRole('heading', { level: 1 }).or(page.getByRole('heading', { level: 2 }));
    this.userNameHeading = page.locator('[data-testid="user-name"], .user-profile-name, h2, h3').first();
    this.userEmailText = page.locator('[data-testid="user-email"], .user-profile-email, text=@');
    this.userPhoneText = page.locator('[data-testid="user-phone"], .user-profile-phone');
    this.userJobTitleText = page.locator('[data-testid="user-job-title"], .user-profile-title');
    this.userDepartmentText = page.locator('[data-testid="user-department"], .user-profile-department');
    this.statusBadge = page.locator('[data-testid="user-status-badge"], .status-badge, .badge');
    this.avatarImage = page.locator('[data-testid="user-avatar"], img.avatar, .avatar-image');

    // Related links & sub-navigation observed in recording
    this.roleLink = page.locator('[data-testid="role-link"], a[href*="/roles/"]');
    this.teamLinks = page.locator('[data-testid="team-link"], a[href*="/teams/"]');
    this.departmentLink = page.locator('[data-testid="dept-link"], a[href*="/departments/"]');
    this.learningLink = page.getByRole('link', { name: 'Learning' });
    this.securityLink = page.getByRole('link', { name: 'Security' });

    // Overview actions
    this.viewProfileButton = page.getByRole('button', { name: 'View Profile' });
    this.resetPasswordButton = page.getByRole('button', { name: 'Reset Password' });

    // Tabs
    this.profileTab = page.getByRole('tab', { name: /Profile/i });
    this.roleTab = page.getByRole('tab', { name: /Role/i });
    this.teamsTab = page.getByRole('tab', { name: /Teams/i });
    this.activityTab = page.getByRole('tab', { name: /Activity/i });
    this.enrolledContentTab = page.getByRole('tab', { name: /Enrolled Content|Enrolments/i });
    this.auditRecordsTab = page.getByRole('tab', { name: /Audit Records|Logs/i });
    this.loginHistoryTab = page.getByRole('tab', { name: /Login History/i });

    // Sections & items
    this.activitySummarySection = page.locator('[data-testid="activity-summary"], .activity-summary');
    this.activityItems = page.locator('[data-testid="activity-item"], .activity-timeline-item, .activity-row');
    this.loginHistoryRows = page.locator('[data-testid="login-history-row"], .login-history-table tbody tr');
    this.enrolledContentList = page.locator('[data-testid="enrolment-item"], .enrolment-card, .enrolled-course-item');
    this.auditRecordRows = page.locator('[data-testid="audit-record-row"], .audit-table tbody tr');
    this.emptyStateContainer = page.getByText(/No activity recorded yet|No records found|No enrolments/i);
  }

  /**
   * Navigates directly to a user's details view by ID.
   */
  async navigateToUser(userId: string | number) {
    await this.page.goto(`/users/${userId}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async clickProfileTab() {
    await this.profileTab.click();
  }

  async clickRoleTab() {
    await this.roleTab.click();
  }

  async clickTeamsTab() {
    await this.teamsTab.click();
  }

  async clickActivityTab() {
    await this.activityTab.click();
  }

  async clickEnrolledContentTab() {
    await this.enrolledContentTab.click();
  }

  async clickAuditRecordsTab() {
    await this.auditRecordsTab.click();
  }

  async clickLoginHistoryTab() {
    await this.loginHistoryTab.click();
  }

  async clickLearningLink() {
    await this.learningLink.click();
  }

  async clickSecurityLink() {
    await this.securityLink.click();
  }

  async clickViewProfile() {
    await this.viewProfileButton.click();
  }

  async clickResetPassword() {
    await this.resetPasswordButton.click();
  }
}
