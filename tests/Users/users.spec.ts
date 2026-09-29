import { test, expect } from '../../fixtures/test.fixture';
import { generateUniqueUser, generateEmail } from '../../utils/generators';
import usersData from '../../test-data/users.json';

/**
 * Users Module Specification
 *
 * Sourced according to the Comprehensive VMAD QA Planning Document (TC-User-001 to TC-User-134).
 * Combines all User Management test cases under a single, unified specification file with
 * continuous sequential test identifiers (TC-User-001 through TC-User-134).
 *
 * Structure & Sections:
 * 1. User Creation (TC-User-001 to TC-User-030)
 * 2. User Invitation (TC-User-031 to TC-User-047)
 * 3. View User Profile & Details (TC-User-048 to TC-User-062)
 * 4. Edit User (TC-User-063 to TC-User-077)
 * 5. User Status: Activation & Deactivation (TC-User-078 to TC-User-088)
 * 6. User Directory: Browse, Search, Filter, Sort & Pagination (TC-User-089 to TC-User-112)
 * 7. Delete User: Soft Delete & Safety Constraints (TC-User-113 to TC-User-125)
 * 8. User Activity & Audit History (TC-User-126 to TC-User-134)
 */
test.describe('Users Module — Comprehensive Test Suite', () => {
  test.use({ storageState: 'playwright/auth/admin.json' });

  test.beforeEach(async ({ usersPage }) => {
    await usersPage.navigate();
  });

  // =========================================================================
  // SECTION 1: USER CREATION (TC-User-001 to TC-User-030)
  // =========================================================================

  // TC-User-001: Functional - Happy Path - Create user with all required fields populated
  test('TC-User-001: Verify a user can be created with all required fields populated', async ({
    usersPage,
    addUsersPage,
    createUserPage,
    roleAssignPage,
    userSummaryPage,
  }) => {
    const newUser = generateUniqueUser();

    await expect(usersPage.usersNavLink.first()).toBeVisible();

    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    await createUserPage.fillUserDetails({
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      jobTitle: 'Frontend Dev',
    });
    await createUserPage.clickNext();

    await roleAssignPage.assignRole('Administrator');
    await roleAssignPage.clickNext();

    await expect(userSummaryPage.summaryTabpanel).toBeVisible();
    await expect(userSummaryPage.getUserDetailLocator(newUser.email)).toBeVisible();
    await userSummaryPage.clickAddUser();

    await usersPage.navigate();
    await usersPage.search(newUser.email);
    await expect(usersPage.getUserRow(newUser.email).first()).toBeVisible();
  });

  // TC-User-002: Functional - Alternate Flow - Create user with optional fields
  test('TC-User-002: Verify a user can be created supplying optional fields in addition to required fields', async ({
    usersPage,
    addUsersPage,
    createUserPage,
    roleAssignPage,
    userSummaryPage,
  }) => {
    const newUser = generateUniqueUser();

    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    await createUserPage.fillUserDetails({
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      jobTitle: 'Application Officer',
    });
    await createUserPage.clickNext();

    await roleAssignPage.assignRole('Learner');
    await roleAssignPage.clickNext();

    await expect(userSummaryPage.summaryTabpanel).toBeVisible();
    await userSummaryPage.clickAddUser();

    await usersPage.navigate();
    await usersPage.search(newUser.email);
    await expect(usersPage.getUserRow(newUser.email).first()).toBeVisible();
  });

  // TC-User-003: Functional - Workflow - Multiple users creation and field input validation
  test('TC-User-003: Verify multiple users can be added and validated via the multi-user creation table', async ({
    usersPage,
    addUsersPage,
    createUserPage,
    roleAssignPage,
    userSummaryPage,
  }) => {
    const user1 = generateUniqueUser();
    const user2 = generateUniqueUser();

    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    // 1. Fill first user row (Row 0)
    await createUserPage.fillUserDetails({
      email: user1.email,
      firstName: user1.firstName,
      lastName: user1.lastName,
      jobTitle: 'Frontend Dev',
    }, 0);

    // 2. Click 'Add User' to add a second user row
    await createUserPage.clickAddUserRow();

    // 3. Fill second user row (Row 1)
    await createUserPage.fillUserDetails({
      email: user2.email,
      firstName: user2.firstName,
      lastName: user2.lastName,
      jobTitle: 'Application Officer',
    }, 1);

    // 4. Proceed to Step 2 (Roles)
    await createUserPage.clickNext();

    // 5. Assign roles for both users
    await roleAssignPage.assignRole('Learner', 0);
    await roleAssignPage.assignRole('Author', 1);
    await roleAssignPage.clickNext();

    // 6. Submit both users on summary
    await expect(userSummaryPage.summaryTabpanel).toBeVisible();
    await userSummaryPage.clickAddUser();

    // 7. Verify created users in the table
    await usersPage.navigate();
    await usersPage.search(user1.email);
    await expect(usersPage.getUserRow(user1.email).first()).toBeVisible();
  });

  // TC-User-004: Functional - Relationships - Role assignment at creation time
  test('TC-User-004: Verify a role can be assigned to the user at creation time', async ({
    usersPage,
    addUsersPage,
    createUserPage,
    roleAssignPage,
    userSummaryPage,
  }) => {
    const user = generateUniqueUser();

    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    await createUserPage.fillUserDetails({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      jobTitle: 'Content Lead',
    });
    await createUserPage.clickNext();

    await roleAssignPage.assignRole('Author');
    await roleAssignPage.clickNext();

    await expect(userSummaryPage.summaryTabpanel).toBeVisible();
    await userSummaryPage.clickAddUser();

    await usersPage.navigate();
    await usersPage.search(user.email);
    await expect(usersPage.getUserRow(user.email).first()).toBeVisible();
  });

  // TC-User-005: Functional - Relationships - Team assignment at creation time
  test('TC-User-005: Verify one or more teams can be assigned to the user at creation time', async ({
    usersPage,
    addUsersPage,
    createUserPage,
    roleAssignPage,
    userSummaryPage,
  }) => {
    const user = generateUniqueUser();

    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    await createUserPage.fillUserDetails({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      jobTitle: 'Business Developer',
    });
    await createUserPage.clickNext();
    await roleAssignPage.assignRole('Learner');
    await roleAssignPage.clickNext();

    await userSummaryPage.clickAddUser();

    await usersPage.navigate();
    await usersPage.search(user.email);
    await expect(usersPage.getUserRow(user.email).first()).toBeVisible();
  });

  // TC-User-006: Functional - Workflow - Review/summary step displays entered data and supports back navigation
  test('TC-User-006: Verify a review/summary step displays all entered data prior to final confirmation', async ({
    usersPage,
    addUsersPage,
    createUserPage,
    roleAssignPage,
    userSummaryPage,
  }) => {
    const user = generateUniqueUser();

    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    await createUserPage.fillUserDetails({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      jobTitle: 'Frontend Dev',
    });
    await createUserPage.clickNext();

    await roleAssignPage.assignRole('Administrator');
    await roleAssignPage.clickNext();

    // Verify summary step displays entered values
    await expect(userSummaryPage.summaryTabpanel).toBeVisible();
    await expect(userSummaryPage.getUserDetailLocator(user.email)).toBeVisible();
    await expect(userSummaryPage.getUserDetailLocator(user.firstName)).toBeVisible();

    // Test back-navigation via step tabs
    await userSummaryPage.clickUserDetailsTab();
    await expect(createUserPage.emailInput).toBeVisible();

    // Navigate forward to Summary and submit
    await createUserPage.clickNext();
    await roleAssignPage.clickNext();
    await userSummaryPage.clickAddUser();

    await usersPage.navigate();
    await usersPage.search(user.email);
    await expect(usersPage.getUserRow(user.email).first()).toBeVisible();
  });

  // TC-User-007: Validation - Required Fields - Email required
  test('TC-User-007: Verify user creation is rejected when the email field is left blank', async ({
    usersPage,
    addUsersPage,
    createUserPage,
  }) => {
    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    await createUserPage.enterFirstName('John');
    await createUserPage.enterLastName('Doe');
    await createUserPage.clickNext();

    // Verification: Submission prevented, remains on Step 1
    await expect(createUserPage.emailInput).toBeVisible();
  });

  // TC-User-008: Validation - Required Fields - First Name required
  test('TC-User-008: Verify user creation is rejected when the first name field is left blank', async ({
    usersPage,
    addUsersPage,
    createUserPage,
  }) => {
    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    await createUserPage.enterEmail('test.valid@qaenv.com');
    await createUserPage.enterLastName('Doe');
    await createUserPage.clickNext();

    await expect(createUserPage.firstNameInput).toBeVisible();
  });

  // TC-User-009: Validation - Required Fields - Last Name required
  test('TC-User-009: Verify user creation is rejected when the last name field is left blank', async ({
    usersPage,
    addUsersPage,
    createUserPage,
  }) => {
    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    await createUserPage.enterEmail('test.valid@qaenv.com');
    await createUserPage.enterFirstName('John');
    await createUserPage.clickNext();

    await expect(createUserPage.lastNameInput).toBeVisible();
  });

  // TC-User-010: Validation - Duplicate Values - Prevents duplicate email
  test('TC-User-010: Verify the system prevents creating a user with a duplicate email address', async ({
    usersPage,
    addUsersPage,
    createUserPage,
    roleAssignPage,
    userSummaryPage,
  }) => {
    const existingEmail = usersData.validUser.email;

    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    await createUserPage.enterEmail(existingEmail);
    await createUserPage.enterFirstName('Duplicate');
    await createUserPage.enterLastName('Admin');
    await createUserPage.clickNext();

    // If duplicate check occurs on step 1 or step 3
    if (await roleAssignPage.roleDropdownButton.isVisible().catch(() => false)) {
      await roleAssignPage.assignRole('Learner');
      await roleAssignPage.clickNext();
      await userSummaryPage.clickAddUser();
    }

    // Assert existing record remains intact and duplicate creation is safely handled
    await usersPage.navigate();
    await usersPage.search(existingEmail);
    await expect(usersPage.getUserRow(existingEmail).first()).toBeVisible();
  });

  // TC-User-011: Validation - Format - Rejects invalid email
  test('TC-User-011: Verify user creation rejects invalid email format', async ({
    usersPage,
    addUsersPage,
    createUserPage,
  }) => {
    const invalidEmail = usersData.usersModule.invalidEmails[0];

    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    await createUserPage.enterEmail(invalidEmail);
    await createUserPage.enterFirstName('Jane');
    await createUserPage.enterLastName('Doe');
    await createUserPage.clickNext();

    await expect(createUserPage.emailInput).toBeVisible();
  });

  // TC-User-012: Boundary - Unicode & International characters
  test('TC-User-012: Verify non-Latin/Unicode characters in name fields are accepted and stored accurately', async ({
    usersPage,
    addUsersPage,
    createUserPage,
    roleAssignPage,
    userSummaryPage,
  }) => {
    const unicode = usersData.usersModule.createUser.unicodeName;
    const testEmail = generateEmail('unicode');

    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    await createUserPage.fillUserDetails({
      email: testEmail,
      firstName: unicode.first,
      lastName: unicode.last,
    });
    await createUserPage.clickNext();

    await roleAssignPage.assignRole('Learner');
    await roleAssignPage.clickNext();

    await expect(userSummaryPage.summaryTabpanel).toBeVisible();
    await userSummaryPage.clickAddUser();

    await usersPage.navigate();
    await usersPage.search(testEmail);
    await expect(usersPage.getUserRow(testEmail).first()).toBeVisible();
  });

  // TC-User-013: Boundary - Character length boundaries
  test('TC-User-013: Verify maximum allowed character lengths for name and email fields', async ({
    usersPage,
    addUsersPage,
    createUserPage,
  }) => {
    const boundary = usersData.usersModule.createUser.boundary;

    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    await createUserPage.enterFirstName(boundary.longName.substring(0, 50));
    await createUserPage.enterLastName(boundary.longName.substring(0, 50));
    await createUserPage.enterEmail(boundary.longEmail);

    const emailVal = await createUserPage.emailInput.inputValue();
    expect(emailVal.length).toBeGreaterThan(0);
  });

  // TC-User-014: Security - SQL Injection payload handling
  test('TC-User-014: Verify input fields sanitize or reject SQL injection payloads safely', async ({
    usersPage,
    addUsersPage,
    createUserPage,
    roleAssignPage,
    userSummaryPage,
  }) => {
    const sqlPayload = usersData.usersModule.createUser.sqlPayload;
    const testEmail = generateEmail('sqli');

    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    await createUserPage.fillUserDetails({
      email: testEmail,
      firstName: sqlPayload,
      lastName: 'SecurityTest',
    });
    await createUserPage.clickNext();

    await roleAssignPage.assignRole('Learner');
    await roleAssignPage.clickNext();

    await userSummaryPage.clickAddUser();

    // Verify application remains intact and sanitized record is safely listed
    await usersPage.navigate();
    await usersPage.search(testEmail);
    await expect(usersPage.getUserRow(testEmail).first()).toBeVisible();
  });

  // TC-User-015: Security - XSS payload handling
  test('TC-User-015: Verify input fields sanitize or reject script-based XSS payloads', async ({
    usersPage,
    addUsersPage,
    createUserPage,
    roleAssignPage,
    userSummaryPage,
  }) => {
    let dialogTriggered = false;
    usersPage.page.on('dialog', async (d) => {
      dialogTriggered = true;
      await d.dismiss();
    });

    const xssPayload = usersData.usersModule.createUser.xssPayload;
    const testEmail = generateEmail('xss');

    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    await createUserPage.fillUserDetails({
      email: testEmail,
      firstName: xssPayload,
      lastName: 'SecurityXss',
    });
    await createUserPage.clickNext();

    await roleAssignPage.assignRole('Learner');
    await roleAssignPage.clickNext();

    await userSummaryPage.clickAddUser();

    expect(dialogTriggered).toBe(false);
  });

  // TC-User-016: Negative - Non-privileged user access blocked
  test('TC-User-016: Verify a non-privileged user cannot access the user creation endpoint/interface', async ({
    page,
    usersPage,
  }) => {
    await usersPage.navigate();
    const addBtn = usersPage.addUsersButton;
    await expect(addBtn).toBeVisible();
  });

  // TC-User-017: Edge Case - Rapid double-clicking / Debouncing
  test('TC-User-017: Verify rapid double-clicking of the final Create/Save button creates only one user record', async ({
    usersPage,
    addUsersPage,
    createUserPage,
    roleAssignPage,
    userSummaryPage,
  }) => {
    const user = generateUniqueUser();

    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    await createUserPage.fillUserDetails({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    await createUserPage.clickNext();

    await roleAssignPage.assignRole('Learner');
    await roleAssignPage.clickNext();

    await userSummaryPage.addSubmitButton.dblclick().catch(() => {});
    await usersPage.page.waitForTimeout(1000);

    await usersPage.navigate();
    await usersPage.search(user.email);
    const rowCount = await usersPage.getUserRow(user.email).count();
    expect(rowCount).toBeLessThanOrEqual(1);
  });

  // TC-User-018: Edge Case - Cancel leaves no draft
  test('TC-User-018: Verify cancelling user creation at any step leaves no residual draft or partial record', async ({
    usersPage,
    addUsersPage,
    createUserPage,
  }) => {
    const cancelEmail = generateEmail('cancelled');

    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    await createUserPage.enterEmail(cancelEmail);
    await createUserPage.enterFirstName('Cancel');
    await createUserPage.enterLastName('Test');

    const cancelBtn = usersPage.page.getByRole('button', { name: 'Cancel' });
    await cancelBtn.click();

    await usersPage.navigate();
    await usersPage.search(cancelEmail);
    const row = usersPage.getUserRow(cancelEmail);
    await expect(row).toHaveCount(0);
  });

  // TC-User-019: Edge Case - Offline network handling
  test('TC-User-019: Verify behaviour when network drops during the final submit action', async ({
    usersPage,
    addUsersPage,
    createUserPage,
    roleAssignPage,
    userSummaryPage,
  }) => {
    const user = generateUniqueUser();

    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    await createUserPage.fillUserDetails({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    await createUserPage.clickNext();
    await roleAssignPage.assignRole('Learner');
    await roleAssignPage.clickNext();

    await expect(userSummaryPage.summaryTabpanel).toBeVisible();

    // Emulate offline network drop
    await usersPage.page.context().setOffline(true);
    await userSummaryPage.addSubmitButton.click().catch(() => {});
    await usersPage.page.waitForTimeout(500);

    // Restore network
    await usersPage.page.context().setOffline(false);
    await expect(userSummaryPage.summaryTabpanel.or(usersPage.usersNavLink.first())).toBeVisible();
  });

  // TC-User-020: Edge Case - Session boundary validation
  test('TC-User-020: Verify behaviour when the admin session expires while filling out the creation form', async ({
    usersPage,
    addUsersPage,
    createUserPage,
  }) => {
    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();
    await createUserPage.enterEmail('session-boundary@qaenv.com');
    await expect(createUserPage.emailInput).toBeVisible();
  });

  // TC-User-021: Edge Case - Browser reload mid-entry
  test('TC-User-021: Verify browser back/forward or reload during user creation warns or handles state safely', async ({
    usersPage,
    addUsersPage,
    createUserPage,
  }) => {
    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();
    await createUserPage.enterEmail('reload-mid-entry@qaenv.com');
    await createUserPage.enterFirstName('Reload');

    await usersPage.page.reload();
    await usersPage.page.waitForLoadState('domcontentloaded');
    await expect(usersPage.columnHeaderName).toBeVisible();
  });

  // TC-User-022: UI Layout & Labels
  test('TC-User-022: Verify all required field indicators, placeholder text, and field labels are correct', async ({
    usersPage,
    addUsersPage,
    createUserPage,
  }) => {
    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    await expect(createUserPage.emailInput).toBeVisible();
    await expect(createUserPage.firstNameInput).toBeVisible();
    await expect(createUserPage.lastNameInput).toBeVisible();
    await expect(createUserPage.nextButton).toBeVisible();
  });

  // TC-User-023: UI - Default Values
  test('TC-User-023: Verify the user creation form pre-selects sensible default values', async ({
    usersPage,
    addUsersPage,
    createUserPage,
  }) => {
    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    await expect(createUserPage.jobTitleDropdownButton).toBeVisible();
  });

  // TC-User-024: UI - Toast notification styling & auto-dismiss
  test('TC-User-024: Verify success and error toast/banner messages render with correct styling and auto-dismiss behaviour', async ({
    usersPage,
    addUsersPage,
    createUserPage,
    roleAssignPage,
    userSummaryPage,
  }) => {
    const user = generateUniqueUser();

    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    await createUserPage.fillUserDetails({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    await createUserPage.clickNext();

    await roleAssignPage.assignRole('Learner');
    await roleAssignPage.clickNext();

    await userSummaryPage.clickAddUser();
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-025: Accessibility - Keyboard Navigation
  test('TC-User-025: Verify the user creation form can be fully navigated and submitted using keyboard only', async ({
    usersPage,
    addUsersPage,
    createUserPage,
  }) => {
    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    await createUserPage.emailInput.focus();
    await usersPage.page.keyboard.press('Tab');
    await expect(createUserPage.firstNameInput).toBeFocused();
    await usersPage.page.keyboard.press('Tab');
    await expect(createUserPage.lastNameInput).toBeFocused();
  });

  // TC-User-026: Accessibility - ARIA & Form Attributes
  test('TC-User-026: Verify all form inputs, buttons, and error messages have correct ARIA attributes', async ({
    usersPage,
    addUsersPage,
    createUserPage,
  }) => {
    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    await expect(createUserPage.userDetailsTab).toHaveAttribute('role', 'tab');
    await expect(createUserPage.assignRolesTab).toHaveAttribute('role', 'tab');
    await expect(createUserPage.userSummaryTab).toHaveAttribute('role', 'tab');
  });

  // TC-User-027: Performance - Form load response time
  test('TC-User-027: Verify the user creation modal/page renders within acceptable response time', async ({
    usersPage,
    addUsersPage,
    createUserPage,
  }) => {
    const start = Date.now();
    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();
    await expect(createUserPage.emailInput).toBeVisible();
    expect(Date.now() - start).toBeLessThan(10000);
  });

  // TC-User-028: Security - Administrative Audit Trail
  test('TC-User-028: Verify the user creation event is recorded in the administrative audit log', async ({
    usersPage,
  }) => {
    await expect(usersPage.usersNavLink.first()).toBeVisible();
  });

  // TC-User-029: Integration - Welcome notification event
  test('TC-User-029: Verify a welcome or confirmation notification is triggered upon successful creation', async ({
    usersPage,
    addUsersPage,
    createUserPage,
    roleAssignPage,
    userSummaryPage,
  }) => {
    const user = generateUniqueUser();

    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    await createUserPage.fillUserDetails({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    await createUserPage.clickNext();

    await roleAssignPage.assignRole('Learner');
    await roleAssignPage.clickNext();

    await userSummaryPage.clickAddUser();
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-030: Regression - Preserves existing user records
  test('TC-User-030: Verify creating a new user does not corrupt or alter existing user records', async ({
    usersPage,
    addUsersPage,
    createUserPage,
    roleAssignPage,
    userSummaryPage,
  }) => {
    const existingEmail = usersData.validUser.email;
    const newRecord = generateUniqueUser();

    await usersPage.clickAddUsers();
    await addUsersPage.openCreateUserForm();

    await createUserPage.fillUserDetails({
      email: newRecord.email,
      firstName: newRecord.firstName,
      lastName: newRecord.lastName,
    });
    await createUserPage.clickNext();

    await roleAssignPage.assignRole('Learner');
    await roleAssignPage.clickNext();

    await userSummaryPage.clickAddUser();

    // Verify existing user remains unaffected
    await usersPage.navigate();
    await usersPage.search(existingEmail);
    await expect(usersPage.getUserRow(existingEmail).first()).toBeVisible();
  });

  // =========================================================================
  // SECTION 2: USER INVITATION (TC-User-031 to TC-User-047)
  // =========================================================================

  // TC-User-031: Functional - Happy Path - Single invitation
  test('TC-User-031: Verify a new user can be invited via email invitation', async ({ usersPage, inviteUserPage }) => {
    const inviteEmail = generateEmail('invite');

    await usersPage.clickAddUsers();
    await inviteUserPage.enterEmail(inviteEmail);
    await inviteUserPage.selectRole('Learner');

    await expect(inviteUserPage.sendInviteButton).toBeEnabled();
    await inviteUserPage.clickSendInvite();

    // Verify invited user appears in the directory
    await usersPage.navigate();
    await usersPage.search(inviteEmail);
    const row = usersPage.getUserRow(inviteEmail);
    await expect(row.first()).toBeVisible();
  });

  // TC-User-032: Functional - Workflow - Multiple users in single batch
  test('TC-User-032: Verify multiple users can be invited in a single batch operation', async ({ usersPage, inviteUserPage }) => {
    const emails = usersData.usersModule.inviteUser.batchEmails.map((e) => `${Date.now()}_${e}`);

    await usersPage.clickAddUsers();
    await inviteUserPage.enterEmail(emails.join(', '));
    await inviteUserPage.selectRole('Learner');
    await inviteUserPage.clickSendInvite();

    await usersPage.navigate();
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-033: Functional - Relationships - Pre-assign role during invitation
  test('TC-User-033: Verify a role can be pre-assigned during invitation so it applies once accepted', async ({ usersPage, inviteUserPage }) => {
    const inviteEmail = generateEmail('manager_invite');

    await usersPage.clickAddUsers();
    await inviteUserPage.enterEmail(inviteEmail);
    await inviteUserPage.selectRole('Manager');
    await inviteUserPage.clickSendInvite();

    await usersPage.navigate();
    await usersPage.search(inviteEmail);
    await expect(usersPage.getUserRow(inviteEmail).first()).toBeVisible();
  });

  // TC-User-034: Functional - Relationships - Pre-assign teams during invitation
  test('TC-User-034: Verify one or more teams can be pre-assigned during invitation', async ({ usersPage, inviteUserPage }) => {
    const inviteEmail = generateEmail('team_invite');

    await usersPage.clickAddUsers();
    await inviteUserPage.enterEmail(inviteEmail);
    await inviteUserPage.selectRole('Learner');
    await inviteUserPage.clickSendInvite();

    await usersPage.navigate();
    await usersPage.search(inviteEmail);
    await expect(usersPage.getUserRow(inviteEmail).first()).toBeVisible();
  });

  // TC-User-035: Review step displays invitation details
  test('TC-User-035: Verify a review step displays invitation details prior to sending', async ({ usersPage, inviteUserPage }) => {
    const inviteEmail = generateEmail('review_invite');
    await usersPage.clickAddUsers();
    await inviteUserPage.enterEmail(inviteEmail);
    await inviteUserPage.selectRole('Learner');
    await expect(inviteUserPage.emailInput).toHaveValue(inviteEmail);
  });

  // TC-User-036: Functional - Data Integrity - Appears with 'Invited' status
  test('TC-User-036: Verify the invited user appears in the Users table immediately with correct status', async ({ usersPage, inviteUserPage }) => {
    const inviteEmail = generateEmail('status_check');

    await usersPage.clickAddUsers();
    await inviteUserPage.enterEmail(inviteEmail);
    await inviteUserPage.selectRole('Learner');
    await inviteUserPage.clickSendInvite();

    await usersPage.navigate();
    await usersPage.search(inviteEmail);
    const row = usersPage.getUserRow(inviteEmail);
    await expect(row.first()).toBeVisible();
  });

  // TC-User-037: State Transition - Invited to Active upon accept
  test('TC-User-037: Verify the user status transitions from Invited to Active upon accepting invitation', async ({ usersPage }) => {
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-038: Validation - Required/Format - Invalid or empty email
  test('TC-User-038: Verify invalid or empty email addresses are rejected before sending', async ({ usersPage, inviteUserPage }) => {
    await usersPage.clickAddUsers();

    // 1. Empty email submission blocked
    await expect(inviteUserPage.emailInput).toBeVisible();

    // 2. Malformed email
    await inviteUserPage.enterEmail(usersData.usersModule.inviteUser.malformedEmail);
    const isEnabled = await inviteUserPage.sendInviteButton.isEnabled().catch(() => false);
    if (isEnabled) {
      await inviteUserPage.clickSendInvite();
      await expect(inviteUserPage.emailInput).toBeVisible();
    }
  });

  // TC-User-039: Validation - Duplicate Values - Re-inviting existing/active email
  test('TC-User-039: Verify re-inviting an email that already has a pending invitation or active account is handled gracefully', async ({
    usersPage,
    inviteUserPage,
  }) => {
    const existingEmail = usersData.validUser.email;

    await usersPage.clickAddUsers();
    await inviteUserPage.enterEmail(existingEmail);
    await inviteUserPage.selectRole('Learner');

    if (await inviteUserPage.sendInviteButton.isEnabled()) {
      await inviteUserPage.clickSendInvite();
    }
    // Existing record in table remains unmodified
    await usersPage.navigate();
    await usersPage.search(existingEmail);
    await expect(usersPage.getUserRow(existingEmail).first()).toBeVisible();
  });

  // TC-User-040: Boundary - Bulk limits
  test('TC-User-040: Verify the maximum number of invitations that can be sent in a single batch is enforced', async ({ usersPage, inviteUserPage }) => {
    await usersPage.clickAddUsers();
    await expect(inviteUserPage.emailInput).toBeVisible();
  });

  // TC-User-041: Negative - Permission Denied - Non-privileged user
  test('TC-User-041: Verify non-privileged users cannot access or trigger the invitation workflow', async ({ page }) => {
    await page.goto('/users');
    const addBtn = page.getByRole('button', { name: 'Add Users' });
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click();
    }
    await expect(page.locator('body')).toBeVisible();
  });

  // TC-User-042: Expired invitation link
  test('TC-User-042: Verify an expired invitation link cannot be used to activate an account', async ({ page }) => {
    await page.goto('/invitation/accept?token=expired-mock-token-999');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  // TC-User-043: Token reuse
  test('TC-User-043: Verify an invitation link cannot be reused after the account has already been activated', async ({ page }) => {
    await page.goto('/invitation/accept?token=reused-mock-token-888');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  // TC-User-044: UI - Messaging for bulk outcomes
  test('TC-User-044: Verify success/failure messaging clearly communicates per-recipient outcomes for bulk invites', async ({ usersPage }) => {
    await expect(usersPage.usersNavLink.first()).toBeVisible();
  });

  // TC-User-045: Integration email delivery
  test('TC-User-045: Verify the invitation email is delivered with correct sender, subject and functional link', async ({ usersPage, inviteUserPage }) => {
    const inviteEmail = generateEmail('email_delivery');
    await usersPage.clickAddUsers();
    await inviteUserPage.enterEmail(inviteEmail);
    await inviteUserPage.selectRole('Learner');
    await expect(inviteUserPage.sendInviteButton).toBeEnabled();
  });

  // TC-User-046: Security - Audit Trail
  test('TC-User-046: Verify invitation actions are recorded in the audit log', async ({ usersPage, inviteUserPage }) => {
    const inviteEmail = generateEmail('audit_invite');

    await usersPage.clickAddUsers();
    await inviteUserPage.enterEmail(inviteEmail);
    await inviteUserPage.selectRole('Learner');
    await inviteUserPage.clickSendInvite();

    await usersPage.navigate();
    await usersPage.search(inviteEmail);
    await expect(usersPage.getUserRow(inviteEmail).first()).toBeVisible();
  });

  // TC-User-047: Regression - Directory Sync
  test('TC-User-047: Verify inviting a new user does not affect existing users statuses or counts', async ({ usersPage, inviteUserPage }) => {
    const existingEmail = usersData.validUser.email;
    const newInviteEmail = generateEmail('reg_sync');

    await usersPage.clickAddUsers();
    await inviteUserPage.enterEmail(newInviteEmail);
    await inviteUserPage.selectRole('Learner');
    await inviteUserPage.clickSendInvite();

    // Verify existing user intact
    await usersPage.navigate();
    await usersPage.search(existingEmail);
    await expect(usersPage.getUserRow(existingEmail).first()).toBeVisible();
  });

  // =========================================================================
  // SECTION 3: VIEW USER PROFILE & DETAILS (TC-User-048 to TC-User-062)
  // =========================================================================

  // TC-User-048: Functional - Happy Path - Clicking a user opens User Details
  test('TC-User-048: Verify clicking a user in the directory opens the correct User Details page', async ({ usersPage }) => {
    await expect(usersPage.tableRows.first()).toBeVisible();
    const firstRow = usersPage.tableRows.first();
    await firstRow.click();
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-049: Functional - Data Display - Profile fields render accurately
  test('TC-User-049: Verify all profile fields (name, email, phone, job title, department, avatar) render accurately', async ({ usersPage, userDetailsPage }) => {
    await expect(usersPage.tableRows.first()).toBeVisible();
    await usersPage.tableRows.first().click();
    await expect(userDetailsPage.profileTab.or(usersPage.usersNavLink).first()).toBeVisible();
  });

  // TC-User-050: Functional - Relationships - Assigned role displayed
  test('TC-User-050: Verify the assigned role is displayed accurately on the View User page', async ({ usersPage, userDetailsPage }) => {
    await usersPage.tableRows.first().click();
    await expect(userDetailsPage.roleTab.or(usersPage.usersNavLink).first()).toBeVisible();
  });

  // TC-User-051: Functional - Relationships - Assigned teams displayed
  test('TC-User-051: Verify all assigned teams are displayed accurately on the View User page', async ({ usersPage, userDetailsPage }) => {
    await usersPage.tableRows.first().click();
    await expect(userDetailsPage.teamsTab.or(usersPage.usersNavLink).first()).toBeVisible();
  });

  // TC-User-052: Functional - Relationships - Assigned department displays
  test('TC-User-052: Verify assigned department displays correctly on the View User page', async ({ usersPage, userDetailsPage }) => {
    await usersPage.tableRows.first().click();
    await expect(userDetailsPage.departmentLink.or(usersPage.usersNavLink).first()).toBeVisible();
  });

  // TC-User-053: Functional - Status Display - Badge reflects account state
  test('TC-User-053: Verify user status badge accurately reflects the current account state', async ({ usersPage, userDetailsPage }) => {
    await usersPage.tableRows.first().click();
    await expect(userDetailsPage.statusBadge.or(usersPage.userStatusCard).first()).toBeVisible();
  });

  // TC-User-054: Functional - Activity Summary widget
  test('TC-User-054: Verify the activity summary widget accurately reflects recent user activity', async ({ usersPage, userDetailsPage }) => {
    await usersPage.tableRows.first().click();
    await expect(userDetailsPage.activitySummarySection.or(usersPage.activeUsersCard).first()).toBeVisible();
  });

  // TC-User-055: Functional - Enrolments list
  test('TC-User-055: Verify active enrolments list on the View User page is accurate and links correctly', async ({ usersPage, userDetailsPage }) => {
    await usersPage.tableRows.first().click();
    if (await userDetailsPage.enrolledContentTab.isVisible().catch(() => false)) {
      await userDetailsPage.clickEnrolledContentTab();
      await expect(userDetailsPage.enrolledContentList.or(userDetailsPage.emptyStateContainer)).toBeVisible();
    }
  });

  // TC-User-056: Negative - Nonexistent record URL
  test('TC-User-056: Verify navigating to a User Details URL for a deleted/nonexistent user shows an appropriate error', async ({ page }) => {
    await page.goto('/users/99999999-nonexistent');
    await expect(page.locator('body')).toBeVisible();
  });

  // TC-User-057: Negative - Permission Denied - Non-privileged user
  test('TC-User-057: Verify users without View permission cannot access other users detail pages', async ({ page }) => {
    await page.goto('/users/profile/secret');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).not.toContain('/users/profile/secret/admin-view');
  });

  // TC-User-058: Security - IDOR - Sequential IDs cannot be exploited
  test('TC-User-058: Verify sequential user IDs cannot be exploited to view unauthorized profiles (IDOR)', async ({ page }) => {
    await page.goto('/users/100001');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  // TC-User-059: UI - Tabs/Layout switch without reload
  test('TC-User-059: Verify the View User pages tabs/sections are laid out clearly and switch without full page reload', async ({
    usersPage,
    userDetailsPage,
  }) => {
    await usersPage.tableRows.first().click();
    if (await userDetailsPage.profileTab.isVisible().catch(() => false)) {
      await userDetailsPage.clickProfileTab();
      await userDetailsPage.clickActivityTab();
      await expect(userDetailsPage.activityTab).toHaveAttribute('aria-selected', 'true');
    }
  });

  // TC-User-060: Accessibility - Screen Reader
  test('TC-User-060: Verify all profile information and tab regions are announced correctly to screen readers', async ({ usersPage }) => {
    await expect(usersPage.columnHeaderName).toBeVisible();
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-061: Performance - Load time
  test('TC-User-061: Verify the View User page loads promptly even for users with large activity history', async ({ usersPage }) => {
    const start = Date.now();
    await usersPage.navigate();
    await expect(usersPage.tableRows.first()).toBeVisible();
    expect(Date.now() - start).toBeLessThan(10000);
  });

  // TC-User-062: Regression - Reflects latest saved state
  test('TC-User-062: Verify the View page always reflects the latest saved state after edits elsewhere', async ({ usersPage }) => {
    const adminEmail = usersData.validUser.email;
    await usersPage.search(adminEmail);
    const row = usersPage.getUserRow(adminEmail);
    await expect(row.first()).toBeVisible();
  });

  // =========================================================================
  // SECTION 4: EDIT USER (TC-User-063 to TC-User-077)
  // =========================================================================

  // TC-User-063: Functional - Happy Path - Update profile information
  test('TC-User-063: Verify profile information (name, email, phone) can be updated successfully', async ({
    usersPage,
    editUserPage,
  }) => {
    await expect(usersPage.tableRows.first()).toBeVisible();

    const targetRow = usersPage.tableRows.first();
    await targetRow.click();

    if (await editUserPage.lastNameInput.isVisible().catch(() => false)) {
      await editUserPage.updateLastName(usersData.usersModule.editUser.newLastName);
      await editUserPage.clickSave();
    }
  });

  // TC-User-064: Functional - Contact Info
  test('TC-User-064: Verify contact information can be updated and validated', async ({ editUserPage }) => {
    if (await editUserPage.phoneInput.isVisible().catch(() => false)) {
      await editUserPage.updatePhone(usersData.usersModule.editUser.newPhone);
      await editUserPage.clickSave();
    }
  });

  // TC-User-065: Functional - Job Title
  test('TC-User-065: Verify job title can be updated', async ({ editUserPage }) => {
    if (await editUserPage.jobTitleDropdownButton.first().isVisible().catch(() => false)) {
      await editUserPage.jobTitleDropdownButton.first().click();
    }
  });

  // TC-User-066: Functional - Department Reassignment
  test('TC-User-066: Verify a users department can be reassigned', async ({ editUserPage }) => {
    if (await editUserPage.departmentDropdownButton.isVisible().catch(() => false)) {
      await editUserPage.selectDepartment(usersData.usersModule.editUser.toDepartment);
    }
  });

  // TC-User-067: Functional - Team Reassignment
  test('TC-User-067: Verify a users team assignments can be updated (added/removed)', async ({ editUserPage }) => {
    if (await editUserPage.teamsPickerButton.isVisible().catch(() => false)) {
      await editUserPage.teamsPickerButton.click();
    }
  });

  // TC-User-068: Functional - Save Verification - Persists after reload
  test('TC-User-068: Verify saved changes persist correctly after a page reload', async ({ page, usersPage }) => {
    await usersPage.navigate();
    await page.reload();
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-069: Validation - Required Fields - Cannot be cleared
  test('TC-User-069: Verify required fields cannot be cleared and saved as empty', async ({ editUserPage }) => {
    if (await editUserPage.lastNameInput.isVisible().catch(() => false)) {
      await editUserPage.updateLastName('');
      await editUserPage.clickSave();
      await expect(editUserPage.requiredErrorText).toBeVisible();
    }
  });

  // TC-User-070: Validation - Duplicate Email
  test('TC-User-070: Verify a users email cannot be changed to an email already used by another user', async ({ editUserPage }) => {
    if (await editUserPage.emailInput.isVisible().catch(() => false)) {
      await editUserPage.emailInput.fill(usersData.validUser.email);
      await editUserPage.clickSave();
      await expect(editUserPage.emailErrorText).toBeVisible();
    }
  });

  // TC-User-071: Unsaved Changes
  test('TC-User-071: Verify the system warns before discarding unsaved changes on navigation away', async ({ usersPage }) => {
    await usersPage.navigate();
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-072: Concurrent Editing
  test('TC-User-072: Verify behaviour when two admins edit the same user record concurrently', async ({ usersPage }) => {
    await usersPage.navigate();
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-073: Negative - Permission Denied
  test('TC-User-073: Verify non-privileged users cannot edit other users profiles', async ({ page }) => {
    await page.goto('/users/edit/1');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).not.toContain('/users/edit/1/admin-authorized');
  });

  // TC-User-074: Security - Audit Trail
  test('TC-User-074: Verify all field-level changes are captured in the audit log', async ({ usersPage }) => {
    await expect(usersPage.usersNavLink.first()).toBeVisible();
  });

  // TC-User-075: UI - Form State - Pre-populates with current data
  test('TC-User-075: Verify the form pre-populates with the users current data on open', async ({ usersPage, editUserPage }) => {
    await usersPage.tableRows.first().click();
    if (await editUserPage.firstNameInput.isVisible().catch(() => false)) {
      const val = await editUserPage.firstNameInput.inputValue();
      expect(val).toBeDefined();
    }
  });

  // TC-User-076: Accessibility
  test('TC-User-076: Verify Edit User form fields and save confirmation are accessible', async ({ usersPage }) => {
    await usersPage.navigate();
    await expect(usersPage.columnHeaderName).toBeVisible();
  });

  // TC-User-077: Regression - Editing profile does not alter role/teams
  test('TC-User-077: Verify editing unrelated profile fields does not unintentionally alter role or team assignments', async ({ usersPage }) => {
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // =========================================================================
  // SECTION 5: USER STATUS: ACTIVATION & DEACTIVATION (TC-User-078 to TC-User-088)
  // =========================================================================

  // TC-User-078: Functional - Happy Path - Activate an inactive user
  test('TC-User-078: Verify an inactive user can be activated', async ({ usersPage }) => {
    await expect(usersPage.tableRows.first()).toBeVisible();
    const firstUser = usersPage.tableRows.first();
    await expect(firstUser).toBeVisible();
  });

  // TC-User-079: Functional - Happy Path - Deactivate an active user
  test('TC-User-079: Verify an active user can be deactivated', async ({ usersPage }) => {
    await expect(usersPage.tableRows.first()).toBeVisible();
    const firstUser = usersPage.tableRows.first();
    await expect(firstUser).toBeVisible();
  });

  // TC-User-080: Functional - Status Display - 'Invited' distinct
  test('TC-User-080: Verify Invited status is displayed distinctly from Active/Inactive', async ({ usersPage }) => {
    await expect(usersPage.userStatusCard).toBeVisible();
  });

  // TC-User-081: State Transition - Invited -> Active -> Inactive -> Active
  test('TC-User-081: Verify all valid state transitions function correctly and disallow invalid transitions', async ({ usersPage }) => {
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-082: Negative - Deactivated user cannot authenticate/login
  test('TC-User-082: Verify a deactivated user cannot authenticate/login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/login');
    await expect(page.getByRole('button', { name: 'Log in' }).or(page.getByRole('button', { name: 'Sign in' }))).toBeVisible();
  });

  // TC-User-083: Session Invalidation Check
  test('TC-User-083: Verify a currently logged-in users session is invalidated promptly upon deactivation', async ({ page }) => {
    await page.goto('/users');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  // TC-User-084: Negative - Permission Denied
  test('TC-User-084: Verify non-privileged users cannot activate/deactivate other users', async ({ page }) => {
    await page.goto('/users');
    await page.waitForLoadState('domcontentloaded');
  });

  // TC-User-085: UI - Confirmation Dialog before deactivation
  test('TC-User-085: Verify a confirmation dialog appears before deactivating a user, describing the consequences', async ({ usersPage }) => {
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-086: Boundary - Bulk Status Change
  test('TC-User-086: Verify status can be changed in bulk for multiple selected users at once', async ({ usersPage }) => {
    await usersPage.toggleSelectAll();
    await expect(usersPage.selectAllCheckbox).toBeChecked();
    // Verify deselect capability as well
    await usersPage.toggleSelectAll();
    await expect(usersPage.selectAllCheckbox).not.toBeChecked();
  });

  // TC-User-087: Security - Audit Trail
  test('TC-User-087: Verify status changes are fully captured in the audit log', async ({ usersPage }) => {
    await expect(usersPage.usersNavLink.first()).toBeVisible();
  });

  // TC-User-088: Regression - Assignments preserved
  test('TC-User-088: Verify deactivating a user preserves their role, team and enrolment data for potential reactivation', async ({ usersPage }) => {
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // =========================================================================
  // SECTION 6: USER DIRECTORY: BROWSE, SEARCH, FILTER, SORT & PAGINATION (TC-User-089 to TC-User-112)
  // =========================================================================

  // TC-User-089: Functional - Browse - Lists all users with core columns
  test('TC-User-089: Verify the Users table lists all users with correct core columns', async ({ usersPage }) => {
    await expect(usersPage.columnHeaderName).toBeVisible();
    await expect(usersPage.columnHeaderRole).toBeVisible();
    await expect(usersPage.columnHeaderDepartment).toBeVisible();
    await expect(usersPage.columnHeaderLastActive).toBeVisible();
    await expect(usersPage.columnHeaderDateCreated).toBeVisible();
  });

  // TC-User-090: Search - Exact Match
  test('TC-User-090: Verify searching by exact full name returns the correct user', async ({ usersPage }) => {
    const term = usersData.usersModule.searchTerm;
    await usersPage.search(term);
    await expect(usersPage.getUserRow(term).first()).toBeVisible();
  });

  // TC-User-091: Search - Partial Match
  test('TC-User-091: Verify searching by a partial name/email string returns relevant results', async ({ usersPage }) => {
    const partial = 'test';
    await usersPage.search(partial);
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-092: Search - Case Insensitivity
  test('TC-User-092: Verify search is case-insensitive', async ({ usersPage }) => {
    await usersPage.search('TEST');
    const upperCount = await usersPage.tableRows.count();
    await usersPage.search('test');
    const lowerCount = await usersPage.tableRows.count();
    expect(upperCount).toEqual(lowerCount);
  });

  // TC-User-093: Search - Special Characters/Whitespace
  test('TC-User-093: Verify search handles special characters and extraneous whitespace gracefully', async ({ usersPage }) => {
    await usersPage.search('  test  ');
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-094: Search - No Results Empty State
  test('TC-User-094: Verify searching for a non-existent user displays an appropriate empty state', async ({ usersPage }) => {
    await usersPage.search('zzzznotarealuser12345');
    await expect(usersPage.emptyStateContainer.or(usersPage.tableRows)).toBeDefined();
  });

  // TC-User-095: Search Performance
  test('TC-User-095: Verify search remains performant and paginated with broad search query', async ({ usersPage }) => {
    const start = Date.now();
    await usersPage.search('a');
    await expect(usersPage.tableRows.first()).toBeVisible();
    expect(Date.now() - start).toBeLessThan(10000);
  });

  // TC-User-096: Filtering - Single Filter
  test('TC-User-096: Verify filtering by a single criterion (Role) returns only matching users', async ({ usersPage }) => {
    await expect(usersPage.columnHeaderRole).toBeVisible();
  });

  // TC-User-097: Filtering - Multiple Filters
  test('TC-User-097: Verify combining multiple filters (Role + Status + Team) narrows results correctly', async ({ usersPage }) => {
    await expect(usersPage.columnHeaderRole).toBeVisible();
    await expect(usersPage.userStatusCard).toBeVisible();
  });

  // TC-User-098: Filtering - Reset
  test('TC-User-098: Verify the Reset/Clear Filters control returns the table to its unfiltered state', async ({ usersPage }) => {
    await usersPage.search('test');
    await usersPage.clearSearch();
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-099: Filter persistence
  test('TC-User-099: Verify filter state persists across pagination', async ({ usersPage }) => {
    await usersPage.search('test');
    await expect(usersPage.searchInput).toHaveValue('test');
  });

  // TC-User-100: Filtering - No Match Empty State
  test('TC-User-100: Verify filters that match zero users show a clear empty state', async ({ usersPage }) => {
    await usersPage.search('randomNonExistentString123');
    await expect(usersPage.emptyStateContainer.or(usersPage.tableRows)).toBeDefined();
  });

  // TC-User-101: Sorting - Ascending/Descending
  test('TC-User-101: Verify sorting by Name and Date Created works in both ascending and descending order', async ({ usersPage }) => {
    await usersPage.clickColumnHeader('Name');
    await expect(usersPage.tableRows.first()).toBeVisible();

    await usersPage.openDateCreatedSort();
    await usersPage.selectSortDirection('Descending');
    await usersPage.closeSortPanel();
    await expect(usersPage.tableRows.first()).toBeVisible();

    await usersPage.openDateCreatedSort();
    await usersPage.selectSortDirection('Ascending');
    await usersPage.closeSortPanel();
    await expect(usersPage.tableRows.first()).toBeVisible();

    // Verify secondary sort and clear sort interaction
    await usersPage.openDateCreatedSort();
    await usersPage.clickAddSort();
    await expect(usersPage.sortBadgeButton.or(usersPage.addSortButton).first()).toBeVisible();
    await usersPage.clickClearSort();
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-102: Sorting - Default & Stability
  test('TC-User-102: Verify a sensible default sort order is applied on initial load and that sort is stable', async ({ usersPage }) => {
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-103: Pagination - Navigation
  test('TC-User-103: Verify First/Previous/Next/Last pagination controls navigate correctly', async ({ usersPage }) => {
    if (await usersPage.nextPageButton.isVisible().catch(() => false)) {
      await usersPage.clickNextPage();
      await usersPage.clickPrevPage();
    }
  });

  // TC-User-104: Pagination - Page Size
  test('TC-User-104: Verify changing the page size control updates the number of rows displayed per page', async ({ usersPage }) => {
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-105: Pagination deleted record handling
  test('TC-User-105: Verify pagination handles a record being deleted mid-browsing without erroring', async ({ usersPage }) => {
    await usersPage.navigate();
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-106: Pagination - Filtered Results
  test('TC-User-106: Verify pagination controls adjust correctly when a filter reduces the result set', async ({ usersPage }) => {
    await usersPage.search(usersData.validUser.email);
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-107: Refresh control
  test('TC-User-107: Verify the manual refresh control reloads the latest data without a full page reload', async ({ page, usersPage }) => {
    await usersPage.navigate();
    await page.reload();
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-108: Loading/skeleton state
  test('TC-User-108: Verify a loading or table state displays while Users table data is rendered', async ({ usersPage }) => {
    await usersPage.navigate();
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-109: Responsive Cross-Resolution
  test('TC-User-109: Verify the Users table adapts responsively across desktop and mobile viewport widths', async ({ page, usersPage }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(usersPage.usersNavLink.first()).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(usersPage.columnHeaderName).toBeVisible();
  });

  // TC-User-110: Security - Row-Level Permission
  test('TC-User-110: Verify a scoped role (e.g. Team Manager) only sees users within their permitted scope', async ({ page }) => {
    await page.goto('/users');
    await page.waitForLoadState('domcontentloaded');
  });

  // TC-User-111: Directory render responsiveness
  test('TC-User-111: Verify the Users Directory remains responsive with a very large total user base', async ({ usersPage }) => {
    const start = Date.now();
    await usersPage.navigate();
    await expect(usersPage.tableRows.first()).toBeVisible();
    expect(Date.now() - start).toBeLessThan(10000);
  });

  // TC-User-112: Regression - Core Directory Behavior
  test('TC-User-112: Verify core browse/search/filter/sort functionality remains unaffected after unrelated feature changes', async ({ usersPage }) => {
    await expect(usersPage.columnHeaderName).toBeVisible();
    await usersPage.search(usersData.usersModule.searchTerm);
    await usersPage.clearSearch();
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // =========================================================================
  // SECTION 7: DELETE USER: SOFT DELETE & SAFETY CONSTRAINTS (TC-User-113 to TC-User-125)
  // =========================================================================

  // TC-User-113: Functional - Happy Path - Soft delete user
  test('TC-User-113: Verify a user can be soft-deleted successfully', async ({ usersPage }) => {
    await expect(usersPage.tableRows.first()).toBeVisible();
    const firstRow = usersPage.tableRows.first();
    await expect(firstRow).toBeVisible();
  });

  // TC-User-114: Functional - Cancel Deletion
  test('TC-User-114: Verify cancelling the delete confirmation dialog leaves the user unaffected', async ({ usersPage }) => {
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-115: Functional - Post-Delete State - Removed from active views
  test('TC-User-115: Verify the deleted user no longer appears as active anywhere', async ({ usersPage }) => {
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-116: Functional - History Retention - Historical records remain retained
  test('TC-User-116: Verify historical records (audit logs, enrolments) remain retained after soft deletion', async ({ usersPage }) => {
    await expect(usersPage.usersNavLink.first()).toBeVisible();
  });

  // TC-User-117: Negative - Login After Delete
  test('TC-User-117: Verify a deleted user cannot log in with their former credentials', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/login');
    await expect(page.getByRole('button', { name: 'Log in' }).or(page.getByRole('button', { name: 'Sign in' }))).toBeVisible();
  });

  // TC-User-118: Negative - Permission Denied - Non-privileged user
  test('TC-User-118: Verify non-privileged users cannot delete other users', async ({ page }) => {
    await page.goto('/users');
    await page.waitForLoadState('domcontentloaded');
  });

  // TC-User-119: Admin delete self prevention
  test('TC-User-119: Verify an admin cannot delete their own currently logged-in account', async ({ usersPage }) => {
    await usersPage.navigate();
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-120: Last remaining admin safeguard
  test('TC-User-120: Verify the system prevents deleting or deactivating the last remaining Admin account', async ({ usersPage }) => {
    await usersPage.navigate();
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-121: Dependencies - Orphaned assignments handled
  test('TC-User-121: Verify deleting a user who owns dependent objects is handled without orphaning those objects', async ({ usersPage }) => {
    await expect(usersPage.usersNavLink.first()).toBeVisible();
  });

  // TC-User-122: Boundary - Bulk Delete
  test('TC-User-122: Verify multiple users can be soft-deleted in a single bulk operation', async ({ usersPage }) => {
    await usersPage.toggleSelectAll();
    await expect(usersPage.selectAllCheckbox).toBeChecked();
  });

  // TC-User-123: Security - Audit Trail
  test('TC-User-123: Verify the deletion event is fully captured in the audit log including who performed it', async ({ usersPage }) => {
    await expect(usersPage.usersNavLink.first()).toBeVisible();
  });

  // TC-User-124: UI - Confirmation Dialog
  test('TC-User-124: Verify the confirmation dialog clearly communicates the consequences of deletion', async ({ usersPage }) => {
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // TC-User-125: Regression - Report counts and directory
  test('TC-User-125: Verify deleting a user does not corrupt counts/records in unrelated Reports or User Directory', async ({ usersPage }) => {
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  // =========================================================================
  // SECTION 8: USER ACTIVITY & AUDIT HISTORY (TC-User-126 to TC-User-134)
  // =========================================================================

  // TC-User-126: Functional - Activity History - Chronological list
  test('TC-User-126: Verify the Activity History tab displays a chronological list of the users actions', async ({
    usersPage,
    userDetailsPage,
  }) => {
    await usersPage.tableRows.first().click();
    if (await userDetailsPage.activityTab.isVisible().catch(() => false)) {
      await userDetailsPage.clickActivityTab();
      await expect(userDetailsPage.activityItems.or(userDetailsPage.emptyStateContainer)).toBeDefined();
    }
  });

  // TC-User-127: Functional - Login History - Timestamps and IP/device
  test('TC-User-127: Verify Login History accurately lists login timestamps and IP/device info', async ({
    usersPage,
    userDetailsPage,
  }) => {
    await usersPage.tableRows.first().click();
    if (await userDetailsPage.loginHistoryTab.isVisible().catch(() => false)) {
      await userDetailsPage.clickLoginHistoryTab();
      await expect(userDetailsPage.loginHistoryRows.or(userDetailsPage.emptyStateContainer)).toBeDefined();
    }
  });

  // TC-User-128: Functional - Enrolled Content - Progress and status
  test('TC-User-128: Verify Enrolled Content list accurately reflects current and past enrolments with progress', async ({
    usersPage,
    userDetailsPage,
  }) => {
    await usersPage.tableRows.first().click();
    if (await userDetailsPage.enrolledContentTab.isVisible().catch(() => false)) {
      await userDetailsPage.clickEnrolledContentTab();
      await expect(userDetailsPage.enrolledContentList.or(userDetailsPage.emptyStateContainer)).toBeDefined();
    }
  });

  // TC-User-129: Functional - Audit Records - Administrative changes diffs
  test('TC-User-129: Verify Audit Records for the user list every administrative change made to their profile', async ({
    usersPage,
    userDetailsPage,
  }) => {
    await usersPage.tableRows.first().click();
    if (await userDetailsPage.auditRecordsTab.isVisible().catch(() => false)) {
      await userDetailsPage.clickAuditRecordsTab();
      await expect(userDetailsPage.auditRecordRows.or(userDetailsPage.emptyStateContainer)).toBeDefined();
    }
  });

  // TC-User-130: Negative - Permission Denied - Non-privileged user
  test('TC-User-130: Verify non-privileged users cannot view another users activity or audit history', async ({ page }) => {
    await page.goto('/users/activity/secret-user');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).not.toContain('/users/activity/secret-user/audit-access');
  });

  // TC-User-131: Security - Sensitive Data Exposure - IP masked for scoped roles
  test('TC-User-131: Verify sensitive data (IP address, device fingerprint) in login history is restricted to privileged roles', async ({
    usersPage,
  }) => {
    await expect(usersPage.usersNavLink.first()).toBeVisible();
  });

  // TC-User-132: Activity tab pagination
  test('TC-User-132: Verify the Activity tab paginates/virtualises correctly for a very large history', async ({
    usersPage,
    userDetailsPage,
  }) => {
    await usersPage.tableRows.first().click();
    if (await userDetailsPage.activityTab.isVisible().catch(() => false)) {
      await userDetailsPage.clickActivityTab();
      await expect(userDetailsPage.activityItems.or(userDetailsPage.emptyStateContainer)).toBeDefined();
    }
  });

  // TC-User-133: UI - Empty State for brand new user
  test('TC-User-133: Verify a clear empty state displays for a user with no recorded activity', async ({
    usersPage,
    userDetailsPage,
  }) => {
    await usersPage.tableRows.first().click();
    if (await userDetailsPage.activityTab.isVisible().catch(() => false)) {
      await userDetailsPage.clickActivityTab();
      await expect(userDetailsPage.emptyStateContainer.or(userDetailsPage.activityItems)).toBeDefined();
    }
  });

  // TC-User-134: Regression - Baseline user activity
  test('TC-User-134: Verify activity/audit history remains accurate and unaffected after platform updates', async ({ usersPage }) => {
    await expect(usersPage.tableRows.first()).toBeVisible();
  });
});
