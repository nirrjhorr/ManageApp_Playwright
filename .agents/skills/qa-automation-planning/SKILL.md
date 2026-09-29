---
name: qa-automation-planning
description: Create an authoritative, implementation-ready QA automation plan for an application module using Sonnet bird's-eye analysis and the VMAD framework (Validation, Mapping, Assertions, Decision). Planning only; does not write or execute test code.
---

# QA Automation Planning Integrity Skill

## Purpose

Create an authoritative, implementation-ready QA automation plan for each application module.

This skill is **planning only**.

It must NOT write Playwright test scripts, modify automation code, or execute tests.

The output of this skill becomes the source of truth for the later implementation phase.

---

# 1. Planning Inputs

For every module, analyze all available project inputs:

* Test Case CSV
* Locators
* Playwright Codegen-generated code
* Existing automation code
* Existing page objects, fixtures, helpers, and utilities
* Project custom skills
* Playwright Agent capabilities/skills
* Requirements and acceptance criteria
* Existing module documentation
* Previous conversation summaries

Do not ignore an available source without documenting why it was not relevant.

The **test-case Expected Result** must be treated as the primary behavioral oracle unless an explicitly provided requirement supersedes it.

---

# 2. Sonnet — Bird's-Eye Planning

Use **Claude Sonnet** as the primary planning/reasoning model for the module.

Sonnet must first understand the complete module before detailed planning.

Produce a bird's-eye view covering:

* Module boundaries
* Features and sub-features
* Major user journeys
* Critical paths
* Authentication/state dependencies
* Positive scenarios
* Negative scenarios
* Security scenarios
* Reliability scenarios
* Navigation flows
* Cross-feature dependencies
* End-to-end journeys
* Test-data dependencies
* Automation risks
* Coverage gaps
* Requirement ambiguities

Do not jump directly from CSV rows to individual test scripts.

First understand how the test cases relate to the application's actual user journeys.

---

# 3. VMAD Planning Structure

Structure the detailed plan using **VMAD**.

The VMAD plan must establish clear traceability between the source test cases and the eventual automation.

For every relevant scenario, capture:

### V — Validation

What behavior is being validated?

Define:

* Requirement/scenario
* Test Case ID
* Feature
* Sub-feature
* User journey
* Business/system behavior
* Preconditions
* Test data
* Dependencies

### M — Mapping

Map the scenario to the application implementation.

Identify:

* Page/screen
* UI elements
* Locators
* Actions
* Navigation
* API/network interactions where relevant
* Authentication/session state
* Existing codegen patterns
* Existing reusable project components
* Related test cases
* Related E2E flows

### A — Assertions

Define exactly what the eventual automation must verify.

For each Expected Result, identify:

* Positive assertions
* Negative assertions
* State assertions
* URL/navigation assertions
* UI assertions
* Network assertions
* Security assertions
* Session/authentication assertions
* Error/validation assertions
* Alternative acceptable outcomes

Do not write the actual Playwright implementation.

Define the **assertion intent**, not the code.

### D — Decision

Define the test oracle:

* What constitutes PASS?
* What constitutes FAIL?
* What behavior must NOT occur?
* What unexpected behavior must fail the test?
* Are there multiple acceptable outcomes?
* What evidence should be collected if the scenario fails?
* Is the scenario automation-ready?
* Are there unresolved ambiguities?

---

# 4. Succession / PASS-FAIL Integrity

The planning process MUST preserve the following rule:

> **PASS when the expected behavior occurs OR when behavior that must not occur is successfully prevented. FAIL only when the expected contract is violated.**

Never define PASS as simply:

* script completed
* button clicked
* request returned
* page did not crash

unless that behavior is explicitly part of the Expected Result.

## Positive scenario

```text
Expected: Valid credentials authenticate the user.

PASS:
Authentication succeeds and expected destination is reached.

FAIL:
Authentication does not occur or unexpected behavior occurs.
```

## Negative scenario

```text
Expected: Invalid credentials are rejected.

PASS:
Authentication is rejected according to the expected contract.

FAIL:
Authentication succeeds.
```

## Prevention scenario

```text
Expected: XSS payload must NOT execute.

PASS:
Payload does not execute.

FAIL:
Script executes.
```

## Security scenario

```text
Expected: SQL injection must NOT bypass authentication or expose data.

PASS:
Injection is safely handled.

FAIL:
Authentication bypass, database error leakage, or data exposure occurs.
```

This distinction must be explicitly represented in the VMAD Decision section.

---

# 5. Expected Result Decomposition

Do not treat an entire CSV Expected Result as one vague assertion.

Decompose it into independently verifiable behavioral requirements.

For example:

```text
Expected Result:

Submission is blocked.
Validation error appears.
URL remains /login.
No network request is fired.
```

The VMAD plan should produce:

```text
Validation:
Form submission must be prevented.

Assertions:
- Required validation is visible.
- URL remains /login.
- Authentication request does not occur.

Decision:
PASS only when the prohibited submission is successfully prevented
and the documented validation behavior occurs.
```

This decomposition is mandatory for complex test cases.

---

# 6. Negative and "Must Not Happen" Analysis

During planning, explicitly identify every statement containing concepts such as:

* must not
* should not
* blocked
* rejected
* prevented
* no request
* no session
* no redirect
* no crash
* no 500
* no data leakage
* no alert
* no script execution
* no account enumeration
* no duplicate submission

Each must become an explicit planned verification.

Do not allow important negative requirements to disappear into a generic assertion.

---

# 7. Alternative Expected Outcomes

If a test case allows multiple acceptable outcomes, preserve them explicitly.

Example:

```text
Outcome A:
Input is normalized and the operation succeeds.

OR

Outcome B:
Input is rejected with the documented validation error.
```

The plan must define:

```text
PASS = Outcome A OR Outcome B
FAIL = anything outside A/B
```

Do not broaden acceptable outcomes beyond what the source requirement states.

---

# 8. E2E Flow Planning

The planning phase must identify complete end-to-end flows rather than only isolated test cases.

Group related test cases into meaningful journeys.

Example:

```text
Login Entry
    ↓
Credential Validation
    ↓
Authentication
    ↓
Post-Login Navigation
    ↓
Protected Route
    ↓
Session Persistence
```

Identify which test cases validate each stage.

The plan should distinguish:

* Individual test scenarios
* Cross-test dependencies
* Complete E2E flows
* Critical-path coverage

The eventual implementation team must be able to derive E2E automation directly from this plan.

---

# 9. Locator and Codegen Analysis

Review available locators and Codegen-generated code during planning.

Determine:

* Which locators are reliable
* Which locators are fragile
* Which elements lack stable locators
* Which existing locators can be reused
* Which Codegen patterns should be retained
* Which Codegen output should NOT be copied directly
* Where locator improvements are required

Do not write replacement code.

Record locator recommendations in the VMAD Mapping section.

---

# 10. Existing Automation Analysis

Review existing automation before proposing new coverage.

Identify:

* Existing tests
* Existing page objects
* Existing fixtures
* Existing helpers
* Existing assertions
* Existing duplicated flows
* Existing gaps
* Incorrect PASS/FAIL logic
* Tests that appear to pass without validating the Expected Result

The planning output should clearly identify what can be reused versus what requires redesign.

---

# 11. Custom Skills and Playwright Agents

Identify which project custom skills and Playwright Agent capabilities are relevant to each planned scenario.

Document:

```text
Scenario
→ Required Skill
→ Required Agent Capability
→ Planned Usage
```

Do not execute the implementation during this planning phase.

The purpose is to give the later implementation model an explicit execution blueprint.

---

# 12. Coverage Model

Produce a coverage matrix containing at minimum:

| Test Case | Feature | VMAD Mapping | E2E Flow | Assertion Coverage | Automation Readiness | Gap |
| --------- | ------- | ------------ | -------- | ------------------ | -------------------- | --- |

Identify:

* Covered scenarios
* Partially covered scenarios
* Uncovered scenarios
* Duplicate coverage
* Missing assertions
* Missing locators
* Missing test data
* Environment dependencies
* Requirement gaps

Coverage must measure **behavioral coverage**, not merely the number of automated CSV rows.

---

# 13. Planning Deliverable

The final planning document must contain:

## A. Executive Overview

High-level understanding of the module.

## B. Sonnet Bird's-Eye Analysis

Module architecture, journeys, risks, dependencies, and critical paths.

## C. VMAD Plan

Detailed Validation, Mapping, Assertions, and Decision definitions.

## D. Test Case Traceability

CSV test case → planned automation behavior.

## E. E2E Flow Map

Test cases grouped into complete user journeys.

## F. Locator Map

Required UI elements and locator recommendations.

## G. Assertion Oracle

Explicit PASS/FAIL rules for every scenario.

## H. Coverage Matrix

Covered, partial, missing, and blocked areas.

## I. Risks and Ambiguities

Anything preventing reliable automation.

## J. Implementation Handoff

Clear instructions for the later implementation model.

This section should tell the implementation phase exactly what must be built, without actually building it.

---

# 14. Implementation Boundary

This skill MUST stop after producing the planning artifacts.

It must NOT:

* Write Playwright tests
* Rewrite test files
* Execute Playwright
* Run browsers
* Run test cases
* Modify application code
* Modify automation code
* Start parallel execution
* Start any test execution

The later implementation phase will consume this planning output.

---

# 15. Planning Quality Gate

Before finalizing the plan, verify:

* [ ] All relevant CSV test cases were analyzed.
* [ ] Expected Results were decomposed into behaviors.
* [ ] Positive behaviors are identified.
* [ ] "Must not happen" behaviors are explicitly identified.
* [ ] PASS/FAIL decisions are defined.
* [ ] Negative tests correctly treat successful prevention as PASS.
* [ ] Alternative acceptable outcomes are explicitly defined.
* [ ] Sonnet bird's-eye analysis is complete.
* [ ] VMAD mapping is complete.
* [ ] Locators were reviewed.
* [ ] Codegen output was reviewed.
* [ ] Existing automation was considered.
* [ ] Relevant custom skills were identified.
* [ ] Relevant Playwright Agent capabilities were identified.
* [ ] E2E flows are mapped.
* [ ] Coverage gaps are documented.
* [ ] Ambiguities are documented.
* [ ] Implementation handoff is complete.
* [ ] No test execution occurred.

---

# Governing Principle

**Understand the whole module first.**

**Use Sonnet for the bird's-eye analysis.**

**Use VMAD for detailed planning.**

**Treat the Expected Result as the behavioral oracle.**

**Plan both what must happen and what must not happen.**

**Successful prevention is a PASS.**

**A forbidden behavior occurring is a FAIL.**

**Define the assertion intent before writing the automation.**

**Produce an implementation-ready plan, but do not implement or execute it.**
