# ARCHITECTURE.md

System architecture documentation for the ai-native-fullstack-workflow project.

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [High-Level Architecture](#high-level-architecture)
4. [Module Structure](#module-structure)
5. [API Design Principles](#api-design-principles)
6. [Database Schema](#database-schema)
7. [Security Architecture](#security-architecture)
8. [MCP Server Architecture](#mcp-server-architecture)
9. [CI/CD Architecture](#cicd-architecture)
10. [Deployment Architecture](#deployment-architecture)

---

## Overview

The ai-native-fullstack-workflow is a **monorepo** application demonstrating an AI-native software engineering workflow. The system consists of:

- **Frontend**: Next.js application for user interaction
- **Backend**: NestJS API for business logic and data persistence
- **Database**: PostgreSQL for data storage
- **MCP Server**: Model Context Protocol server for AI agent tools
- **CI/CD**: GitHub Actions for automation and quality gates

### Visual Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              GitHub Issues                                    │
│                              (Input Source)                                    │
└───────────────────────────────────────┬─────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Planner Agent                                    │
│                    (Analyzes & Creates Specification)                         │
└───────────────────────────────────────┬─────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Coding Agent                                      │
│                      (Implements & Writes Tests)                              │
└───────────────────────────────────────┬─────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Verification Harness                                 │
│                    (TypeScript, ESLint, Tests, Build)                         │
└───────────────────────────────────────┬─────────────────────────────────────┘
                                        │
                              ┌─────────┴─────────┐
                              │                   │
                         PASS │                   │ FAIL
                              ▼                   ▼
                    ┌──────────────┐      ┌──────────────┐
                    │  AI Reviewer │      │   Feedback   │
                    │   (Optional) │      │   & Retry    │
                    └──────┬───────┘      └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  GitHub PR   │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ CI Quality   │
                    │    Gates     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Human Review │
                    │  & Approval  │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Deployment  │
                    └──────────────┘
```

---

## Technology Stack

### Rationale

| Technology | Purpose | Justification |
|------------|---------|---------------|
| **Next.js** | Frontend framework | Modern React framework with App Router, excellent AI code generation support |
| **NestJS** | Backend framework | Structured, TypeScript-first, opinionated architecture |
| **TypeORM** | Database ORM | Type-safe, active record pattern, good migrations |
| **PostgreSQL** | Database | Reliable, ACID compliant, excellent JSON support |
| **Yarn Workspaces** | Monorepo management | Proven, simple, efficient dependency management |
| **Docker** | Containerization | Consistent development and deployment environments |
| **GitHub Actions** | CI/CD | Native GitHub integration, no additional tools needed |
| **Jest** | Testing | Built-in with NestJS, excellent TypeScript support |
| **Playwright** | E2E Testing | Reliable browser automation, good TypeScript support |
| **Claude Code** | AI Coding Agent | Advanced reasoning, good context understanding |

### Why Not Alternatives?

| Considered | Rejected Because |
|------------|------------------|
| **Turborepo** | Not needed for MVP, adds complexity |
| **Nx** | Too heavy for our needs, Yarn Workspaces sufficient |
| **Prisma** | TypeORM chosen for NestJS ecosystem alignment |
| **MongoDB** | Relational model better for our entities |
| **Temporal/n8n** | GitHub Actions sufficient for orchestration |

---

## High-Level Architecture

### Monorepo Structure

```
ai-native-fullstack-workflow/
├── apps/
│   ├── frontend/          # Next.js application
│   │   ├── src/
│   │   │   ├── app/       # App Router pages
│   │   │   ├── components/
│   │   │   ├── lib/       # API clients, utilities
│   │   │   └── types/     # Frontend types
│   │   └── public/
│   │
│   └── backend/           # NestJS application
│       ├── src/
│       │   ├── modules/   # Feature modules
│       │   ├── common/    # Shared code
│       │   ├── database/  # Database config
│       │   └── main.ts
│       └── test/
│
├── packages/
│   ├── shared-types/      # Types shared FE/BE
│   ├── shared-utils/      # Shared utilities
│   └── eslint-config/     # Shared ESLint config
│
└── mcp-server/            # Model Context Protocol server
    └── src/
        ├── tools/         # MCP tool implementations
        └── index.ts
```

### Communication Flow

```
┌─────────────────┐         API          ┌─────────────────┐
│   Frontend      │ ───────────────────▶ │    Backend      │
│   (Next.js)     │ ◀─────────────────── │   (NestJS)      │
└─────────────────┘                        └────────┬────────┘
                                                    │
                                                    │ TypeORM
                                                    ▼
                                             ┌──────────────┐
                                             │  PostgreSQL  │
                                             └──────────────┘
```

---

## Module Structure

### Backend Modules

Each feature module is self-contained:

```
backend/src/modules/
├── auth/                 # Authentication
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── guards/           # JWT guards
│   ├── strategies/       # Passport strategies
│   └── dtos/
│
├── users/                # User management
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   ├── user.entity.ts
│   └── dtos/
│
├── projects/             # Project management
│   ├── projects.controller.ts
│   ├── projects.service.ts
│   ├── projects.module.ts
│   ├── project.entity.ts
│   └── dtos/
│
├── tasks/                # Task management
│   ├── tasks.controller.ts
│   ├── tasks.service.ts
│   ├── tasks.module.ts
│   ├── task.entity.ts
│   └── dtos/
│
└── comments/             # Comments
    ├── comments.controller.ts
    ├── comments.service.ts
    ├── comments.module.ts
    ├── comment.entity.ts
    └── dtos/
```

### Module Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                        AppModule                             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │ Auth │  │Users │  │Projects│ │Tasks │ │Comments│        │
│  └───┬──┘  └───┬──┘  └───┬──┘  └───┬──┘  └───┬──┘         │
│      └────────┴─────────┴─────────┴─────────┴──┐           │
│                     ▼                          │           │
│              ┌─────────────┐                   │           │
│              │ TypeORM     │                   │           │
│              │ Database    │                   │           │
│              └─────────────┘                   │           │
└─────────────────────────────────────────────────────────────┘
```

---

## API Design Principles

### RESTful Conventions

All endpoints follow REST conventions:

| Pattern | Endpoint | Description |
|---------|-----------|-------------|
| List | `GET /api/{resource}` | Get paginated list |
| Get | `GET /api/{resource}/:id` | Get single item |
| Create | `POST /api/{resource}` | Create new item |
| Update | `PATCH /api/{resource}/:id` | Partial update |
| Delete | `DELETE /api/{resource}/:id` | Delete item |

### Response Format

**Success Response:**
```json
{
  "id": 1,
  "name": "Project Alpha",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Error Response:**
```json
{
  "statusCode": 404,
  "message": "Project #1 not found",
  "error": "Not Found"
}
```

### Pagination

**Request:** `GET /api/projects?page=1&limit=10`

**Response:**
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

---

## Database Schema

### Entity Relationships

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │   Project   │       │    Task     │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │       │ id          │
│ email       │       │ name        │       │ title       │
│ password    │       │ ownerId     │◄──────│ projectId   │
│ name        │       │ createdAt   │       │ status      │
│ createdAt   │       └─────────────┘       │ assigneeId  │
└─────────────┘         │         │         │ createdAt   │
        ▲               │         │         └─────────────┘
        │               │         │               ▲
        │               │         │               │
        │               └─────────┴───────────────┘
        │                       │
        └───────────────────────┘
```

### Initial MVP Entities

**User:**
```typescript
{
  id: number
  email: string (unique)
  password: string (hashed)
  name: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date (soft delete)
}
```

**Project:**
```typescript
{
  id: number
  name: string
  description: string (optional)
  ownerId: number (FK → User)
  createdAt: Date
  updatedAt: Date
  deletedAt: Date (soft delete)
}
```

**Task:**
```typescript
{
  id: number
  title: string
  description: string (optional)
  status: enum (TODO, IN_PROGRESS, DONE)
  projectId: number (FK → Project)
  assigneeId: number (FK → User, nullable)
  createdAt: Date
  updatedAt: Date
  deletedAt: Date (soft delete)
}
```

---

## Security Architecture

### Authentication Flow

```
┌─────────┐                   ┌─────────┐                  ┌─────────┐
│ Client  │                   │ Backend │                  │ Database │
└────┬────┘                   └────┬────┘                  └────┬────┘
     │                              │                            │
     │ POST /api/auth/login         │                            │
     │ {email, password}           │                            │
     ├─────────────────────────────▶│                            │
     │                              │ SELECT * FROM users         │
     │                              │ WHERE email = ?             │
     │                              ├────────────────────────────▶│
     │                              │◀────────────────────────────┤
     │                              │                            │
     │                              │ Verify password hash        │
     │                              │                            │
     │◀─────────────────────────────┤ JWT token                  │
     │                              │                            │
     │ Store token                  │                            │
     │                              │                            │
     │ GET /api/projects            │                            │
     │ Authorization: Bearer <jwt>  │                            │
     ├─────────────────────────────▶│ Verify JWT                 │
     │                              │ Extract user_id             │
     │                              │ Query projects              │
     │◀─────────────────────────────┤ projects                    │
     │                              │                            │
```

### Security Layers

1. **Input Validation** - DTO validation with class-validator
2. **SQL Injection Protection** - TypeORM parameterized queries
3. **Password Security** - Bcrypt hashing
4. **JWT Authentication** - Token-based auth with expiration
5. **Role-Based Access Control** - Guards for route protection
6. **HTTPS** - TLS encryption in production

---

## MCP Server Architecture

### Model Context Protocol Server

The MCP server provides tools for AI agents to interact with the codebase:

```
┌─────────────────────────────────────────────────────────────┐
│                      AI Agent                                │
│                      (Claude Code)                           │
└──────────────────────────────────────┬──────────────────────┘
                                       │ MCP Protocol
                                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    MCP Server                                │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ search-code  │  │  read-file   │  │run-tests     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │project-struct│  │ get-db-schema│  │get-git-diff  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────────────────────┬──────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Repository                                │
│  (Source files, tests, docs, git history, etc.)            │
└─────────────────────────────────────────────────────────────┘
```

### Available MCP Tools

| Tool | Purpose | Returns |
|------|---------|---------|
| `search_code` | Search for code patterns | Matching files with line numbers |
| `read_file` | Read file contents | File contents with syntax highlighting |
| `project_structure` | Get directory tree | JSON structure of repository |
| `get_database_schema` | Get database entities | Entity relationships and fields |
| `run_tests` | Execute test suite | Test results with coverage |
| `get_git_diff` | Get git changes | Diff of staged/unstaged changes |

---

## CI/CD Architecture

### GitHub Actions Workflows

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
└──────────────────────────────────────┬──────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     Issue Created                            │
│                     (with label "ai-agent")                  │
└──────────────────────────────────────┬──────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────┐
│              .github/workflows/ai-agent.yml                  │
│  ├─ Run Planner Agent (analyze issue, create spec)           │
│  ├─ Run Coding Agent (implement tasks)                       │
│  ├─ Run Verification (npm run verify)                         │
│  ├─ Run AI Reviewer (code review)                            │
│  └─ Create/Update PR                                         │
└──────────────────────────────────────┬──────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────┐
│              .github/workflows/ci.yml                         │
│  ├─ On every PR push                                          │
│  ├─ Type checking                                             │
│  ├─ Linting                                                   │
│  ├─ Unit tests                                                │
│  ├─ E2E tests                                                 │
│  ├─ Build verification                                        │
│  └─ Security checks                                           │
└──────────────────────────────────────┬──────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────┐
│              .github/workflows/verify.yml                      │
│  ├─ Final verification before merge                            │
│  └─ All quality gates must pass                               │
└─────────────────────────────────────────────────────────────┘
```

### Quality Gates

Each gate must pass before proceeding:

1. **TypeScript Compilation** - No type errors
2. **ESLint** - No linting errors
3. **Unit Tests** - All tests passing, 80%+ coverage
4. **E2E Tests** - All critical paths passing
5. **Build Success** - Production build succeeds
6. **Security Scan** - No critical vulnerabilities

---

## Deployment Architecture

### Development Environment

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: ai_workflow_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./apps/backend
    ports:
      - "3001:3001"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://dev:dev_password@postgres:5432/ai_workflow_dev

  frontend:
    build: ./apps/frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

### Production Considerations

For production deployment, the system would use:

- **Managed PostgreSQL** (e.g., AWS RDS, Google Cloud SQL)
- **Container Registry** (e.g., Docker Hub, ECR)
- **Kubernetes or similar** for orchestration
- **CI/CD Pipeline** for automated deployments
- **Monitoring & Logging** (e.g., CloudWatch, Datadog)

---

## Architecture Decision Records (ADRs)

### ADR-001: Monorepo vs Polyrepo

**Decision**: Use monorepo with Yarn Workspaces

**Rationale**:
- Shared types between frontend and backend
- Unified testing and CI/CD
- Easier for AI agents to understand full context
- Simpler dependency management

**Consequences**:
- All code in one repository
- Shared release cycle (acceptable for demo)
- Some complexity in workspace configuration

### ADR-002: GitHub Actions vs External Orchestration

**Decision**: Use GitHub Actions for orchestration

**Rationale**:
- Native GitHub integration
- No additional infrastructure
- Issues and PRs are the natural workflow
- Sufficient for our use case

**Consequences**:
- Tied to GitHub ecosystem
- Some limitations on workflow complexity
- Free for public repositories

### ADR-003: REST vs GraphQL

**Decision**: Use REST API

**Rationale**:
- Simpler to implement and maintain
- Better caching with standard HTTP
- Easier for AI agents to work with
- Sufficient for our needs

**Consequences**:
- Potential over-fetching of data
- Multiple requests for related data
- Trade-off acceptable for MVP

---

## Future Considerations

### Scalability

- **Horizontal scaling**: Stateless backend design allows multiple instances
- **Database scaling**: Read replicas, connection pooling
- **Caching**: Redis for session storage and API caching

### Monitoring

- **Application metrics**: Request rate, error rate, latency
- **Business metrics**: User activity, task completion rates
- **AI agent metrics**: Agent success rate, retry rate

### Extensibility

- **Plugin system**: Allow custom AI agent tools
- **Webhook system**: External integrations
- **API extensions**: Third-party integrations

---

## Document Maintenance

This architecture document should be updated when:

- New modules are added
- Major architectural decisions are made
- Technology stack changes
- Security requirements evolve

Maintain architecture diagrams alongside code changes to ensure documentation remains accurate.
