# project-scaffold

One command turns an empty folder into a take-home-ready Next.js project — with CI, a component generator, a self-updating README, and a Claude-powered PR reviewer.

**Problem it solves:** Take-home interviews are time-boxed. Boilerplate setup (TypeScript paths, Jest, ESLint, Tailwind, CI) burns an hour that should go toward the actual problem.

---

## What you get in ~3 minutes

- [x] Next.js 14 App Router + TypeScript + Tailwind + ESLint (`next/core-web-vitals`)
- [x] Jest + React Testing Library wired up and passing
- [x] GitHub Actions CI (lint · type-check · test) on every push
- [x] 7-commit seeded git history showing incremental delivery
- [x] Component generator — one command writes the component, test, and barrel export
- [x] Self-updating README that reads live project state
- [x] Architecture Decision Log pre-populated for your stack choices

## Quick Start

```bash
mkdir my-project && cd my-project
bash /path/to/project-scaffold.sh
code .
# Cmd+Shift+B → 🚀 Scaffold Project
```

## The Workflow

Three VS Code tasks, available from `Cmd+Shift+B`:

| Task | What it does |
|---|---|
| 🚀 Scaffold Project | Prompts for name + problem statement → writes all project files → runs `npm install` → seeds git history |
| 📦 Generate Component | `ComponentName` → creates `src/components/ComponentName/`, writes component + test + barrel export, commits |
| 📝 Refresh README | Re-reads `package.json`, `src/`, `DECISIONS.md` → regenerates `README.md` |

## Why Seeded Git History?

Take-home reviewers often `git log` before reading code. A single "initial commit" gives zero signal. Seven incremental commits — from initial scaffold through types, hooks, and test config — show layered delivery thinking without requiring the candidate to manage commit discipline under time pressure.

```
docs:  add project README
chore: install dependencies
chore: configure tsconfig path aliases and jest
feat:  add useAsync hook for typed async state
feat:  add shared TypeScript types
feat:  add cn utility and base lib layer
chore: initial project scaffold
```

## PR Reviewer

This repo ships a Claude-powered PR reviewer that runs locally with no API key — it uses Claude Code's existing authentication.

```bash
npm run review   # pipes git diff main...HEAD into the reviewer
```

Outputs a structured review: Summary → Findings (with severity) → Verdict.

## Stack (Generated Projects)

Next.js 14 App Router · TypeScript · Tailwind CSS · React 18 · Jest + RTL + user-event · ESLint (next/core-web-vitals)

## This Repo

49 unit tests · 7 architecture decisions documented in [DECISIONS.md](./DECISIONS.md)

The three generator scripts export their core functions and guard CLI execution with `require.main === module` so they can be unit-tested without side effects. Tests use real temp directories (`fs.mkdtempSync`) — no mocked filesystem.

## Requirements

- Node.js 18+
- npm
- git
- [Claude Code](https://claude.ai/code) (for `npm run review` only)
