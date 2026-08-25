# Development setup

This guide describes the current Kanvas development environment. Run application commands from the `project/` directory.

## Prerequisites

- Node.js 22+
- pnpm 10.10+
- Git
- PostgreSQL or a Neon database
- A Clerk application with Organizations enabled

VS Code is optional. Useful extensions include Biome, Tailwind CSS IntelliSense, and GitLens. The repository uses Biome—not ESLint or Prettier—as its primary formatter and linter.

## Install and configure

```bash
git clone <repository-url>
cd nextjs-internship-capstone/project
pnpm install
cp .env.example .env.local
```

PowerShell equivalent:

```powershell
Copy-Item .env.example .env.local
```

Add valid Clerk and `DATABASE_URL` values to `.env.local`. Never commit that file.

Configure a Clerk webhook at `/api/webhooks/clerk` with `user.created`, `user.updated`, `user.deleted`, and `organizationMembership.created`, then copy its secret into `CLERK_WEBHOOK_SIGNING_SECRET`.

## Initialize the database

Apply the committed schema:

```bash
pnpm db:migrate
```

For a new schema change:

1. Edit `lib/db/schema.ts`.
2. Run `pnpm db:generate`.
3. Review the generated SQL in `drizzle/`.
4. Run `pnpm db:migrate` against a development database.
5. Test both new and existing data paths.

Do not rewrite migrations already applied to a shared or production database.

## Run locally

```bash
pnpm dev
```

Open <http://localhost:3000>. If the port is occupied, use `pnpm dev -- --port 3001`.

## Development workflow

Use a focused branch:

```bash
git switch -c feature/task-description
```

Recommended prefixes are `feature/`, `fix/`, `refactor/`, `test/`, and `docs/`. Use conventional commit subjects such as `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, and `chore:`.

Before committing:

```bash
pnpm check
pnpm type-check
pnpm test
pnpm build
```

Use `pnpm check:fix` for safe Biome fixes. Review the resulting diff before committing.

## Engineering conventions

### Server and data

- Prefer Server Components for data loading and Client Components only for interactive state.
- Use Server Actions for mutations.
- Parse untrusted inputs with Zod.
- Enforce RBAC and workspace/project scope on the server for every mutation.
- Revalidate all routes whose rendered data changed.
- Keep Clerk calls and database writes consistent; return actionable errors without leaking secrets.

### UI

- Reuse `components/ui/` primitives and existing Kanvas tokens.
- Use shadcn Chart plus Recharts for application data visualizations.
- Build mobile-first and test light and dark modes.
- Preserve keyboard navigation, focus states, semantic labels, and reduced-motion preferences.
- Confirm destructive actions and use the established muted destructive palette.

### TypeScript

- Keep strict typing and avoid `any`.
- Use `import type` for type-only imports.
- Model nullable database values explicitly.
- Prefer shared types and validation schemas over duplicate shapes.

### Tests

- Put pure logic tests in `tests/unit/`.
- Put React Testing Library tests in `tests/components/`.
- Put Playwright browser flows in `tests/e2e/`.
- Keep unit/component tests independent of live Clerk and database services.
- Use dedicated test accounts and isolated data before adding authenticated E2E mutations.

## Available commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve a production build |
| `pnpm check` | Biome lint and formatting validation |
| `pnpm check:fix` | Apply Biome fixes |
| `pnpm lint` | Biome lint |
| `pnpm format` | Format files |
| `pnpm type-check` | TypeScript validation |
| `pnpm test` | Jest unit and component tests |
| `pnpm test:watch` | Jest watch mode |
| `pnpm test:coverage` | Coverage report |
| `pnpm test:e2e` | Playwright tests |
| `pnpm test:e2e:ui` | Playwright UI |
| `pnpm db:generate` | Generate migrations |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:push` | Direct development schema sync |
| `pnpm db:studio` | Drizzle Studio |

## Troubleshooting

- **Authentication redirect loop:** confirm Clerk URL variables, allowed origins, and the active Clerk instance.
- **Page load/database error:** validate `DATABASE_URL`, SSL requirements, migrations, and database reachability.
- **Workspace missing:** select or create a Clerk Organization and confirm membership.
- **No membership notification:** check the Clerk webhook subscription and signing secret.
- **Stale Next.js output:** stop the dev server, remove only `project/.next`, and restart. Do not delete the repository or user data.
- **Jest `spawn EPERM`:** the shell is blocking worker processes; run from a normal terminal or grant Node permission to spawn test workers.
- **Type errors hidden during deployment:** always run `pnpm type-check`; do not rely solely on Next.js build behavior.

See [the application README](../project/README.md) for routes, RBAC, architecture, deployment, and security details.
