# Changelog

## [Unreleased]

### Added
- Initial project scaffold
- Base component architecture
- TypeScript configuration with path aliases

### Changed
- Project title set to "Project Scaffold" in Claude Code context header
- Added Naming Conventions section to `.claude/SKILL.md` covering all file/language contexts (PascalCase for components, kebab-case for routes/configs/utils filenames, camelCase for hook/util exports, SCREAMING_SNAKE_CASE for constants and env vars, kebab-case for CSS custom properties)
- Added Naming subsection to `.claude/skills/component.md` pointing to SKILL.md as the single source of truth
- Updated `project-scaffold.sh` installer to output these naming rules into every new project

### Fixed
- `commit()` in `scripts/scaffold.js` and `scripts/generate-component.js` now pipes the message via `git commit -F -` instead of interpolating into `-m "..."` — prevents shell injection if the message contains quotes or special characters
- Same fix applied to both script copies inside `project-scaffold.sh` installer heredocs
- `git config user.name/email` in `scaffold.js` now uses `spawnSync` with an args array instead of shell interpolation — same class of injection risk as ADR-004 (quoted names or emails with special characters would have broken the command)
- `jest.setup.js` is now wired into `jest.config.js` via `setupFilesAfterEnv` — jest-dom matchers (`toHaveClass`, `toBeInTheDocument`, etc.) were silently missing from component tests despite the setup file existing
- `generate-readme.js` now reads `pkg.description` for the Problem Statement section instead of writing a static placeholder — description is persisted to `package.json` at scaffold time
- Added `.eslintrc.json` (`extends: next/core-web-vitals`) so `npm run lint` works out of the box
- Installer (`project-scaffold.sh`) now guards README.md write with `[ ! -f README.md ]` — re-running the installer no longer overwrites an existing README
- Added `@testing-library/user-event ^14.5.2` to devDependencies — was referenced in `testing.md` skill docs but missing from the install

### Added
- `scripts/__tests__/generate-component.test.js` — unit tests for `validateName`, `componentTemplate`, `testTemplate`, `barrelTemplate`, `updateBarrel`
- `scripts/__tests__/generate-readme.test.js` — unit tests for `mapDir`, `countComponents`, `countTests`, `buildReadme` including pluralisation edge cases and problem-statement fallback
- `scripts/__tests__/scaffold.test.js` — unit tests for `buildPackageJson` shape, description field, and required devDependencies
- All three scripts now export their core functions and guard CLI execution with `require.main === module` so they can be required by tests without side effects
- `readline` interface in `scaffold.js` moved inside `main()` so requiring the module for tests does not hold stdin open

### Fixed
- `scaffold.js` now interleaves `write()` calls with `commit()` calls — previously all files were written before any commit, so only the first `git add -A` staged anything and every subsequent commit failed with "nothing to commit"; each commit now lands exactly the files it describes

### Added
- `.github/workflows/ci.yml` written into every generated project — runs `lint`, `type-check`, and `test` as parallel jobs on push/PR to main
- `.github/workflows/ci.yml` added to the project-scaffold repo itself — runs `npm test` (the 43 unit tests) on push/PR to main
