## What and why

<!-- What changed and the reason for it. -->

Closes #

## How it was verified

- [ ] `yarn verify` passes (type-check, lint, unit + e2e tests, build)
- [ ] `yarn test:e2e:db` passes (when entities, migrations or services changed)
- [ ] New behaviour is covered by tests

## Checklist (AGENTS.md Definition of Done)

- [ ] No `any`, no new lint warnings
- [ ] Migrations are new files with a working `down()` and registered in `schema.ts`
- [ ] No secrets, credentials or `.env` files committed
- [ ] Documentation updated (README API table, setup steps)
