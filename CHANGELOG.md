# Changelog

## [Unreleased]

### Added
- `generate-component.test.js` — end-to-end CLI tests covering file creation, barrel update, git commit, invalid name (exit 1), and duplicate component (exit 1); test count now 49

### Changed
- README overhauled — covers what gets generated, seeded git history rationale, PR reviewer, stack, and testing approach
- DECISIONS.md completed — added ADR-003 through ADR-007 (real FS tests, shell-safe subprocesses, seeded history, CI in scaffold, Claude CLI reviewer)
- Scaffold completion message now shows CI pipeline reminder (`lint · type-check · test`)
- Generated README now includes a `## CI` section describing the pre-configured GitHub Actions workflow; removed the "Set up CI" TODO from Trade-offs since it ships with the scaffold

### Added
- Initial project scaffold
- Base component architecture
- TypeScript configuration with path aliases
