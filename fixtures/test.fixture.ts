import { test as base } from '@playwright/test';
import { ManageLoginPage } from '../pages/manage-login.page';
import { SsoLoginPage } from '../pages/sso-login.page';
import { LoginPage } from '../pages/login.page';
import { UsersPage } from '../pages/users.page';
import { AddUsersPage } from '../pages/add-users.page';
import { InviteUserPage } from '../pages/invite-user.page';
import { CreateUserPage } from '../pages/create-user.page';
import { RoleAssignPage } from '../pages/role-assign.page';
import { UserSummaryPage } from '../pages/user-summary.page';
import { UserDetailsPage } from '../pages/user-details.page';
import { EditUserPage } from '../pages/edit-user.page';

type CustomFixtures = {
  manageLoginPage: ManageLoginPage;
  ssoLoginPage: SsoLoginPage;
  loginPage: LoginPage;
  usersPage: UsersPage;
  addUsersPage: AddUsersPage;
  inviteUserPage: InviteUserPage;
  createUserPage: CreateUserPage;
  roleAssignPage: RoleAssignPage;
  userSummaryPage: UserSummaryPage;
  userDetailsPage: UserDetailsPage;
  editUserPage: EditUserPage;
};

export const test = base.extend<CustomFixtures>({
  manageLoginPage: async ({ page }, use) => {
    const manageLoginPage = new ManageLoginPage(page);
    await use(manageLoginPage);
  },
  ssoLoginPage: async ({ page }, use) => {
    const ssoLoginPage = new SsoLoginPage(page);
    await use(ssoLoginPage);
  },
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  usersPage: async ({ page }, use) => {
    const usersPage = new UsersPage(page);
    await use(usersPage);
  },
  addUsersPage: async ({ page }, use) => {
    const addUsersPage = new AddUsersPage(page);
    await use(addUsersPage);
  },
  inviteUserPage: async ({ page }, use) => {
    const inviteUserPage = new InviteUserPage(page);
    await use(inviteUserPage);
  },
  createUserPage: async ({ page }, use) => {
    const createUserPage = new CreateUserPage(page);
    await use(createUserPage);
  },
  roleAssignPage: async ({ page }, use) => {
    const roleAssignPage = new RoleAssignPage(page);
    await use(roleAssignPage);
  },
  userSummaryPage: async ({ page }, use) => {
    const userSummaryPage = new UserSummaryPage(page);
    await use(userSummaryPage);
  },
  userDetailsPage: async ({ page }, use) => {
    const userDetailsPage = new UserDetailsPage(page);
    await use(userDetailsPage);
  },
  editUserPage: async ({ page }, use) => {
    const editUserPage = new EditUserPage(page);
    await use(editUserPage);
  },
});

export { expect } from '@playwright/test';
