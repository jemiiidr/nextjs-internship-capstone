# Code review guide

Kanvas is developed primarily in individual forks, but every meaningful change should receive a careful self-review and, when available, peer review.

## Before requesting review

Run from `project/`:

```bash
pnpm check
pnpm type-check
pnpm test
pnpm build
```

Then inspect the complete diff and remove debug output, dead code, accidental generated files, and unrelated edits. Verify the feature manually at desktop and mobile widths and in light and dark modes when UI is affected.

## Review priorities

### 1. Security and isolation

- Server Actions authenticate the caller and enforce `lib/rbac.ts` permissions.
- Database operations verify active workspace and project membership.
- Owner/admin invariants cannot be bypassed by altered form submissions.
- Inputs are validated with Zod before use.
- Webhooks verify signatures and are idempotent where duplicate delivery is possible.
- Secrets, OTPs, full database URLs, and personal data are not logged or exposed.

Security and cross-workspace data leaks are blocking issues.

### 2. Correctness and edge cases

- Empty, loading, error, and stale-data states behave sensibly.
- Duplicate submissions, rapid interactions, and optimistic updates reconcile correctly.
- Dates and deadline times respect the intended timezone and 11:59 PM default.
- New users, empty workspaces, removed members, missing assignees, and deleted records are handled.
- Mutations revalidate every affected screen.

### 3. Accessibility and responsive UI

- Controls have accessible names and visible keyboard focus.
- Menus, modals, comboboxes, and drag-and-drop have usable non-pointer behavior.
- Modal overlays cover the viewport and content remains reachable on small screens.
- Text contrast works in both themes.
- Charts expose accessible data and remain legible without excessive height or overflow.

### 4. Maintainability

- Server and client responsibilities are clear.
- Existing components, types, schemas, and utilities are reused.
- Functions have focused responsibilities and descriptive names.
- Comments explain decisions, not obvious syntax.
- New dependencies solve a clear need and update the lockfile.
- Database changes include a reviewed migration.

### 5. Tests

- New validation, RBAC, formatting, and server logic includes focused unit tests.
- Regression fixes include a test when practical.
- Critical authentication, invitation, workspace, project, and task flows use Playwright where browser behavior matters.
- Tests assert user-visible outcomes instead of implementation details.

## Feedback labels

- **Blocking:** security, data loss, authorization, broken behavior, or failed checks
- **Should fix:** maintainability, accessibility, performance, or missing edge-case coverage
- **Suggestion:** optional improvement that does not block the change
- **Question:** clarification needed to evaluate the approach

Make comments concrete: describe the observed risk, the scenario that triggers it, and a viable direction. Prefer “This allows a member to call the action directly without the UI guard; add a server permission check” over a general “RBAC is wrong.”

## Change-specific checks

### Authentication and team changes

- Test new account creation, social sign-in, username conflict handling, invitation acceptance, and webhook retries.
- Confirm admins cannot remove/demote admins or modify the owner; owners retain those capabilities.

### Project and task changes

- Test read-only versus editable task details, task context menus, bulk updates, list movement/deletion, and project-member changes.
- Confirm project role labels do not alter workspace RBAC roles.

### Calendar and analytics changes

- Test no-deadline, one-deadline, and overflow days.
- Verify task date/time changes appear consistently in calendar views.
- Validate chart empty states, tooltips, resizing, dark mode, and large/sparse values.

### Database changes

- Review SQL for destructive operations, defaults, nullability, indexes, and backfill behavior.
- Apply migrations to a representative development database and verify older rows.

## Pull request summary

A useful review description includes:

```markdown
## Outcome
What user-visible behavior changed?

## Implementation
What important technical decisions were made?

## Verification
- [ ] pnpm check
- [ ] pnpm type-check
- [ ] pnpm test
- [ ] pnpm build
- [ ] Manual desktop/mobile and light/dark checks

## Data or deployment notes
Environment variables, migrations, Clerk configuration, or rollout concerns.
```

The goal is a review another developer can reproduce without relying on unstated local context.
