# AGENTS.md

AI Coding Agent Rules for the ai-native-fullstack-workflow project.

This document defines the rules and guidelines that AI coding agents must follow when working on this codebase. It serves as reusable project context that prevents the need for repeated prompts.

---

## Table of Contents

1. [Project Architecture Rules](#project-architecture-rules)
2. [TypeScript Rules](#typescript-rules)
3. [Backend Rules (NestJS)](#backend-rules-nestjs)
4. [Frontend Rules (Next.js)](#frontend-rules-nextjs)
5. [Database Rules (TypeORM)](#database-rules-typeorm)
6. [API Design Rules](#api-design-rules)
7. [Testing Requirements](#testing-requirements)
8. [Security Rules](#security-rules)
9. [Git Rules](#git-rules)
10. [Documentation Rules](#documentation-rules)
11. [Rules for Modifying Existing Code](#rules-for-modifying-existing-code)
12. [Rules for Database Migrations](#rules-for-database-migrations)
13. [Rules for Writing Tests](#rules-for-writing-tests)
14. [Rules for Handling Ambiguous Requirements](#rules-for-handling-ambiguous-requirements)
15. [Definition of Done](#definition-of-done)

---

## Project Architecture Rules

### Monorepo Structure

The project uses Yarn Workspaces with the following structure:

```
ai-native-fullstack-workflow/
├── apps/
│   ├── frontend/          # Next.js application
│   └── backend/           # NestJS application
├── packages/
│   ├── shared-types/      # Shared TypeScript types
│   ├── shared-utils/      # Shared utilities
│   └── eslint-config/     # Shared ESLint config
└── mcp-server/            # Model Context Protocol server
```

### Architecture Principles

1. **Separation of Concerns**: Frontend and backend are separate applications communicating via API.
2. **Shared Types**: Use `packages/shared-types/` for interfaces shared between frontend and backend.
3. **Module Organization**: Backend is organized by feature modules (users, projects, tasks, comments).
4. **Dependency Direction**: Frontend may depend on shared-types, but shared-types must never depend on frontend or backend.

### Module Structure

**Backend modules must contain:**
- `*.entity.ts` - TypeORM entity
- `*.dto.ts` - Data transfer objects
- `*.service.ts` - Business logic
- `*.controller.ts` - API endpoints
- `*.module.ts` - Module definition
- `*.spec.ts` - Unit tests

**Frontend organization:**
- `app/` - Next.js App Router pages
- `components/` - Reusable React components
- `lib/` - Utilities and API clients
- `types/` - Frontend-specific types

---

## TypeScript Rules

### General Type Safety

1. **Never use `any`** - Use `unknown` if the type is truly unknown, then narrow the type.
2. **Strict mode enabled** - All TypeScript strict flags must be enabled.
3. **No implicit any** - All variables, parameters, and return types must be explicitly typed.
4. **Prefer interfaces for object shapes** - Use interfaces for public APIs and object shapes.
5. **Prefer types for unions/intersections** - Use type aliases for union types, intersections, and computed types.

### Type Definitions

```typescript
// ✅ Good - Explicit types
interface CreateUserDto {
  email: string;
  password: string;
  name: string;
}

async function createUser(dto: CreateUserDto): Promise<User> {
  // ...
}

// ❌ Bad - Implicit types
async function createUser(dto) {
  // ...
}
```

### Type Imports/Exports

```typescript
// ✅ Good - Use type-only imports when possible
import type { User } from './user.entity';
import { UserService } from './user.service';

// ❌ Bad - Value import when only type is needed
import { User } from './user.entity';
```

### Null/Undefined Handling

```typescript
// ✅ Good - Explicit optional
function findUser(id: string): Promise<User | null> {
  // ...
}

// ❌ Bad - Implicit undefined
function findUser(id: string): Promise<User> {
  // ...
}
```

---

## Backend Rules (NestJS)

### Module Structure

Each feature module must follow this pattern:

```typescript
// users.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

### Service Layer Rules

1. **Business logic in services** - Controllers should only handle HTTP concerns.
2. **Injectable services** - All services must be marked with `@Injectable()`.
3. **Dependency injection** - Use constructor injection for dependencies.

```typescript
// ✅ Good
@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(dto);
    return await this.usersRepository.save(user);
  }
}

// ❌ Bad - Business logic in controller
@Post()
async create(@Body() dto: CreateUserDto) {
  // Don't put business logic here
}
```

### Controller Rules

1. **Use DTOs for validation** - All request bodies must be validated via DTOs.
2. **HTTP status codes** - Use appropriate status codes (201 for create, 200 for update, etc.).
3. **Error handling** - Use NestJS built-in exceptions and exception filters.

```typescript
// ✅ Good
@Post()
@HttpCode(HttpStatus.CREATED)
async create(@Body() dto: CreateUserDto): Promise<User> {
  return this.usersService.create(dto);
}

@Get(':id')
async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
  const user = await this.usersService.findOne(id);
  if (!user) {
    throw new NotFoundException(`User #${id} not found`);
  }
  return user;
}
```

### DTO Validation

Use `class-validator` for all DTOs:

```typescript
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  name: string;
}
```

### Exception Handling

```typescript
// ✅ Good - Use built-in exceptions
if (!user) {
  throw new NotFoundException('User not found');
}

if (!hasAccess) {
  throw new ForbiddenException('Access denied');
}

// ❌ Bad - Manual error responses
return { status: 404, message: 'Not found' };
```

---

## Frontend Rules (Next.js)

### App Router Structure

Use Next.js 13+ App Router:

```typescript
// app/users/page.tsx
export default function UsersPage() {
  // ...
}
```

### Component Organization

```typescript
// ✅ Good - Separate concerns
// components/users/UserList.tsx - Presentational
// components/users/UserListContainer.tsx - Data fetching
// app/users/page.tsx - Page composition

// ❌ Bad - Everything in one file
```

### Data Fetching

```typescript
// ✅ Good - Use Server Components by default
async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_URL}/users`, { cache: 'no-store' });
  return res.json();
}

// ✅ Good - Use Client Components for interactivity
'use client';
import { useState } from 'react';
```

### API Client

Create a centralized API client in `lib/api-client.ts`:

```typescript
export const apiClient = {
  users: {
    list: () => fetch('/api/users').then(r => r.json()),
    get: (id: string) => fetch(`/api/users/${id}`).then(r => r.json()),
    create: (data: CreateUserDto) => fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(r => r.json()),
  },
};
```

### Error Boundaries

Wrap routes with error boundaries:

```typescript
// app/users/error.tsx
'use client';
export default function Error({ error }: { error: Error }) {
  return <div>Error: {error.message}</div>;
}
```

---

## Database Rules (TypeORM)

### Entity Definitions

```typescript
// ✅ Good - Complete entity with decorators
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}

// ❌ Bad - Incomplete entity
@Entity('users')
export class User {
  @PrimaryColumn()
  id: number;
}
```

### Relationships

```typescript
// ✅ Good - Explicit relationships with eager loading options
@Entity('projects')
export class Project {
  @OneToMany(() => Task, task => task.project)
  tasks: Task[];
}

@Entity('tasks')
export class Task {
  @ManyToOne(() => Project, project => project.tasks)
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
```

### Repository Pattern

Always use TypeORM Repository pattern:

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }
}
```

---

## API Design Rules

### RESTful Conventions

| Method | Path | Description | Success Code |
|--------|------|-------------|--------------|
| GET | /users | List all users | 200 |
| GET | /users/:id | Get single user | 200 |
| POST | /users | Create user | 201 |
| PATCH | /users/:id | Update user | 200 |
| DELETE | /users/:id | Delete user | 204 |

### Response Format

```typescript
// ✅ Good - Consistent response shape
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-01T00:00:00Z"
}

// ❌ Bad - Inconsistent or nested unnecessarily
{
  "data": {
    "user": {
      "attributes": { ... }
    }
  },
  "meta": { ... }
}
```

### Error Format

```typescript
// ✅ Good - Clear error response
{
  "statusCode": 404,
  "message": "User #123 not found",
  "error": "Not Found"
}
```

### Pagination

```typescript
// Query params: ?page=1&limit=10
interface PaginatedDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

## Testing Requirements

### Backend Testing (Vitest)

Vitest is the single test runner across the monorepo (NestJS 12 packages are ESM-only; Vitest runs them natively). Globals (`describe`, `it`, `expect`) are enabled via `vitest/globals` - no imports needed.

**Unit tests** - Test services in isolation:

```typescript
describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(() => {
    const module = Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  it('should create a user', async () => {
    const dto = { email: 'test@example.com', password: 'password123', name: 'Test' };
    const result = await service.create(dto);
    expect(result).toHaveProperty('id');
  });
});
```

**E2E tests** - Test HTTP endpoints:

```typescript
describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ email: 'test@example.com', password: 'password123', name: 'Test' })
      .expect(201);
  });
});
```

### Frontend Testing

**Component tests** - Test React components:

```typescript
describe('UserList', () => {
  it('renders users', () => {
    const users = [{ id: 1, name: 'John' }];
    render(<UserList users={users} />);
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
```

### Test Coverage Goals

- **Unit tests**: 80%+ coverage for business logic
- **E2E tests**: Cover all critical user flows
- **Always test**: New features, bug fixes, edge cases

---

## Security Rules

### Authentication & Authorization

1. **Never store plain-text passwords** - Always use hashing (bcrypt, argon2).
2. **JWT for authentication** - Use JWT tokens with appropriate expiration.
3. **Role-based access control** - Use guards for route protection.

```typescript
// ✅ Good - Use guards
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Post()
async create(@Body() dto: CreateUserDto) {
  // Only admins can create users
}
```

### Input Validation

1. **Validate all inputs** - Never trust client-side validation.
2. **Sanitize database queries** - Use TypeORM parameterized queries (no raw SQL with interpolation).
3. **Length limits** - Enforce reasonable length limits on strings.

### Sensitive Data

1. **Never log passwords or tokens** - Redact sensitive information from logs.
2. **Use environment variables** - Store secrets in `.env` files (never committed).
3. **HTTPS in production** - Always use HTTPS for API calls.

### Common Vulnerabilities

- **SQL Injection**: Use TypeORM parameterized queries only
- **XSS**: Sanitize user input, use React's built-in escaping
- **CSRF**: Use CSRF tokens for state-changing operations
- **Authorization**: Always check permissions on server-side

---

## Git Rules

### Commit Convention

Use conventional commits:

```
feat: add user CRUD operations
fix: resolve task status update bug
docs: update API documentation
test: add integration tests for projects
refactor: extract user service to separate module
chore: update dependencies
```

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: feat, fix, docs, style, refactor, test, chore

### Branch Strategy

- `main` - Production-ready code only
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches
- `docs/*` - Documentation updates

### Pull Request Requirements

1. **Describe the change** - What and why, not just how
2. **Reference issues** - Link related GitHub issues
3. **Tests included** - New features must have tests
4. **No merge conflicts** - Resolve all conflicts before review

---

## Documentation Rules

### Code Comments

```typescript
// ✅ Good - Comment WHY, not WHAT
// We hash passwords with bcrypt because it's slow and resists rainbow table attacks
const hash = await bcrypt.hash(password, 10);

// ❌ Bad - Obvious comments
// Create a variable
const x = 1;
```

### JSDoc for Public APIs

```typescript
/**
 * Creates a new user in the system
 * @param dto - User creation data
 * @returns The created user with generated ID
 * @throws ConflictException if email already exists
 */
async create(dto: CreateUserDto): Promise<User> {
  // ...
}
```

### README Updates

When adding features, update:
- Architecture diagrams
- API endpoint documentation
- Setup instructions
- Environment variable requirements

---

## Rules for Modifying Existing Code

### Read Before Modifying

1. **Always Read the file first** - Before making any changes, read the entire file.
2. **Understand the context** - Look for related files and patterns.
3. **Search for existing implementations** - Don't duplicate functionality.

### Preservation of Functionality

1. **Preserve existing behavior** - Changes must not break existing functionality.
2. **Update tests** - When changing behavior, update corresponding tests.
3. **Deprecate before removing** - Mark old APIs as deprecated before removal.

### Refactoring

```typescript
// ✅ Good - Refactor in small steps
// Step 1: Extract function (no behavior change)
function extractLogic() { ... }

// Step 2: Update tests to cover new function
// Step 3: Use extracted function
// Step 4: Remove old code

// ❌ Bad - Big Bang refactoring
// Change everything at once, tests break, hard to review
```

---

## Rules for Database Migrations

### Migration Creation

1. **Never modify existing migrations** - Create a new migration instead.
2. **Always reversible** - Ensure `up()` and `down()` methods both work.
3. **Test migrations** - Run migrations up and down in development.

```typescript
// ✅ Good - Complete migration
export class CreateUserTable1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true },
          { name: 'email', type: 'varchar', isUnique: true },
          { name: 'password', type: 'varchar' },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
```

### Migration in Production

1. **Never run migrations automatically in CI** - Manual approval required.
2. **Backup before migration** - Always backup production database.
3. **Run on a copy first** - Test migrations on staging first.

---

## Rules for Writing Tests

### Test Structure (AAA Pattern)

```typescript
it('should update task status to DONE', async () => {
  // Arrange
  const task = await taskService.create({ title: 'Test', status: TaskStatus.TODO });
  const updateDto = { status: TaskStatus.DONE };

  // Act
  const result = await taskService.update(task.id, updateDto);

  // Assert
  expect(result.status).toBe(TaskStatus.DONE);
});
```

### Test Independence

1. **No shared state** - Each test should be independent.
2. **Clean up** - Use `afterEach` to clean up test data.
3. **Deterministic** - Tests should always produce the same result.

### Mocking Rules

```typescript
// ✅ Good - Mock at boundary
vi.mock('lib/email', () => ({
  sendEmail: vi.fn(),
}));

// ❌ Bad - Mock implementation details
vi.spyOn(service, 'internalMethod').mockReturnValue(true);
```

---

## Rules for Handling Ambiguous Requirements

### When Requirements Are Unclear

1. **Ask clarifying questions** - Don't make assumptions about ambiguous requirements.
2. **Propose options** - When multiple interpretations exist, propose options to the user.
3. **Document assumptions** - If proceeding with an assumption, document it clearly.

### Example Process

```
Ambiguous requirement: "Implement user search"

Clarifying questions:
- What fields should be searchable? (name, email, both?)
- Should search be exact match or fuzzy?
- Should results be paginated?
- What about sorting options?

Assumption documentation:
// ASSUMPTION: User search searches name and email fields
// ASSUMPTION: Search is case-insensitive partial match
// ASSUMPTION: Results are paginated with default limit of 10
```

### When to Proceed vs. Ask

**Proceed** when:
- The ambiguity is minor and doesn't affect architecture
- There's an obvious default/standard approach
- The feature can be easily changed later

**Ask** when:
- The ambiguity affects API design
- Multiple valid approaches exist with trade-offs
- The ambiguity impacts security or data integrity

---

## Definition of Done

A task is **NOT** considered complete unless:

1. **Code compiles** - `yarn build` succeeds for all affected packages
2. **TypeScript type checking passes** - No `any` types, no type errors
3. **ESLint passes** - No linting errors in modified files
4. **Relevant tests pass** - All new and existing tests pass
5. **Production build succeeds** - Application can be built for production
6. **No security regressions** - No obvious security issues introduced
7. **Documentation updated** - Affected documentation is updated
8. **Git diff reviewed** - Changes are reviewed before commit

### Verification Command

Run this before marking a task complete:

```bash
# Full verification
yarn verify

# Individual checks
yarn type-check
yarn lint
yarn test
yarn build
```

### Pre-Commit Checklist

- [ ] Code compiles
- [ ] TypeScript types pass
- [ ] ESLint passes
- [ ] Tests pass
- [ ] Build succeeds
- [ ] No obvious security issues
- [ ] Documentation updated
- [ ] Diff reviewed

---

## Agent Workflow Summary

When an agent receives a task:

1. **Read** - Read all relevant files to understand context
2. **Plan** - Create a brief implementation plan
3. **Implement** - Write code following these rules
4. **Test** - Write/update tests
5. **Verify** - Run verification command
6. **Review** - Review own changes
7. **Report** - Summarize what was done

Only when all verification passes should the agent report the task as complete.
