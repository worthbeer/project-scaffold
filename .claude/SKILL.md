# Project Scaffold — Claude Code Context

## Stack
Next.js 14 App Router · TypeScript · Tailwind CSS · React 18

## Path Aliases
Always use path aliases, never relative imports across feature boundaries:
- `@/`            → `src/`
- `@components/`  → `src/components/`
- `@hooks/`       → `src/hooks/`
- `@lib/`         → `src/lib/`
- `@types/`       → `src/types/`

## Naming Conventions
Names follow the convention of the file type or language context — not a single global rule.

| What | Convention | Example |
|---|---|---|
| React components (file + export) | PascalCase | `DataTable.tsx`, `export function DataTable` |
| Component folder | PascalCase | `src/components/DataTable/` |
| Hooks | camelCase with `use` prefix | `use-async.ts`, `export function useAsync` |
| Utility functions / lib files | kebab-case filename, camelCase export | `src/lib/format-date.ts`, `export function formatDate` |
| Route segments (Next.js App Router) | kebab-case | `src/app/user-profile/page.tsx` |
| Config files & scripts | kebab-case | `jest.config.js`, `generate-component.js` |
| TypeScript types and interfaces | PascalCase | `type AsyncState<T>`, `type WithClassName` |
| Constants | SCREAMING_SNAKE_CASE | `const MAX_RETRIES = 3` |
| CSS custom properties | kebab-case | `--muted-foreground` |
| Environment variables | SCREAMING_SNAKE_CASE | `NEXT_PUBLIC_APP_URL` |

**Why:** Each ecosystem has its own convention — React components are PascalCase so JSX can distinguish them from HTML elements; Next.js file routing is kebab-case to match URL conventions; TypeScript types are PascalCase to mirror class naming; CSS and shell tools use kebab-case by convention. Mixing conventions within a context is a bug.

## Conventions
See `.claude/skills/` for component, API, and testing patterns.

## Hard Rules
- Named exports only — no default exports on components
- No `any` type — use `unknown` with a type guard
- No inline styles — Tailwind classes via `cn()` only
- No files in `/pages` — this project uses App Router
- No class components
