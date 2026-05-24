# Architecture Decision Log

## ADR-001: Next.js App Router
**Date:** 2026-05-24
**Status:** Accepted

RSC for data-heavy pages, client components scoped to interactive UI only.

## ADR-002: Tailwind CSS
**Date:** 2026-05-24
**Status:** Accepted

Tokens in tailwind.config.ts. cn() utility for class composition.

## ADR-003: Real Filesystem Tests — No Mocked FS
**Date:** 2026-05-24
**Status:** Accepted

Unit tests use `fs.mkdtempSync` real temp directories instead of mocking `fs`. Each test suite overrides to `@jest-environment node` to skip jsdom overhead.

Mocked filesystem tests pass even when path handling, encoding, or directory creation is broken — the mock has no fidelity to the real behavior. Real temp dirs catch those classes of failure. The cost is slightly slower tests; the payoff is that a passing test suite actually means the scripts work.

## ADR-004: Shell-Safe Subprocess Calls
**Date:** 2026-05-24
**Status:** Accepted

`git commit` receives its message via stdin (`git commit -F -` with `{ input: msg }`) rather than shell interpolation into `-m "..."`. `git config user.name/email` uses `spawnSync` with an args array rather than a shell string.

A project name like `my-project"; rm -rf ~; echo "` or an email containing backticks would execute as shell code if interpolated. Passing values out-of-band (stdin, args array) removes that attack surface entirely. Applied consistently — any subprocess that receives user-supplied input uses this pattern.

## ADR-005: Seeded Git History
**Date:** 2026-05-24
**Status:** Accepted

`scaffold.js` makes 7 incremental commits (initial scaffold → cn utility → shared types → useAsync hook → jest/CI config → npm install → README) rather than one "initial commit" squash.

Take-home reviewers often run `git log` before reading code. A single squash commit signals that the candidate treats version control as a save button. Incremental commits — each scoped to a logical layer — demonstrate delivery thinking. This is scaffolded automatically so the candidate doesn't spend interview time on commit hygiene; they inherit a clean history and continue from it.

## ADR-006: CI Ships With Every Generated Project
**Date:** 2026-05-24
**Status:** Accepted

`.github/workflows/ci.yml` is written by `scaffold.js` as part of the initial scaffold, not left as a post-setup TODO. The workflow runs lint, type-check, and test as parallel jobs on push and PR to main.

Reviewers check whether CI is wired up. A project with no CI, or one where CI fails on the first push, signals incomplete setup. Shipping it pre-configured removes that risk and lets the candidate's first commit trigger a green build immediately.

## ADR-007: Claude CLI for PR Review — No API Key
**Date:** 2026-05-24
**Status:** Accepted

`scripts/pr-review.js` invokes the `claude` CLI via `spawn` rather than calling the Anthropic API directly via SDK.

The SDK approach requires an API key stored somewhere — `.env.local`, a GitHub secret, or copied inline. All three were explicitly rejected as security concerns. Claude Code already authenticates the `claude` binary; no additional credentials are needed. The tradeoff is a dependency on Claude Code being installed locally, which is intentional — this is a local DX tool, not a CI gate.
