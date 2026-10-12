# AI-Native Fullstack Workflow

An AI-native software engineering workflow that transforms GitHub issues into production-ready code through autonomous planning, coding, testing, verification, AI review, and CI/CD quality gates.

---

## Overview

This project demonstrates how modern AI coding agents can reliably transform an ambiguous software requirement into production-ready software through a controlled, repeatable engineering pipeline.

### The Workflow

```
GitHub Issue
     ↓
Planner Agent
     ↓
Specification
     ↓
Implementation Tasks
     ↓
Coding Agent
     ↓
Code + Tests
     ↓
Verification Harness
     ↓
AI Reviewer
     ↓
GitHub PR
     ↓
CI Quality Gates
     ↓
Human Approval
     ↓
Deployment
```

---

## Features

### AI-Native Development

- **Autonomous Planning** - AI agents analyze requirements and create implementation specifications
- **Agent Coding** - AI agents implement features following defined rules
- **Automated Verification** - Deterministic checks ensure code quality
- **AI Review** - Optional AI code review for additional quality assurance
- **CI/CD Integration** - GitHub Actions provide quality gates

### Project Management System (Demo Application)

The demo application is a Project Management System with:

- **User Management** - User accounts and authentication
- **Project Management** - Create and manage projects
- **Task Tracking** - Tasks with TODO, IN_PROGRESS, and DONE statuses
- **Comments** - Discussion threads on tasks

---

## Tech Stack

### Frontend
- **Next.js** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling

### Backend
- **NestJS** - Structured Node.js framework
- **TypeScript** - Type-safe API development
- **TypeORM** - Database ORM
- **PostgreSQL** - Relational database

### Testing
- **Vitest** - Unit, integration and E2E testing
- **Playwright** - E2E testing

### Infrastructure
- **Docker Compose** - Local development environment
- **GitHub Actions** - CI/CD automation

### AI Tools
- **Claude Code** - AI coding agent
- **MCP Server** - Model Context Protocol server for agent tools

---

## Quick Start

### Prerequisites

- Node.js v24 LTS (>= 24.15) - see `.nvmrc`
- Yarn v1.22+
- Docker and Docker Compose
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-native-fullstack-workflow.git
cd ai-native-fullstack-workflow

# Install dependencies
yarn install

# Set up environment
cp .env.example .env
# Edit .env with your configuration (or leave as-is to start
# without a database - the API boots without persistence until
# DATABASE_URL is set)

# Optional: start PostgreSQL via Docker
yarn db:up
```

### Local PostgreSQL without Docker

```bash
sudo -u postgres psql
  CREATE USER dev WITH PASSWORD 'dev_password';
  CREATE DATABASE ai_workflow_dev OWNER dev;
  \q
```

The backend connects to PostgreSQL automatically whenever
`DATABASE_URL` is present in `.env`.

### Development

```bash
# From the repository root
yarn dev:backend    # NestJS API on http://localhost:3001
yarn dev:frontend   # Next.js app on http://localhost:3000
```

Visit http://localhost:3000 for the frontend and http://localhost:3001/api/health for the API.

The UI has three areas: **Users** (`/users`), **Projects** (`/projects`)
and a project page (`/projects/:id`) for creating tasks and changing their
status or assignee inline. The CRUD pages need the API to run with a
database; without one they show an error page with setup instructions.
The frontend calls the API from the server only (`API_BASE_URL`).

### Database migrations

The schema is managed only through migrations (`synchronize` is off):

```bash
yarn migration:run      # apply pending migrations
yarn migration:revert   # roll back the most recent migration
```

The backend reads `apps/backend/.env` first, then the repository-root `.env`.

---

## REST API

All routes are prefixed with `/api`. The CRUD routes are mounted only when
`DATABASE_URL` is set; without it the API exposes `/api/health` only.

| Method | Path | Description | Success |
|--------|------|-------------|---------|
| GET | `/health` | Health report incl. database state | 200 |
| GET | `/users?page&limit` | List users (paginated) | 200 |
| GET | `/users/:id` | Get a user | 200 |
| POST | `/users` | Create a user (`email`, `name`) | 201 |
| PATCH | `/users/:id` | Update a user | 200 |
| DELETE | `/users/:id` | Delete a user (409 if it owns projects or has tasks) | 204 |
| GET | `/projects?page&limit&ownerId` | List projects | 200 |
| GET | `/projects/:id` | Get a project | 200 |
| POST | `/projects` | Create a project (`name`, `ownerId`, `description?`) | 201 |
| PATCH | `/projects/:id` | Update a project | 200 |
| DELETE | `/projects/:id` | Delete a project and its tasks | 204 |
| GET | `/tasks?page&limit&projectId&status&assigneeId` | List tasks | 200 |
| GET | `/tasks/:id` | Get a task | 200 |
| POST | `/tasks` | Create a task (`title`, `projectId`, `status?`, `assigneeId?`) | 201 |
| PATCH | `/tasks/:id` | Update a task (`assigneeId: null` unassigns) | 200 |
| DELETE | `/tasks/:id` | Delete a task | 204 |

List endpoints return `{ data, total, page, limit, totalPages }`
(`Paginated<T>` in `@ai-workflow/shared-types`). Errors use the NestJS
shape `{ statusCode, message, error }`: 400 validation, 404 missing
resource or reference, 409 duplicate email / blocked delete.

---

## Documentation

- **[AGENTS.md](AGENTS.md)** - AI coding agent rules and guidelines
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design decisions
- **[DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md)** - AI-native development process
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines

---

## Development Workflow

### For Human Contributors

1. Create an issue describing the change
2. Create a feature branch
3. Implement changes following [AGENTS.md](AGENTS.md) rules
4. Write tests for your changes
5. Run `yarn verify` to validate
6. Commit with conventional commits
7. Create a pull request

### For AI Agents

AI agents follow the automated workflow:

1. **Planner Agent** analyzes the issue and creates a specification
2. **Coding Agent** implements the specification following AGENTS.md rules
3. **Verification Harness** runs type checking, linting, and tests
4. **AI Reviewer** performs optional code review
5. **GitHub PR** is created for human approval
6. **CI/CD** runs quality gates on the PR
7. **Human Approval** is required for merge

See [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md) for details.

---

## GitHub Automation

Two workflows live in `.github/workflows/`:

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `ci.yml` | every PR, pushes to `main` | `yarn verify`; migrations up/down/up and CRUD e2e against PostgreSQL |
| `ai-agent.yml` | `ai-agent` label, `@claude` comments | plans from the issue, then implements on approval and opens a PR |

### Issue to pull request

1. Open an issue with the **AI agent task** template.
2. A maintainer reviews it and adds the `ai-agent` label. The planner
   reads the issue and code and comments an *Implementation Specification*.
3. The maintainer approves by commenting `@claude implement` (or asks for
   changes first). The agent implements on a `feature/` branch, runs
   `yarn verify`, and opens a PR that closes the issue.
4. CI gates the PR; `@claude` on the PR requests follow-up changes.
5. A human reviews and merges.

Only users with write access can trigger the agent. Agent instructions
come from [CLAUDE.md](CLAUDE.md), which imports [AGENTS.md](AGENTS.md).

### One-time setup

1. Run `claude setup-token` (requires a Claude Pro or Max subscription)
   and add the printed token as the repository secret
   `CLAUDE_CODE_OAUTH_TOKEN` (Settings → Secrets and variables → Actions).
   Agent runs count against the subscription's usage limits.
2. Install the Claude GitHub App (https://github.com/apps/claude) on the
   repository, or run `/install-github-app` in Claude Code.
3. Create the `ai-agent` label (Issues → Labels).
4. Recommended: protect `main` and require the CI checks
   (`Verify (type-check, lint, tests, build)`, `Migrations + database e2e`).

---

## Verification

All changes must pass verification:

```bash
yarn verify
```

This runs:
- TypeScript type checking
- ESLint
- Unit tests
- E2E tests
- Production build

---

## Repository Structure

```
ai-native-fullstack-workflow/
├── apps/
│   ├── frontend/          # Next.js application
│   └── backend/           # NestJS application
├── packages/
│   ├── shared-types/      # Shared TypeScript types
│   └── shared-utils/      # Shared utilities
├── mcp-server/            # Model Context Protocol server
├── scripts/               # Automation scripts
├── docs/                  # Additional documentation
├── AGENTS.md              # AI agent rules
├── ARCHITECTURE.md        # System architecture
├── DEVELOPMENT_WORKFLOW.md # Development process
├── CONTRIBUTING.md        # Contribution guidelines
└── README.md              # This file
```

---

## Current Status

### Phase 1: Foundation ✅

- [x] Repository structure
- [x] Documentation and architecture
- [x] AI agent rules
- [x] Development workflow

### Phase 2: Infrastructure ✅

- [x] Yarn workspaces monorepo (`apps/*`, `packages/*`)
- [x] Strict TypeScript configuration (`tsconfig.base.json`)
- [x] Shared ESLint config enforcing AGENTS.md rules
- [x] Shared types and utilities packages
- [x] NestJS 12 backend skeleton with health endpoint + tests
- [x] Next.js 16 frontend skeleton with live backend status page
- [x] Vitest test setup (unit + e2e)
- [x] Verification harness (`yarn verify` - 6 gates, PASS/FAIL)
- [x] Docker Compose for PostgreSQL
- [x] Database-optional boot (API runs with or without DATABASE_URL)

### Phase 3: MVP Application ✅

- [x] Basic CRUD for Users, Projects, Tasks (entities, initial migration)
- [x] REST API (validation, pagination, filters, 404/409 mapping)
- [x] Unit tests for services + database-gated CRUD e2e (`yarn test:e2e:db`)
- [x] Basic UI: users, projects and project detail with tasks (server
      components + server actions, inline status/assignee editing)
- [x] Frontend unit tests (Vitest) for API client, form parsing and action errors

### Phase 4: Testing & Verification (Planned)

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Verification harness

### Phase 5: AI Agent Integration (In progress)

- [ ] MCP server
- [x] Planner Agent (`ai-agent` label posts an implementation spec)
- [x] Coding Agent integration (`@claude` implements the spec and opens a PR)
- [x] GitHub Actions workflows (CI quality gates + agent pipeline)

---

## Contributing

We welcome contributions from both humans and AI agents!

### Human Contributors

1. Read [CONTRIBUTING.md](CONTRIBUTING.md)
2. Read [AGENTS.md](AGENTS.md) for code standards
3. Create an issue or pick up an existing one
4. Follow the development workflow
5. Submit a pull request

### AI Agent Contributors

AI agents should:

1. Follow all rules in [AGENTS.md](AGENTS.md)
2. Read code before modifying it
3. Write tests alongside implementation
4. Never skip verification
5. Clearly communicate changes

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Project Goals

This project aims to demonstrate:

1. **Specification before implementation** - Clear requirements lead to better code
2. **Deterministic verification** - Code quality is measurable, not opinion-based
3. **AI as a tool, not a replacement** - AI assists, humans approve
4. **Reproducible workflows** - Every important step is documented and repeatable
5. **Quality gates** - Multiple validation layers ensure reliability

---

## Acknowledgments

Built with:
- [Claude Code](https://claude.ai/code) - AI coding assistant
- [Next.js](https://nextjs.org/) - React framework
- [NestJS](https://nestjs.com/) - Node.js framework
- [TypeORM](https://typeorm.io/) - Database ORM

---

## Contact

For questions, suggestions, or issues, please create a GitHub issue or start a discussion.
