# QA Release Validation Package — Multi-Case Platform

This document is the meeting-ready QA package for the current multi-case Nomad release.

It is written from the perspective of a QA lead validating business workflow coherence, release readiness, and operational risk across product, design, engineering, and legal/ops.

## 1. Current Product Truth

### What the product now does

- The platform has moved from a single immigrant-level case model to a case-centric model.
- The primary workflow entity is now `cases`, with case-scoped:
  - `case_documents.case_id`
  - `case_payments`
  - `case_events`
  - `assigned_lawyer_user_id`
- The public website now exposes official UGE categories, with Nomad as the only fully detailed category.
- Nomad is split into 3 separate tracks:
  - `Nomad Holder`
  - `Nomad Family`
  - `Nomad Renewal`
- Immigrants work through:
  - `/immigrant/cases`
  - `/immigrant/cases/new`
  - `/immigrant/cases/[id]`
- Lawyers work through:
  - `/lawyer/cases`
  - `/lawyer/cases/[id]`
  - `/lawyer/requests`
  - `/lawyer/documents`
- Legacy routes such as `/immigrant/my-case` and `/lawyer/immigrants*` now redirect into the case-centric flow.
- Lawyer assignment requests are now case-scoped rather than immigrant-scoped.
- Documents are uploaded into a selected case rather than into a generic immigrant record.
- Payment is modeled in-product but is still manual/off-platform.

### What this means for the business

- One immigrant can now hold multiple cases over time or in parallel.
- Holder, Family, and Renewal are meant to be operationally independent, even when linked.
- The business truth the platform is trying to represent is now:
  - one person
  - multiple cases
  - separate status/payment/document ownership per case

## 2. Workflow Incoherences

These are the most important mismatches between the intended business model and the current repo behavior.

### A. Onboarding still lands in a legacy state

What the product now does:
- Signup and Google onboarding still create an immigrant row with legacy `case_status: 'pending'`.
- Onboarding does not create a first case and does not enforce a first-case flow.

What the business expects:
- A new immigrant should understand exactly how to begin the first real case.

Where they diverge:
- The platform is case-centric, but the onboarding state still starts from an immigrant-centric legacy field.
- This creates ambiguity immediately after signup:
  - is the immigrant “in a case” already?
  - should they create a case?
  - is an empty dashboard a valid first experience?

QA assessment:
- Hard blocker.
- This is a `P1` business-truth mismatch and can become a `P0` if users dead-end or support has no consistent answer.

### B. Admin still manages immigrant-level workflow instead of case-level workflow

What the product now does:
- Admin immigrant management still edits:
  - `immigrants.case_status`
  - `immigrants.assigned_lawyer_id`
- New user-facing flows read from:
  - `cases.stage`
  - `cases.assigned_lawyer_user_id`

What the business expects:
- Admin operations should be able to see and control the same workflow truth that users and lawyers see.

Where they diverge:
- Admin can currently change legacy fields that no longer drive the canonical user flow.
- This can create a false sense that admin has updated a case when the actual case UI remains unchanged.

QA assessment:
- Hard blocker.
- `P1` by default, potentially `P0` if support/admin actions create conflicting records or incorrect legal operations.

### C. Operational documentation still reflects the old single-case model

What the product now does:
- README still documents:
  - `immigrants.case_status`
  - `assigned_lawyer_id`
  - old routes and old data ownership assumptions
- The actual product now uses the multi-case model.

What the business expects:
- Engineering, QA, support, and ops should validate and operate against one source of truth.

Where they diverge:
- The product changed, but setup/ops/schema documentation still describes the previous model.

QA assessment:
- Hard blocker.
- `P1` operational risk.

### D. Legacy surfaces still exist and increase regression ambiguity

What the product now does:
- Some legacy components/pages still exist in the codebase, even where redirects now point elsewhere.

What the business expects:
- One canonical user path and one canonical support explanation.

Where they diverge:
- QA and support can still encounter references to older concepts like immigrant-level case status.

QA assessment:
- `P2` today, but it becomes more serious if internal teams act on the wrong surface.

## 3. Release Gate

The current multi-case Nomad release should be treated as **not release-ready** until the following gates pass or are explicitly accepted by leadership.

### Gate 1 — Onboarding Pass

Pass criteria:
- A new immigrant is routed into a clear first-case path.
- There is no dead end after signup or Google onboarding.
- UX copy makes the next action obvious.
- Support can answer “What does a new immigrant do first?” with a single, unambiguous instruction.

Fail conditions:
- New user lands in a mixed legacy/case state.
- Dashboard implies a case exists when no real case exists.
- Multiple teams give different answers about the first step.

### Gate 2 — Admin Pass

Pass criteria:
- Admin controls operate on case-level truth, or legacy admin actions are explicitly restricted and documented.
- Admin can inspect cases, linked cases, assignment state, documents, and timeline without relying on obsolete immigrant-level workflow fields.

Fail conditions:
- Admin edits legacy fields while user-visible case truth remains unchanged.
- Support/admin believe they updated a case but only changed obsolete data.

### Gate 3 — Documentation Pass

Pass criteria:
- README/setup/schema/runbook/support documentation reflects the case-centric product model.
- The same language is used across QA, engineering, and operations.

Fail conditions:
- Documentation still describes the previous single-case model as current truth.

### Gate 4 — Security and Data Pass

Pass criteria:
- Case-scoped RLS works for documents, notes, payments, events, and lawyer requests.
- Request uniqueness is enforced per case.
- Linked/source case integrity behaves as intended.
- Legacy migration/backfill preserves historical data on the migrated legacy case.

Fail conditions:
- Cross-case leakage
- cross-user leakage
- broken case linkage
- conflicting request/assignment state

## 4. Validation Matrix

Validation should be executed by business scenario, not by page list.

### Scenario 1 — New immigrant starts the first real case

Objective:
- Validate the first-use journey from signup to meaningful case creation.

Checks:
- Signup succeeds.
- Onboarding does not create contradictory expectations.
- User understands how to start a first case.
- First case creation succeeds for `Nomad Holder`.
- Case detail reflects the newly created case.

Primary risk:
- Onboarding dead end or false assumption that a case already exists.

### Scenario 2 — Failed prior history does not block a new Nomad case

Objective:
- Validate multi-case history independence.

Checks:
- Prior failed case remains visible in history.
- User can create a new `Nomad Holder` case.
- New case has separate stage, documents, events, and payment milestones.

Primary risk:
- Previous failure contaminates the new case or blocks new intake incorrectly.

### Scenario 3 — Family case remains independent from the Holder case

Objective:
- Validate that linked cases do not share mutable workflow state.

Checks:
- Family case can be linked to holder case.
- Family case has its own:
  - documents
  - payments
  - status/stage
  - lawyer request state
- Holder case remains unaffected by Family-case-only changes.

Primary risk:
- Cross-case contamination.

### Scenario 4 — Renewal behaves as a new case, not a stage change

Objective:
- Validate Renewal as a linked but independent process.

Checks:
- Renewal can be created from or linked to a prior approved/active Nomad case.
- Renewal uses its own payment/timeline/documents.
- Original case remains historical truth and is not overwritten.

Primary risk:
- Renewal incorrectly mutates the original case instead of creating a new one.

### Scenario 5 — Lawyer assignment remains per case

Objective:
- Validate the business promise that one immigrant can have multiple cases with different assignment states.

Checks:
- Immigrant requests lawyer for one case.
- Lawyer accepts that request.
- Accepted case updates correctly.
- Other cases for the same immigrant remain unchanged unless explicitly acted on.

Primary risk:
- Assignment leaks across cases or collapses back to immigrant-level behavior.

### Scenario 6 — Admin sees the same business truth users see

Objective:
- Validate that admin is not operating on obsolete workflow fields.

Checks:
- Admin can inspect actual case state.
- Admin reporting matches user-visible state.
- No hidden dependency on obsolete immigrant-level fields for release-critical operations.

Primary risk:
- Support/admin act on stale workflow truth.

## 5. Severity Model

- `P0`
  - Breaks canonical business flow
  - causes cross-case or cross-user data leakage
  - causes workflow corruption that could affect legal processing
- `P1`
  - Business truth mismatch
  - admin/operator inconsistency
  - release blocker that prevents safe launch
- `P2`
  - UX ambiguity
  - unsupported edge case
  - doc mismatch
  - non-canonical legacy confusion
- `P3`
  - copy polish
  - visual polish
  - non-blocking friction

## 6. Ownership and Next Actions

### QA
- Own the scenario matrix, defect logging, severity assignment, and release recommendation.
- Verify end-to-end case isolation, permissions, redirects, and linked-case behavior.

### CTO / Product
- Resolve the onboarding operating model:
  - no case until user starts one
  - or auto-draft case
- Decide whether release can proceed with any accepted blocker.

### Full Stack
- Align onboarding and admin behavior to the case model.
- Remove or fence off legacy behavior that no longer matches product truth.
- Update docs/schema references.

### Design
- Clarify first-step UX for new immigrants.
- Ensure linked-case relationships are understandable in the UI.
- Ensure empty states and case-state messaging do not imply obsolete behavior.

### Ops / Legal
- Confirm support and admin rulebooks for:
  - linked cases
  - renewals
  - manual payments
  - legal-content wording

## QA Recommendation

Current QA recommendation: **Do not call the multi-case Nomad release release-ready yet.**

Reason:
- The platform direction is correct, and the core case-centric architecture is in place.
- However, onboarding truth, admin workflow truth, and operational documentation are still misaligned with the business model the product is now enforcing.

This is the right moment for a cross-functional alignment meeting before broader release or heavier QA sign-off.
