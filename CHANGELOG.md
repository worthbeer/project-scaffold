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
