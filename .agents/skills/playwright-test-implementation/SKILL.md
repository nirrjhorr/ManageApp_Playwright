---
name: playwright-test-implementation
description: Convert approved VMAD QA planning documents into production-quality Playwright test scripts, page objects, and fixtures without running tests autonomously. Follows strict human-controlled execution boundaries.
---

# Playwright Test Implementation Skill

## Purpose

Convert an approved QA planning document into production-quality Playwright test automation.

This skill is responsible for:

* Writing test scripts
* Structuring test files
* Creating or updating page objects
* Using locators
* Using Playwright Agents
* Using project custom skills
* Implementing planned assertions
* Implementing E2E flows
* Adding useful comments
* Reviewing generated code
* Making implementation-only improvements

This skill is **NOT responsible for executing tests**.

---

# 1. Required Inputs

Before writing any test, consume the approved planning artifacts:

1. VMAD planning document
2. Sonnet bird's-eye analysis
3. Test Case CSV
4. Locator inventory
5. Playwright Codegen-generated code
6. Existing Playwright tests
7. Existing page objects/fixtures/helpers
8. Project custom skills
9. Playwright Agent capabilities
10. Existing conversation/module summary

The approved VMAD plan is the primary implementation contract.

Do not independently redesign the test strategy when the plan already defines the behavior.

---

# 2. Implementation Flow

Follow this sequence:

```text
Approved VMAD Plan
        ↓
Understand E2E Flows
        ↓
Map Test Cases
        ↓
Inspect Existing Automation
        ↓
Inspect Locators / Codegen
        ↓
Apply Project Skills
        ↓
Use Playwright Agents
        ↓
Design Test Structure
        ↓
Write Playwright Tests
        ↓
Review Assertions
        ↓
Review Traceability
        ↓
Final Code Review
        ↓
STOP
```

The process MUST stop after code generation and review.

---

# 3. Test Case Traceability

Every generated test must retain the original Test Case ID.

Use a clear relationship:

```text
TC-LG-001
    ↓
login.spec.ts
    ↓
test(...)
    ↓
Expected Result assertions
```

Where multiple test cases contribute to an E2E flow, preserve all relevant IDs.

Do not create anonymous tests that cannot be traced back to the source plan.

---

# 4. Implement the VMAD Assertion Oracle

Translate the VMAD Assertions and Decision sections directly into Playwright assertions.

The implementation must preserve:

> **PASS = expected behavior occurs OR prohibited behavior is successfully prevented.**

Do not implement:

```javascript
action completed = PASS
```

Instead implement the actual behavioral oracle.

For negative scenarios:

```text
Expected:
Authentication must be rejected.

Implementation:
Verify authentication is rejected.

PASS:
Rejected according to the defined contract.

FAIL:
Authentication succeeds.
```

For prevention scenarios:

```text
Expected:
XSS must not execute.

Implementation:
Observe whether execution occurs.

PASS:
No execution.

FAIL:
Execution occurs.
```

---

# 5. Playwright Agents

Use Playwright Agents when they improve implementation accuracy, including for:

* Inspecting the application
* Discovering UI structure
* Validating locator strategies
* Understanding existing flows
* Generating robust interaction patterns
* Identifying reusable page interactions

Agents must work within the approved VMAD plan.

They must not redefine the requirements.

If an Agent discovers a conflict between the application and the plan:

1. Document the conflict.
2. Preserve the planned requirement.
3. Do not silently change the test oracle.

---

# 6. Locator Strategy

Prefer, in order of suitability:

1. Existing project-approved locators
2. Stable semantic/accessibility locators
3. Stable test IDs
4. Stable attributes
5. Other reliable application selectors

Review Codegen-generated selectors rather than blindly copying them.

Avoid unnecessarily fragile selectors such as deeply nested CSS or generated positional selectors.

If no reliable locator exists:

```text
DO NOT invent a fragile locator merely to complete the test.

Document:
- Missing locator
- Element requiring locator improvement
- Recommended locator strategy
```

---

# 7. Test Structure

Follow the existing project's Playwright architecture.

Reuse existing:

* Fixtures
* Page objects
* Helpers
* Authentication state
* Test utilities
* Configuration
* Constants
* Test data patterns

Avoid unnecessary duplication.

A test should generally communicate:

```text
Arrange
    ↓
Act
    ↓
Verify
```

The verification section must represent the VMAD assertion oracle.

---

# 8. E2E Implementation

Implement the complete E2E flows identified by the planning document.

Do not reduce an E2E flow into isolated UI checks merely because they are easier to automate.

Maintain the planned flow:

```text
Entry
 → User Action
 → Application Processing
 → Navigation / State Change
 → Expected State
 → Verification
```

Where appropriate, use shared page objects and fixtures while keeping each test independently understandable.

---

# 9. Comments

Add useful comments for non-obvious behavior.

Comments should explain:

* Why an unusual action is required
* Why a negative assertion exists
* Why a security assertion is important
* Why a network condition is simulated
* Why an alternative outcome is accepted
* Why session/authentication state is checked

Avoid comments that merely repeat the code.

Example:

```javascript
// The login request must NOT be sent for client-side required-field validation.
// This verifies that invalid input is rejected before authentication is attempted.
```

---

# 10. Negative Test Integrity

Never rewrite negative tests into positive tests just to simplify automation.

Examples:

```text
Wrong password
→ Expected rejection
→ PASS when rejected
```

```text
Empty form
→ Expected validation/block
→ PASS when submission is prevented
```

```text
SQL injection
→ Expected safe handling
→ PASS when injection cannot bypass authentication
```

```text
XSS
→ Expected no script execution
→ PASS when script does not execute
```

```text
Protected route
→ Expected redirect
→ PASS when unauthenticated access is prevented
```

The automation must verify the prevention itself.

---

# 11. Alternative Outcomes

When the VMAD plan defines multiple acceptable outcomes, implement them explicitly.

Example:

```text
Valid Outcome A
OR
Valid Outcome B
```

Only those documented outcomes may produce PASS.

Do not use broad assertions such as:

```javascript
expect(page).toBeTruthy();
```

to accept unknown behavior.

---

# 12. Code Review Before Completion

Before finishing implementation, review every generated test for:

### Coverage

* Is the planned scenario implemented?
* Are all important expected behaviors asserted?
* Are "must not happen" conditions asserted?

### Correctness

* Does PASS represent the VMAD Decision?
* Would forbidden behavior cause a failure?
* Are alternative outcomes handled correctly?

### Maintainability

* Are locators stable?
* Is existing project infrastructure reused?
* Is unnecessary duplication avoided?
* Are comments useful?

### Traceability

* Is the Test Case ID present?
* Is the E2E flow identifiable?
* Can the implementation be mapped back to VMAD?

---

# 13. NO AUTONOMOUS TEST EXECUTION

This is a hard boundary.

The AI/model MUST NOT:

* Run Playwright tests automatically
* Run `npm test`
* Run `npx playwright test`
* Run the entire suite
* Run individual tests automatically
* Open browsers for test execution
* Execute tests through Playwright Agents
* Trigger CI
* Trigger test commands through shell/terminal
* Start a test server solely for autonomous test execution

The user will run the tests.

---

# 14. NO AUTONOMOUS ITERATION LOOP

The model MUST NOT perform this cycle autonomously:

```text
Write Test
    ↓
Run Test
    ↓
Observe Failure
    ↓
Modify Test
    ↓
Run Again
    ↓
Modify Again
    ↓
Repeat
```

This is prohibited.

The model may perform **static/code-level review** without execution.

If the user later supplies execution results, logs, screenshots, traces, or failures, the model may use those artifacts to make a requested correction.

That is a new user-directed iteration.

---

# 15. Human-Controlled Iteration

The approved workflow is:

```text
AI writes tests
      ↓
AI reviews code
      ↓
AI STOPS
      ↓
USER RUNS ONE TEST
      ↓
USER PROVIDES RESULT/EVIDENCE IF NEEDED
      ↓
AI ANALYZES RESULT
      ↓
USER REQUESTS CHANGE
      ↓
AI MODIFIES TEST
      ↓
AI STOPS AGAIN
```

The AI must never assume permission to execute the next test.

---

# 16. Single-Test Execution Constraint

When the user later chooses to run tests, the project workflow should use:

```text
ONE TEST CASE
ONE EXECUTION
ONE ACTIVE TEST RUN
```

Do not configure or initiate:

* Parallel test cases
* Multiple workers
* Competing browser sessions
* Multiple simultaneous windows
* Head-to-head execution

The test-generation skill itself must not execute anything.

---

# 17. Implementation Deliverables

For each module, produce:

### Test Files

Production-quality Playwright test scripts following the approved architecture.

### Supporting Code

Only where required:

* Page objects
* Fixtures
* Helpers
* Test data
* Utilities

### Traceability

Test Case ID → test implementation.

### E2E Mapping

E2E flow → participating tests.

### Implementation Notes

Document:

* Important design decisions
* Locator decisions
* Reused project components
* Unresolved issues
* Tests requiring user execution

### Execution Status

Always explicitly state:

```text
Implementation: COMPLETE / INCOMPLETE

Execution:
NOT RUN — USER CONTROLLED
```

Never claim a test passed unless the user has actually provided a valid execution result.

---

# 18. Completion Gate

Before stopping, verify:

* [ ] VMAD plan was followed.
* [ ] Sonnet analysis was considered.
* [ ] Test Case IDs are preserved.
* [ ] Planned E2E flows are implemented.
* [ ] Expected Results became meaningful assertions.
* [ ] Negative scenarios correctly assert prevention/rejection.
* [ ] "Must not happen" behaviors are explicitly checked.
* [ ] Alternative outcomes are implemented correctly.
* [ ] Locators were reviewed.
* [ ] Codegen output was reviewed.
* [ ] Existing automation was reused where appropriate.
* [ ] Project custom skills were applied.
* [ ] Playwright Agents were used where appropriate.
* [ ] Comments explain non-obvious test behavior.
* [ ] Code has been statically reviewed.
* [ ] No tests were executed.
* [ ] No autonomous run/fix/rerun loop occurred.
* [ ] User remains responsible for execution.

---

# Governing Principle

**The plan defines what to build.**

**Playwright Agents and project skills help build it.**

**The implementation must preserve the VMAD behavioral oracle.**

**Write the tests. Review the tests. Then STOP.**

**Never run the tests autonomously.**

**Never enter an autonomous run → fix → rerun loop.**

**Execution and iteration remain explicitly under human control.**
