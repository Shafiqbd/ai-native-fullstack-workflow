# DEVELOPMENT_WORKFLOW.md

AI-Native Development Workflow for the ai-native-fullstack-workflow project.

---

## Table of Contents

1. [Workflow Overview](#workflow-overview)
2. [Issue Creation Guidelines](#issue-creation-guidelines)
3. [Planning Phase](#planning-phase)
4. [Implementation Phase](#implementation-phase)
5. [Verification Phase](#verification-phase)
6. [Review Phase](#review-phase)
7. [Deployment Phase](#deployment-phase)
8. [Agent Workflows](#agent-workflows)
9. [Human Responsibilities](#human-responsibilities)
10. [Troubleshooting Guide](#troubleshooting-guide)

---

## Workflow Overview

### The AI-Native Development Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          GitHub Issue Created                                │
│                    (User creates issue with requirements)                    │
└───────────────────────────────────────┬─────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Planner Agent                                       │
│  • Analyzes issue requirement                                               │
│  • Inspects repository context (via MCP)                                    │
│  • Creates implementation specification                                     │
│  • Defines acceptance criteria                                              │
│  • Decomposes into agent-sized tasks                                        │
│  • Posts specification as issue comment                                    │
└───────────────────────────────────────┬─────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Coding Agent                                        │
│  • Reads task specification                                                 │
│  • Reads relevant code files                                                │
│  • Implements changes following AGENTS.md rules                            │
│  • Writes or updates tests                                                  │
│  • Runs verification                                                        │
│  • Iterates on failures                                                     │
└───────────────────────────────────────┬─────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Verification Harness                                │
│  • npm run verify                                                           │
│  • TypeScript type checking                                                 │
│  • ESLint                                                                   │
│  • Unit tests                                                               │
│  • Integration tests                                                        │
│  • E2E tests (where applicable)                                            │
│  • Production build                                                         │
│  → Returns clear PASS or FAIL                                               │
└───────────────────────────────────────┬─────────────────────────────────────┘
                                        │
                              ┌─────────┴─────────┐
                              │                   │
                         PASS │                   │ FAIL
                              │                   │
                              ▼                   ▼
                    ┌───────────────────┐  ┌─────────────────┐
                    │  AI Reviewer Agent │  │  Feedback Loop   │
                    │  (Optional step)   │  │  → Retry limit   │
                    │  • Code quality    │  │  → Manual review │
                    │  • Security check  │  └─────────────────┘
                    │  • Best practices  │           │
                    └─────────┬───────────┘           │
                              │                       │
                              │ (on approval)         │
                              │                       │
                              ▼                       │
                    ┌───────────────────┐             │
                    │  GitHub PR         │◄────────────┘
                    │  • Auto-created    │
                    │  • Spec attached   │
                    │  • Test results    │
                    └─────────┬───────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │  CI Quality Gates  │
                    │  • Type check      │
                    │  • Lint            │
                    │  • Tests           │
                    │  • Build           │
                    │  • Security scan   │
                    └─────────┬───────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │  Human Review      │
                    │  • Review changes   │
                    │  • Approve/reject  │
                    │  • Request changes │
                    └─────────┬───────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │  Merge             │
                    │  • Squash/merge    │
                    │  • Update main     │
                    └─────────┬───────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │  Deployment        │
                    │  • Automated if all│
                    │    gates pass      │
                    └───────────────────┘
```

### Key Principles

1. **Specification before implementation** - No code without a clear spec
2. **Deterministic verification** - PASS/FAIL, not "looks good"
3. **Human approval required** - Agents suggest, humans decide
4. **Iterative improvement** - Feedback loops for failures
5. **Full traceability** - Every change links to an issue

---

## Issue Creation Guidelines

### Issue Template

Use the `feature.md` template when creating issues:

```markdown
## Type
- [ ] Feature
- [ ] Bug Fix
- [ ] Refactoring
- [ ] Documentation

## Summary
Brief description of what needs to be done.

## Detailed Requirements
- Requirement 1
- Requirement 2
- etc.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- etc.

## Additional Context
Any relevant context, constraints, or preferences.
```

### Good Issue Example

```markdown
## Type
- [x] Feature

## Summary
Add task assignment feature allowing users to assign tasks to project members.

## Detailed Requirements
- Tasks should have an optional `assigneeId` field referencing a User
- Only project members can be assigned tasks
- Assigned tasks should be visible in a "My Tasks" view
- Email notification should be sent when a task is assigned

## Acceptance Criteria
- [ ] Task entity has assigneeId field (nullable)
- [ ] API accepts assigneeId in task creation/update
- [ ] API validates assignee is a project member
- [ ] Frontend shows assignee in task list
- [ ] Frontend provides user selector for assignment
- [ ] Email notification sent on assignment
- [ ] "My Tasks" page shows assigned tasks
- [ ] Tests cover all assignment scenarios

## Additional Context
Priority: High
Complexity: Medium
```

### Bad Issue Example

```markdown
Need task assignment
```

**Why it's bad:**
- No requirements specified
- No acceptance criteria
- No context for the agent

---

## Planning Phase

### Planner Agent Responsibilities

When an issue is created with the `ai-agent` label:

1. **Analyze the requirement**
   - Parse the issue title, description, and acceptance criteria
   - Identify ambiguous requirements and ask clarifying questions
   - Determine the scope of work

2. **Inspect repository context**
   - Use MCP tools to understand codebase structure
   - Find related code and patterns
   - Identify dependencies and potential conflicts

3. **Create specification**
   - Define clear acceptance criteria
   - Identify files that need modification
   - Determine implementation approach
   - Estimate complexity

4. **Decompose into tasks**
   - Break down into small, agent-sized tasks
   - Each task should be completable in one agent run
   - Define task dependencies

5. **Post specification**
   - Add specification as issue comment
   - Wait for human approval before implementation

### Specification Format

```markdown
## Implementation Specification

### Overview
Brief description of what will be implemented.

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- etc.

### Implementation Tasks

#### Task 1: [Task Name]
**Files to modify:**
- `path/to/file1.ts`
- `path/to/file2.ts`

**Implementation approach:**
- Step 1
- Step 2

**Tests required:**
- Test case 1
- Test case 2

#### Task 2: [Task Name]
...

### Dependencies
- Task 2 depends on Task 1
- etc.

### Estimated Complexity
Low/Medium/High

### Risk Assessment
- Potential risks and mitigation strategies
```

### Planning Completion

Planning is complete when:
- [ ] Specification posted to issue
- [ ] Acceptance criteria are clear and testable
- [ ] Tasks are decomposed appropriately
- [ ] Dependencies are identified
- [ ] Human approves the specification

---

## Implementation Phase

### Coding Agent Workflow

When a task is assigned to the Coding Agent:

1. **Read the specification**
   - Understand the acceptance criteria
   - Identify the files to modify

2. **Read existing code**
   - Read all files that will be modified
   - Understand existing patterns
   - Find related code

3. **Plan the implementation**
   - Brief mental model of changes
   - Identify potential conflicts
   - Consider edge cases

4. **Implement changes**
   - Follow AGENTS.md rules
   - Write clean, typed code
   - Preserve existing functionality

5. **Write/update tests**
   - Add tests for new functionality
   - Update tests for modified functionality
   - Ensure test coverage

6. **Run verification**
   - Execute `npm run verify`
   - Fix any failures

7. **Iterate on failures**
   - If verification fails, fix and retry
   - Maximum retry limit: 3
   - If still failing, request human help

### Implementation Rules

The Coding Agent MUST:

- [ ] Read all files before modifying them
- [ ] Follow AGENTS.md rules
- [ ] Write tests with implementation
- [ ] Run verification before reporting complete
- [ ] Report any ambiguities encountered
- [ ] Not make assumptions about requirements

The Coding Agent MUST NOT:

- [ ] Skip verification
- [ ] Modify files without reading them first
- [ ] Use `any` type
- [ ] Skip writing tests
- [ ] Report complete when verification fails

### Task Completion Criteria

A task is complete only when:
- [ ] Code compiles
- [ ] TypeScript type checking passes
- [ ] ESLint passes
- [ ] All tests pass
- [ ] Production build succeeds
- [ ] No obvious security issues
- [ ] Documentation updated (if needed)

---

## Verification Phase

### Verification Harness

The verification command is:

```bash
npm run verify
```

This command runs:

1. **TypeScript Type Checking**
   ```bash
   yarn type-check
   ```
   - Must pass with no errors
   - No `any` types allowed

2. **ESLint**
   ```bash
   yarn lint
   ```
   - Must pass with no errors
   - Warnings are acceptable but should be fixed

3. **Unit Tests**
   ```bash
   yarn test
   ```
   - All tests must pass
   - Coverage threshold: 80% for business logic

4. **E2E Tests** (if applicable)
   ```bash
   yarn test:e2e
   ```
   - All critical path tests must pass

5. **Production Build**
   ```bash
   yarn build
   ```
   - Must build successfully

### Verification Results

**PASS result:**
```bash
✓ TypeScript compilation passed
✓ ESLint passed
✓ Unit tests passed (45/45)
✓ E2E tests passed (8/8)
✓ Production build succeeded

VERIFICATION: PASSED
```

**FAIL result:**
```bash
✗ TypeScript compilation failed
  src/users/users.service.ts:45:23 - Type 'string' is not assignable to type 'number'

VERIFICATION: FAILED
Please fix the errors above and retry.
```

### Handling Failures

When verification fails:

1. **Agent analyzes the failure**
   - Understand the error message
   - Identify the root cause

2. **Agent fixes the issue**
   - Make targeted fixes
   - Don't change unrelated code

3. **Re-run verification**
   - Verify the fix worked
   - Check for new errors

4. **Retry loop**
   - Maximum 3 retries
   - If still failing after 3 retries, request human help

---

## Review Phase

### AI Reviewer (Optional)

After verification passes, the AI Reviewer can review the changes:

1. **Code Quality**
   - Check for code smells
   - Verify adherence to AGENTS.md
   - Look for optimization opportunities

2. **Security**
   - Check for obvious security issues
   - Verify input validation
   - Check for sensitive data exposure

3. **Best Practices**
   - Verify TypeScript best practices
   - Check NestJS/Next.js patterns
   - Ensure test coverage

4. **Documentation**
   - Check if documentation needs updates
   - Verify API documentation is current

### Review Report Format

```markdown
## AI Review Report

### Summary
[PASS/FAIL/WARNING]

### Code Quality
- [x] Follows AGENTS.md rules
- [x] No code smells detected
- [x] Appropriate use of TypeScript

### Security
- [x] No obvious security issues
- [x] Input validation present
- [x] No sensitive data exposure

### Best Practices
- [x] Framework patterns followed
- [x] Error handling appropriate
- [x] Test coverage adequate

### Recommendations
1. Optional improvement suggestion
2. etc.

### Conclusion
[PASS/FAIL] - The changes are [ready/not ready] for PR.
```

---

## Deployment Phase

### Pre-Deployment Checklist

Before deployment to production:

- [ ] All quality gates passed
- [ ] Human approved the PR
- [ ] Changes merged to main branch
- [ ] Database migrations prepared and tested
- [ ] Environment variables configured
- [ ] Rollback plan documented

### Deployment Process

1. **Create deployment tag**
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

2. **Run database migrations**
   ```bash
   yarn migration:run
   ```

3. **Deploy application**
   - Built by CI/CD pipeline
   - Deployed to infrastructure

4. **Smoke tests**
   - Verify core functionality
   - Check health endpoints

5. **Monitor**
   - Watch for errors
   - Monitor performance metrics

### Rollback Procedure

If deployment fails:

1. **Revert to previous version**
   ```bash
   git checkout <previous-tag>
   ```

2. **Rollback migrations** if needed
   ```bash
   yarn migration:revert
   ```

3. **Redeploy previous version**

4. **Investigate failure**

---

## Agent Workflows

### Planner Agent Workflow

```
START
  │
  ▼
Read Issue
  │
  ▼
Parse Requirements
  │
  ├─▶ Ambiguous? ──▶ Ask Clarifying Questions
  │                  │
  │                  ◀── Wait for Response
  │
  ▼
Inspect Repository (via MCP)
  │
  ├─▶ Search for related code
  ├─▶ Read affected files
  └─▶ Check for conflicts
  │
  ▼
Create Specification
  │
  ├─▶ Define acceptance criteria
  ├─▶ Decompose into tasks
  └─▶ Identify dependencies
  │
  ▼
Post Specification Comment
  │
  ▼
WAIT FOR APPROVAL
```

### Coding Agent Workflow

```
START
  │
  ▼
Read Task Specification
  │
  ▼
Read Affected Files
  │
  ▼
Plan Implementation
  │
  ▼
Implement Changes
  │
  ▼
Write/Update Tests
  │
  ▼
Run Verification
  │
  ├─▶ PASS? ──▶ Report Complete
  │
  └─▶ FAIL ──▶ Analyze Failure
                │
                ▼
                Fix Issue
                │
                ▼
                Retry (max 3)
                │
                ├─▶ PASS ──▶ Report Complete
                └─▶ FAIL (after 3) ──▶ Request Help
```

### Reviewer Agent Workflow

```
START
  │
  ▼
Get Git Diff
  │
  ▼
Analyze Changes
  │
  ├─▶ Code Quality Check
  ├─▶ Security Check
  └─▶ Best Practices Check
  │
  ▼
Generate Review Report
  │
  ▼
Post Review Comment
  │
  ▼
END
```

---

## Human Responsibilities

### Issue Creation

Humans are responsible for:
- Creating clear, well-defined issues
- Defining acceptance criteria
- Providing context and constraints
- Answering agent clarification questions

### Specification Approval

Humans must:
- Review the agent-created specification
- Verify acceptance criteria are correct
- Approve or request changes
- Approve before implementation begins

### Code Review

Humans are responsible for:
- Reviewing the final pull request
- Verifying the implementation meets requirements
- Checking for edge cases the agent missed
- Approving or requesting changes

### Deployment Approval

Humans must:
- Review the deployment checklist
- Approve production deployments
- Monitor initial deployment
- Handle rollback if needed

### When Humans Should Intervene

Humans should intervene when:
- Ambiguous requirements cannot be resolved
- Verification fails repeatedly
- Security concerns are identified
- Architecture decisions need clarification
- Performance issues arise

---

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue: Verification fails with TypeScript errors

**Possible causes:**
- Type mismatch in implementation
- Missing type imports
- Incorrect type annotations

**Solution:**
1. Check the error message carefully
2. Review type definitions
3. Ensure all imports are correct
4. Fix type annotations

#### Issue: Tests fail after implementation

**Possible causes:**
- Logic error in implementation
- Test needs updating for new behavior
- Missing test case

**Solution:**
1. Run tests individually to see specific failures
2. Review test expectations vs. implementation
3. Fix implementation or update tests as appropriate
4. Ensure test coverage is complete

#### Issue: ESLint errors

**Possible causes:**
- Code style violation
- Unused variables or imports
- Missing or incorrect formatting

**Solution:**
1. Run `yarn lint --fix` for auto-fixable issues
2. Review ESLint rules in AGENTS.md
3. Fix style violations manually
4. Remove unused code

#### Issue: Agent cannot complete task

**Possible causes:**
- Requirements are too vague
- Task is too large for one agent run
- Dependencies are unclear

**Solution:**
1. Provide more specific requirements
2. Break task into smaller sub-tasks
3. Clarify dependencies and order
4. Provide examples of expected behavior

#### Issue: Database migration fails

**Possible causes:**
- Migration conflicts with existing data
- Migration is not reversible
- Database is in inconsistent state

**Solution:**
1. Never modify existing migrations - create new ones
2. Test migrations on development database first
3. Ensure down() method is implemented correctly
4. Backup database before production migrations

### Getting Help

If issues persist:

1. **Check documentation**
   - Review AGENTS.md for rules
   - Review ARCHITECTURE.md for design
   - Check related issues and PRs

2. **Ask clarifying questions**
   - Be specific about the problem
   - Include error messages
   - Describe what you've tried

3. **Request human review**
   - When verification fails repeatedly
   - When architectural decisions are unclear
   - When security concerns arise

---

## Workflow Evolution

This workflow document should evolve as the project matures:

- **Phase 1-2**: Basic workflow foundation
- **Phase 3-4**: MCP tools for enhanced context
- **Phase 5-6**: Full AI agent integration
- **Future**: Advanced automation and optimization

When updating this workflow:
1. Document what changed and why
2. Update related diagrams
3. Train agents on new patterns
4. Communicate changes to contributors
