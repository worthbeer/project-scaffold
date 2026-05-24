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

The recommended approach:
- Use **Playwright** (`@playwright/test`) — faster than Cypress for Next.js, first-class TypeScript support, no electron dependency
- Tests live in `e2e/` at the project root, separate from `src/` unit tests
- Cover critical flows only (e.g. the main happy path, a key error state) — not every UI interaction
- Run in CI after `test` (unit) passes: `lint → type-check → test → e2e`
- Use fixtures (`test.use(...)`) for shared auth or layout state rather than `beforeEach` duplication
- The `npm run dev` server should be started by Playwright's `webServer` config, not manually
