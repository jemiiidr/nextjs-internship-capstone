# Kanvas

Kanvas is a full-stack, multi-workspace project management application built for the Stratpoint Engineering Internship Capstone. It combines Kanban task management, team collaboration, calendars, notifications, and workspace analytics in a responsive interface.

The application is in [`project/`](project/). Detailed setup, architecture, environment variables, RBAC, database, testing, and deployment guidance is in the [application README](project/README.md).

## Current capabilities

- Clerk authentication, social sign-in, organization workspaces, and invitations
- Owner, admin, member, and viewer access control
- Project, list, task, label, comment, and project-member management
- Drag-and-drop Kanban and list views, bulk task actions, and contextual menus
- Date-and-time task deadlines connected to month and day calendar views
- Dashboard and analytics visualizations built with shadcn Chart and Recharts
- Search, sorting, notifications, activity history, responsive layouts, and dark mode
- PostgreSQL persistence through Neon and Drizzle ORM
- Unit tests with Vitest and browser testing support with Playwright

## Technology

| Area | Stack |
| --- | --- |
| Application | Next.js 16 App Router, React 19, TypeScript 5.9 |
| UI | Tailwind CSS 4, shadcn/ui, Lucide, Motion |
| Charts | shadcn Chart, Recharts |
| Authentication | Clerk Organizations |
| Database | PostgreSQL/Neon, Drizzle ORM |
| Interaction | dnd-kit, Zustand, Zod |
| Quality | Biome, Vitest, Testing Library, Playwright |
| Hosting | Vercel |

## Quick start

Requirements: Node.js 22+, pnpm 10.10+, PostgreSQL or Neon, and a Clerk application with Organizations enabled.

```bash
git clone <repository-url>
cd nextjs-internship-capstone/project
pnpm install
cp .env.example .env.local
pnpm db:migrate
pnpm dev
```

Fill in `.env.local` before migrating. Open <http://localhost:3000> after the development server starts. Windows PowerShell users can use `Copy-Item .env.example .env.local` instead of `cp`.

## Repository layout

```text
nextjs-internship-capstone/
├── project/       # Production Next.js application
├── docs/          # Setup, review, and milestone guidance
└── tasks/         # Original capstone requirements and planning records
```

## Documentation

- [Application guide](project/README.md)
- [Development setup](docs/DEVELOPMENT_SETUP.md)
- [Code review guide](docs/CODE_REVIEW_GUIDE.md)
- [Timeline and milestones](docs/TIMELINE_MILESTONES.md)
- [Original task specification](tasks/tasks-capstone-project-management-tool.md)
- [Individual development approach](tasks/INDIVIDUAL_DEVELOPMENT_APPROACH.md)

## Core verification

Run these from `project/` before submitting changes:

```bash
pnpm check
pnpm type-check
pnpm test
pnpm build
```

Never commit `.env.local`, Clerk secrets, database credentials, or webhook signing secrets.

## Project status

The capstone is implemented and actively maintained. The files in `tasks/` and the week-by-week timeline are historical planning references; the source code and application README describe the current product.

This repository is maintained for educational and portfolio use as part of the Stratpoint Engineering Internship Program.
