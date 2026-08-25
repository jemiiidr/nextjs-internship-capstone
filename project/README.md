# Kanvas application

Kanvas is the production application in this repository. It is a multi-workspace project management platform with Kanban workflows, team permissions, deadlines, notifications, and analytics.

## Requirements

- Node.js 22 or newer (enforced by `package.json`)
- pnpm 10.10 or newer
- A PostgreSQL database; Neon is supported directly
- A Clerk application with Organizations enabled

## Local setup

```bash
pnpm install
cp .env.example .env.local
pnpm db:migrate
pnpm dev
```

On Windows PowerShell, copy the environment file with:

```powershell
Copy-Item .env.example .env.local
```

Then open <http://localhost:3000>.

Use `pnpm db:push` only for deliberate development-time schema synchronization. Committed environments should use the SQL migrations in `drizzle/` through `pnpm db:migrate`.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk browser key |
| `CLERK_SECRET_KEY` | Yes | Clerk server key |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Production sync | Verifies Clerk webhook events |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | Yes in production | Absolute base URL used for invitation links |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Recommended | Sign-in route; normally `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Recommended | Sign-up route; normally `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Recommended | Post-sign-in route |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Recommended | Post-sign-up route |

Do not expose server secrets through `NEXT_PUBLIC_*`, and never commit `.env.local`.

## Clerk configuration

1. Enable Organizations in the Clerk dashboard.
2. Configure sign-in and sign-up routes to match `.env.local`.
3. Add the production domain and authorized redirect URLs.
4. Create a webhook targeting `https://<domain>/api/webhooks/clerk`.
5. Subscribe to `user.created`, `user.updated`, `user.deleted`, and `organizationMembership.created`.
6. Store the webhook signing secret as `CLERK_WEBHOOK_SIGNING_SECRET`.

The membership event powers workspace join notifications. Webhook processing is signature-verified and must not be replaced with an unauthenticated endpoint.

## Application routes

| Route | Purpose |
| --- | --- |
| `/` | Public landing page |
| `/sign-in`, `/sign-up` | Branded Clerk authentication |
| `/dashboard` | Workspace overview, activity, tasks, and metrics |
| `/projects` | Searchable and sortable project grid |
| `/projects/[id]` | Project details, Kanban/list views, members, and activity |
| `/my-tasks` | Tasks assigned to the signed-in user |
| `/calendar` | Month and 24-hour day deadline views |
| `/analytics` | Workspace metrics, status, workload, and task-flow charts |
| `/notifications` | Workspace notification history |
| `/team` | Members, invitations, and role management |
| `/workspaces` | Workspace switching and creation |
| `/settings` | Workspace and account settings |
| `/invitations/accept` | Clerk organization invitation acceptance |

All routes except the landing page, authentication, invitation acceptance, and Clerk webhook are protected in `proxy.ts`.

## Roles and access control

Authorization is enforced on the server through `lib/rbac.ts` and action-level access checks. UI visibility is not a security boundary.

| Capability | Owner | Admin | Member | Viewer |
| --- | :---: | :---: | :---: | :---: |
| View workspace/team/projects/analytics/notifications | Yes | Yes | Yes | Yes |
| Create workspace | Yes | Yes | Yes | No |
| Update active workspace | Yes | Yes | No | No |
| Manage team invitations and roles | Yes | Yes* | No | No |
| Create and update projects | Yes | Yes | Yes | No |
| Delete projects/manage project members | Yes | Yes | No | No |
| Update account | Yes | Yes | Yes | Yes |

`*` Admins cannot remove or change the owner, remove another admin, or demote an admin. Those operations are owner-only. Project members may also have a project-specific display label such as Designer or Contributor; that label does not replace their workspace access role.

## Data model

The Drizzle schema is in `lib/db/schema.ts`; migrations are in `drizzle/`. Core records include users, projects, project members, lists, tasks, labels, task-label links, comments, notifications, and activity entries. Application records are scoped to the active Clerk organization workspace.

```bash
pnpm db:generate  # Generate a migration after a schema change
pnpm db:migrate   # Apply committed migrations
pnpm db:push      # Synchronize schema directly during development
pnpm db:studio    # Open Drizzle Studio
```

Review generated SQL before committing migrations. Do not modify an already-applied migration; create a new one.

## Architecture

```text
app/
├── (auth)/                 # Clerk authentication pages
├── (dashboard)/            # Protected application pages
├── actions/                # Validated Server Actions
└── api/webhooks/clerk/     # Clerk event ingestion
components/
├── analytics/ calendar/ dashboard/
├── project-detail/ projects/ team/ workspaces/
└── ui/                     # Shared shadcn-style primitives and charts
lib/
├── db/                     # Drizzle client, queries, and schema
├── auth.ts and rbac.ts     # Server authorization
├── validations.ts          # Zod input validation
└── notifications.ts        # Notification persistence
drizzle/                    # SQL migrations and metadata
tests/
├── unit/                   # Jest tests for utilities, validation, and RBAC
├── components/             # React Testing Library component tests
└── e2e/                    # Playwright desktop and mobile browser tests
```

Server Components load data by default. Interactive surfaces are Client Components. Mutations use Server Actions, validate untrusted input with Zod, re-check authorization on the server, and revalidate affected routes.

## UI conventions

- Reuse components in `components/ui/` before introducing a parallel primitive.
- Use Tailwind utility classes and the existing Kanvas color tokens.
- Design mobile-first and verify light and dark themes.
- Use shadcn Chart wrappers with Recharts for data visualizations.
- Provide visible focus states, labels for icon-only controls, and keyboard-accessible interactions.
- Keep destructive colors muted and require confirmation for destructive member/project/list operations where appropriate.

## Scripts and quality checks

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the Next.js development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve the production build |
| `pnpm check` | Run Biome formatting and lint checks |
| `pnpm check:fix` | Apply safe Biome fixes |
| `pnpm lint` | Run Biome lint only |
| `pnpm format` | Format the repository |
| `pnpm type-check` | Run TypeScript without emitting files |
| `pnpm test` | Run Jest once |
| `pnpm test:ci` | Run Jest serially in CI mode |
| `pnpm test:watch` | Run Jest in watch mode |
| `pnpm test:coverage` | Generate unit-test coverage |
| `pnpm test:e2e` | Run Playwright tests |
| `pnpm test:e2e:ui` | Open Playwright's test UI |
| `pnpm verify` | Run formatting/lint, types, Jest, and production build |

Before review:

```bash
pnpm check
pnpm type-check
pnpm test
pnpm build
```

All tests live under `tests/`. The Jest suite covers RBAC, validation, shared utilities, and reusable UI behavior through React Testing Library. Playwright covers public navigation and responsive browser flows. Add focused tests for new server logic and validation edge cases; use Playwright for critical browser workflows.

### Weeks 11-12 testing and ship criteria

- Keep pure logic tests in `tests/unit/`, React Testing Library tests in `tests/components/`, and Playwright flows in `tests/e2e/`.
- Maintain at least 10 Jest unit/integration cases covering core behavior and at least two Playwright tests covering critical browser flows. This project intentionally uses Jest in place of the rubric's Vitest command.
- Keep unit and component tests independent of live Clerk and database services.
- Use dedicated Clerk test accounts and an isolated test database before enabling authenticated Playwright mutations.
- Run `pnpm verify` before submission, followed by `pnpm test:e2e` against the intended test environment.
- Set `PLAYWRIGHT_TEST_BASE_URL` to test an already-running local or deployed environment without starting Playwright's local server.
- `instrumentation.ts` initializes OpenTelemetry under the `kanvas` service name.
- Verify the production Vercel deployment and final showcase separately; these are release milestones, not automated test results.

## Deployment to Vercel

1. Import the `project/` directory into Vercel or link it with the Vercel CLI.
2. Use Node.js 22.
3. Configure all required Clerk and database variables for Preview and Production.
4. Apply database migrations against the target database.
5. Configure the Clerk production domain, redirects, and webhook.
6. Deploy and smoke-test sign-up, workspace creation, invitations, project access, and deadlines.

```bash
pnpm add -g vercel
vercel login
vercel link
vercel
vercel --prod
```

The optional workflow at `.github/workflows/deploy.yml` is manually triggerable and has automatic push/PR triggers disabled by default. It requires `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` repository secrets.

## Troubleshooting

- **A new user sees a transient load error:** confirm the Clerk user webhook, database connectivity, and production environment variables. The app also performs idempotent user provisioning on authenticated requests.
- **Workspace data is missing:** confirm an active Clerk organization is selected and the user has a valid organization membership.
- **Invitations work but join notifications do not:** verify `organizationMembership.created` is enabled and the production webhook secret matches.
- **Database commands fail:** verify `DATABASE_URL`, SSL requirements, and database network access.
- **Generated database types look stale:** generate and inspect a new migration, migrate, then run `pnpm type-check`.
- **Jest reports `spawn EPERM` in a restricted Windows shell:** allow Node/Jest to create worker processes or run from a standard local terminal.
- **Port 3000 is busy:** start with `pnpm dev -- --port 3001` or stop the existing process with operating-system process tools.

## Security checklist

- Keep authorization checks inside Server Actions and queries.
- Validate all form data and identifiers before database or Clerk operations.
- Verify webhook signatures before processing events.
- Scope records to the active workspace and verify project membership.
- Never log OTPs, secrets, complete connection strings, or sensitive personal data.
- Keep usernames unique through the identity provider and validate conflicts before completing enrollment.
- Review owner/admin invariants whenever team-role behavior changes.

See the repository-level [development setup](../docs/DEVELOPMENT_SETUP.md) and [code review guide](../docs/CODE_REVIEW_GUIDE.md) for contributor workflow.
