# Architecture Decision Log

## ADR-001: Next.js App Router
**Date:** 2026-05-24
**Status:** Accepted

RSC for data-heavy pages, client components scoped to interactive UI only.

## ADR-002: Tailwind CSS
**Date:** 2026-05-24
**Status:** Accepted

Tokens in tailwind.config.ts. cn() utility for class composition.

## ADR-003: Context-Dependent Naming Conventions
**Date:** 2026-05-24
**Status:** Accepted

No single global naming rule. Each file type follows its own ecosystem convention:
- PascalCase for React component files, folders, exports, and TypeScript types — JSX requires this to distinguish components from HTML elements
- camelCase for hook and utility function exports — matches JavaScript function convention
- kebab-case for hook filenames, util filenames, route segments, config files, and scripts — matches URL, shell, and Node.js tooling conventions
- SCREAMING_SNAKE_CASE for constants and environment variables — matches universal constant convention across JS, shell, and CI tooling
- kebab-case for CSS custom properties — matches CSS spec

Mixing conventions within a context (e.g. a PascalCase route folder) is treated as a bug, not a style preference.

## ADR-004: Safe Commit Message Passing via stdin
**Date:** 2026-05-24
**Status:** Accepted

`git commit -m "..."` interpolates the message into a shell string. Any user-supplied value (project name, problem statement, component name) that contains a double quote, backtick, or `$` would corrupt the command or allow unintended shell expansion. 

All commit calls now use `execSync("git commit -F -", { input: msg })`, which pipes the message directly to git's stdin. Git reads it as a literal string regardless of content. This applies to the `commit()` helper in `scaffold.js` and the inline commit in `generate-component.js`, and both copies inside the `project-scaffold.sh` installer heredocs.

## ADR-005: Unit Tests for Scripts; E2E Deferred
**Date:** 2026-05-24
**Status:** Accepted

The three generator scripts (`scaffold.js`, `generate-component.js`, `generate-readme.js`) are the core product of this tool. Unit tests covering their exported functions give fast, deterministic feedback on the contracts that matter: name validation, file content templates, barrel idempotency, README template rendering, and package.json shape.

**What is unit-tested now:**
- `validateName` — rejects invalid casing, accepts PascalCase
- `componentTemplate` / `testTemplate` / `barrelTemplate` — output shape and named export conventions
- `updateBarrel` — append-only, idempotent
- `mapDir` / `countComponents` / `countTests` — filesystem traversal using real temp directories
- `buildReadme` — full template rendering including problem statement fallback and pluralisation
- `buildPackageJson` — required fields, description passthrough, devDependency presence

**Why not mocking `fs`:** Tests use real temp directories (`fs.mkdtempSync`) so they exercise the actual filesystem contract rather than an abstraction. The scripts are short-lived and the overhead is negligible.

**When to add E2E tests and how to approach it:**
Consider adding E2E tests when: (1) the generated app has multiple interacting routes or components that form a critical user flow, (2) there is a CI pipeline to run them on, and (3) unit/component tests are stable and not catching enough regressions.

## ADR-007: Claude PR Reviewer Architecture
**Date:** 2026-05-24
**Status:** Accepted

Generated projects get an automated PR reviewer that posts a single summary comment (not inline diff comments) on every PR.

**Why a single comment over inline comments:** Inline comments require parsing `file:line` references out of Claude's output and mapping them to the GitHub PR Review API's line model, which is fragile on large diffs and fails silently if the line reference is off by one. A single summary comment is simpler, more reliable, and carries the same information — the `file:line` references appear in the finding text so developers can navigate directly.

**Why a script (pr-review.js) over a GitHub Action (uses: anthropics/...):** A local script is inspectable, forkable, and lets the system prompt be owned by the project. The prompt is tuned for Next.js App Router + React patterns drawn from real review sessions (see `CODE_REVIEW.md` in gen-digital/front-end-code-review-challenge). It covers architecture (god components, `'use client'` placement, direct browser-to-API calls, URL state), code quality (AbortController, `r.ok`, prop mutation, key stability), security (URL encoding, OWASP Top 10), and style (next/image, devDependencies classification, type safety, semantic HTML).

**Why `@anthropic-ai/sdk` in devDependencies:** The SDK is only needed in CI (via `npm ci` which installs devDependencies). It is never required at runtime in the browser or on the Next.js server.

**Trigger:** Manual — `npm run review` or the `🔍 Review PR` VS Code task. The developer runs it locally before creating or merging a PR. The key stays in `.env.local` or shell profile and never touches GitHub.

**To activate:** Add `ANTHROPIC_API_KEY` to `.env.local` or your shell profile (`~/.zshrc` or `~/.bashrc`). The key never leaves your machine.

---

## ADR-006: Parallel CI Jobs for Generated Projects
**Date:** 2026-05-24
**Status:** Accepted

Generated projects get three parallel GitHub Actions jobs (`lint`, `type-check`, `test`) rather than one sequential job. Each job checks out the repo and runs `npm ci` independently.

**Why parallel:** The three checks are independent and take similar time (~30–60s each). Running them in parallel cuts wall-clock feedback time by ~2/3 on pull requests. The extra `npm ci` per job is negligible on GitHub Actions runners where the cache is shared via `actions/setup-node` with `cache: 'npm'`.

**Why separate the project-scaffold repo's CI:** The project-scaffold repo only runs unit tests (`npx jest scripts/__tests__`), not lint or type-check — it has no TypeScript files outside of the generated project templates, and the Next.js ESLint config targets `src/` which doesn't exist in this repo.

---

The recommended approach:
- Use **Playwright** (`@playwright/test`) — faster than Cypress for Next.js, first-class TypeScript support, no electron dependency
- Tests live in `e2e/` at the project root, separate from `src/` unit tests
- Cover critical flows only (e.g. the main happy path, a key error state) — not every UI interaction
- Run in CI after `test` (unit) passes: `lint → type-check → test → e2e`
- Use fixtures (`test.use(...)`) for shared auth or layout state rather than `beforeEach` duplication
- The `npm run dev` server should be started by Playwright's `webServer` config, not manually
