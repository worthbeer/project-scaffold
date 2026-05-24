# Project Context for Claude Code

## Stack
Next.js 14 App Router · TypeScript · Tailwind CSS · React 18

## Path Aliases
Always use path aliases, never relative imports across feature boundaries:
- `@/`            → `src/`
- `@components/`  → `src/components/`
- `@hooks/`       → `src/hooks/`
- `@lib/`         → `src/lib/`
- `@types/`       → `src/types/`

## Conventions
See `.claude/skills/` for component, API, and testing patterns.

## Hard Rules
- Named exports only — no default exports on components
- No `any` type — use `unknown` with a type guard
- No inline styles — Tailwind classes via `cn()` only
- No files in `/pages` — this project uses App Router
- No class components
