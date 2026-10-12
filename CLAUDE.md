@AGENTS.md

## Running as the GitHub agent (.github/workflows/ai-agent.yml)

When you are triggered by `@claude` on an issue:

1. Read the issue and all comments (`gh issue view <n> --comments`). If an
   approved "Implementation Specification" comment exists, implement exactly
   that; raise any deviation in the PR description.
2. Work on the branch the action created (`feature/...`). Never push to `main`.
3. Follow AGENTS.md, including tests for every change and the Definition of
   Done. Register new entities and migrations in
   `apps/backend/src/database/schema.ts`.
4. Run `yarn verify` and make it pass before committing. `DATABASE_URL`
   points at a disposable PostgreSQL service: run `yarn migration:run` and
   `yarn test:e2e:db` when you touch entities, migrations or services.
5. Commit with conventional commits, push, and open a PR with
   `gh pr create --base main` following `.github/pull_request_template.md`
   and including `Closes #<issue>`.

When triggered on a pull request, address the review feedback on that PR's
branch and re-run `yarn verify`.

Never print or commit secrets, and never run migrations against any database
other than the one in `DATABASE_URL`.
