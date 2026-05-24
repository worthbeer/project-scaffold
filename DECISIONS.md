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
