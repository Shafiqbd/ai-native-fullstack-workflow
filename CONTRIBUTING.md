# CONTRIBUTING.md

Contributing guidelines for the ai-native-fullstack-workflow project.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Code Standards](#code-standards)
4. [Commit Conventions](#commit-conventions)
5. [Pull Request Guidelines](#pull-request-guidelines)
6. [Testing Requirements](#testing-requirements)
7. [AI Agent Contribution](#ai-agent-contribution)

---

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** v24 LTS (>= 24.15) - see `.nvmrc`
- **Yarn** v1.22+ or higher
- **Docker** and **Docker Compose** (for local database)
- **Git** for version control

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-native-fullstack-workflow.git
   cd ai-native-fullstack-workflow
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Start the development environment**
   ```bash
   # Start PostgreSQL
   docker-compose up -d postgres

   # Set up environment variables
   cp .env.example .env
   # Edit .env with your configuration

   # Run database migrations
   yarn migration:run
   ```

4. **Run the development servers**
   ```bash
   # Terminal 1 - Backend
   cd apps/backend
   yarn start:dev

   # Terminal 2 - Frontend
   cd apps/frontend
   yarn dev
   ```

5. **Verify installation**
   ```bash
   yarn verify
   ```

### Repository Structure

```
ai-native-fullstack-workflow/
├── apps/
│   ├── backend/          # NestJS API
│   └── frontend/         # Next.js UI
├── packages/
│   ├── shared-types/     # Shared TypeScript types
│   └── shared-utils/     # Shared utilities
├── mcp-server/           # Model Context Protocol server
├── scripts/              # Automation scripts
└── docs/                 # Additional documentation
```

---

## Development Workflow

### For Human Contributors

1. **Create an issue** describing the change
2. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Implement your changes** following [AGENTS.md](AGENTS.md) rules
4. **Write tests** for your changes
5. **Run verification** locally
   ```bash
   yarn verify
   ```
6. **Commit** your changes using conventional commits
7. **Push** to your branch
8. **Create a pull request** with a clear description

### For AI Agents

AI agents follow the workflow defined in [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md):

1. Planner Agent creates specification
2. Coding Agent implements tasks
3. Verification Harness validates changes
4. AI Reviewer checks quality (optional)
5. GitHub PR is created
6. Human approves and merges

---

## Code Standards

### TypeScript Rules

- **No `any` types** - Use `unknown` or proper types
- **Explicit typing** - All variables, parameters, and returns must be typed
- **Strict mode** - TypeScript strict flags enabled
- **Type-only imports** - Use `import type { X }` when only importing types

```typescript
// ✅ Good
import type { User } from './user.entity';

async function getUser(id: number): Promise<User | null> {
  // ...
}

// ❌ Bad
import { User } from './user.entity';

async function getUser(id) {
  // ...
}
```

### Code Style

- **2 space indentation** - Consistent spacing
- **Semicolons required** - Always use semicolons
- **Single quotes for strings** - Except when JSON requires double quotes
- **Trailing commas** - Use trailing commas in multi-line arrays/objects

```typescript
// ✅ Good
const user = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
};

// ❌ Bad
const user = {id: 1, name: "John", email: 'john@example.com'}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `UserService` |
| Interfaces | PascalCase | `IUserRepository` |
| Types/Enums | PascalCase | `TaskStatus` |
| Functions/Methods | camelCase | `getUserById()` |
| Variables | camelCase | `userName` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Files | kebab-case | `user.service.ts` |

---

## Commit Conventions

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

| Type | Purpose | Example |
|------|---------|---------|
| `feat` | New feature | `feat(users): add user registration` |
| `fix` | Bug fix | `fix(auth): resolve token expiration issue` |
| `docs` | Documentation only | `docs(readme): update setup instructions` |
| `style` | Code style (no logic change) | `style(backend): format imports` |
| `refactor` | Refactoring code | `refactor(tasks): extract task validation` |
| `test` | Adding or updating tests | `test(projects): add project CRUD tests` |
| `chore` | Maintenance tasks | `chore(deps): update dependencies` |

### Examples

```bash
# Good
git commit -m "feat(tasks): add task assignment feature

Implement the ability to assign tasks to project members.

- Add assigneeId to Task entity
- Add validation for project membership
- Add email notification on assignment

Closes #42"

# Bad
git commit -m "update stuff"
```

---

## Pull Request Guidelines

### PR Title Format

Use the same format as commits:

```
feat(users): add user CRUD operations
fix(tasks): resolve status update bug
```

### PR Description Template

```markdown
## Summary
Brief description of what this PR does.

## Related Issue
Closes #42

## Changes
- Change 1
- Change 2
- etc.

## Testing
- [x] Unit tests added/updated
- [x] Integration tests added/updated
- [x] E2E tests added/updated (if applicable)
- [x] All tests pass

## Verification
- [x] `yarn type-check` passes
- [x] `yarn lint` passes
- [x] `yarn build` succeeds
- [x] No obvious security issues

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code follows AGENTS.md rules
- [ ] Tests cover new functionality
- [ ] Documentation updated (if needed)
- [ ] No merge conflicts
```

### PR Review Process

1. **Automated checks** (CI)
   - TypeScript compilation
   - ESLint
   - All tests
   - Production build

2. **Code review**
   - Review changes for correctness
   - Check adherence to AGENTS.md
   - Verify test coverage
   - Approve or request changes

3. **Merge**
   - Squash merge preferred
   - Delete branch after merge

---

## Testing Requirements

### Backend Testing (NestJS + Vitest)

**Unit tests** for services and business logic:

```typescript
describe('UsersService', () => {
  it('should create a user', async () => {
    const dto = { email: 'test@example.com', password: 'password123', name: 'Test' };
    const result = await service.create(dto);
    expect(result).toHaveProperty('id');
    expect(result.email).toBe(dto.email);
  });
});
```

**E2E tests** for API endpoints:

```typescript
describe('UsersController (e2e)', () => {
  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ email: 'test@example.com', password: 'password123', name: 'Test' })
      .expect(201);
  });
});
```

### Frontend Testing

**Component tests** using React Testing Library:

```typescript
describe('UserList', () => {
  it('renders users', () => {
    const users = [{ id: 1, name: 'John' }];
    render(<UserList users={users} />);
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
```

### Test Commands

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage

# Run E2E tests
yarn test:e2e
```

### Coverage Requirements

- **Unit tests**: 80%+ coverage for business logic
- **E2E tests**: Cover all critical user flows
- **New features**: Must include tests

---

## AI Agent Contribution

### When AI Agents Contribute

This project uses AI agents (via Claude Code) to help with development. AI agents:

- **Analyze requirements** and create specifications
- **Implement features** following AGENTS.md rules
- **Write tests** alongside code
- **Verify changes** before submitting

### AI Agent Workflow

1. **Issue created** with `ai-agent` label
2. **Planner Agent** creates specification
3. **Coding Agent** implements tasks
4. **Verification Harness** validates changes
5. **AI Reviewer** checks quality (optional)
6. **PR created** for human review

### Human Approval Required

AI agents **cannot**:
- Merge their own pull requests
- Deploy to production
- Make architectural decisions without approval
- Modify security-critical code without review

Humans **must**:
- Approve specifications before implementation
- Review and approve pull requests
- Approve production deployments
- Handle ambiguous requirements

### Contributing as AI Agent

If you're an AI agent contributing to this project:

1. **Read AGENTS.md** - Follow all rules defined there
2. **Read existing code** - Before modifying, read the full file
3. **Write tests** - Always include tests with implementation
4. **Run verification** - Never report complete without `yarn verify`
5. **Be explicit** - Clearly communicate what you did and why

---

## Definition of Done

A contribution is complete when:

- [ ] Code compiles (`yarn build`)
- [ ] TypeScript type checking passes (`yarn type-check`)
- [ ] ESLint passes (`yarn lint`)
- [ ] All tests pass (`yarn test`)
- [ ] Production build succeeds
- [ ] No obvious security issues
- [ ] Documentation updated (if needed)
- [ ] Git diff reviewed
- [ ] Pull request approved (for significant changes)

Run the verification command before submitting:

```bash
yarn verify
```

---

## Getting Help

### Resources

- **[AGENTS.md](AGENTS.md)** - AI coding agent rules
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture
- **[DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md)** - AI-native workflow
- **[README.md](README.md)** - Project overview

### Asking Questions

1. **Check existing documentation** - Your question may already be answered
2. **Search issues** - Similar issues may have been discussed
3. **Create an issue** - For bugs or feature requests
4. **Start a discussion** - For questions or proposals

### Reporting Issues

When reporting issues, include:

- **Clear description** of the problem
- **Steps to reproduce** the issue
- **Expected behavior** vs. **actual behavior**
- **Environment information** (OS, Node version, etc.)
- **Relevant logs** or error messages

---

## Code of Conduct

### Our Pledge

We are committed to making this project a welcoming place for everyone, regardless of:
- Experience level
- Technology stack
- Identity or background

### Our Standards

**Positive behavior:**
- Using welcoming and inclusive language
- Respecting differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

**Unacceptable behavior:**
- Harassment or trolling
- Derailing conversations
- Unprofessional conduct
- Personal attacks

### Enforcement

Project maintainers may remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned with this Code of Conduct.

---

## License

By contributing to this project, you agree that your contributions will be licensed under the [MIT License](LICENSE).
