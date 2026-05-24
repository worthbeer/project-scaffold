# Changelog

## [Unreleased]

### Fixed
- `@types/*` tsconfig path alias renamed to `@t/*` — the `@types` namespace conflicts with TypeScript's DefinitelyTyped resolution, causing TS6137 errors on any `import from "@types/..."` 
- `jest.setup.js` renamed to `jest.setup.ts` so tsc includes it in compilation and picks up `@testing-library/jest-dom` matcher type augmentations
- Added `@types/jest` to generated devDependencies — previously missing, causing `describe`/`it`/`expect` to be unknown in type-check
- Added `scrollIntoView` mock to `jest.setup.ts` — jsdom does not implement it, causing test failures in any component that calls it
- All four fixes applied to both `scripts/scaffold.js` and the matching heredoc in `project-scaffold.sh`

### Added
- `generate-component.test.js` — end-to-end CLI tests covering file creation, barrel update, git commit, invalid name (exit 1), and duplicate component (exit 1); test count now 50

### Changed
- README overhauled — covers what gets generated, seeded git history rationale, PR reviewer, stack, and testing approach
- DECISIONS.md completed — added ADR-003 through ADR-007 (real FS tests, shell-safe subprocesses, seeded history, CI in scaffold, Claude CLI reviewer)
- Scaffold completion message now shows CI pipeline reminder (`lint · type-check · test`)
- Generated README now includes a `## CI` section describing the pre-configured GitHub Actions workflow; removed the "Set up CI" TODO from Trade-offs since it ships with the scaffold

### Added
- Initial project scaffold
- Base component architecture
- TypeScript configuration with path aliases
