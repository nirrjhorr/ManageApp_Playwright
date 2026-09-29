/**
 * Test data generators for Users module.
 * Provides runtime uniqueness to prevent test data collision (e.g. unique emails).
 * Sourced according to Section 7 and Section 10 of the Stage 1 Coverage Plan.
 */

export interface UniqueUserData {
  email: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  role: string;
}

/**
 * Generates a unique email address using timestamp and random digits.
 * Example: autotest+17263300001234@qaenv.com
 */
export function generateEmail(prefix: string = 'autotest'): string {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000);
  return `${prefix}${timestamp}${randomSuffix}@qaenv.com`;
}

/**
 * Generates unique user profile data for creation flows.
 * Uses deterministic default values for non-unique fields and runtime unique email.
 */
export function generateUniqueUser(overrides: Partial<UniqueUserData> = {}): UniqueUserData {
  return {
    email: generateEmail(),
    firstName: 'Autotest',
    lastName: 'User',
    jobTitle: 'Frontend Dev',
    role: 'Administrator',
    ...overrides,
  };
}
