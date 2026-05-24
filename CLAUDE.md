# Project Scaffold — Claude Code Guide

## What this is
A shell script installer (`project-scaffold.sh`) that drops a VS Code task-driven Next.js scaffolding workflow into any empty project folder. The three VS Code tasks call Node.js scripts that generate the full project setup, individual components, and a self-updating README.

## Current state
All known gaps are fixed. 50 unit tests passing. See `CHANGELOG.md [Unreleased]` for what changed recently and `DECISIONS.md` for ADR-001 through ADR-007.

## Key files
| File | Role |
|---|---|
| `project-scaffold.sh` | The installer — writes all workflow files into a target project |
| `scripts/scaffold.js` | Interactive setup: git, package.json, all src files, seeded history |
| `scripts/generate-component.js` | Generates PascalCase component + test + barrel export |
| `scripts/generate-readme.js` | Reads project state, regenerates README.md |
| `scripts/__tests__/` | Unit tests for the three scripts above |
| `.claude/SKILL.md` | Naming conventions + hard rules for Claude in generated projects |

## Critical rule: always sync the installer
Every change to `scripts/*.js` **must** also be applied to the matching heredoc inside `project-scaffold.sh`. The heredocs are the source of truth for what gets installed into new projects.

## Running tests
```bash
npx jest scripts/__tests__
```
Tests use real temp directories (`fs.mkdtempSync`) — no mocks. All three test files override to `@jest-environment node`.

## Logging changes
Every non-trivial change goes in two places:
- `CHANGELOG.md` under `[Unreleased]` — what changed and why
- `DECISIONS.md` — new ADR if the change involves a design choice

## Conventions
Naming, component structure, API patterns, and testing rules live in `.claude/SKILL.md` and `.claude/skills/`. These are written into every generated project by the installer.

## Stack (generated projects)
Next.js 14 App Router · TypeScript · Tailwind CSS · React 18 · Jest + RTL + user-event · ESLint (next/core-web-vitals)
