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
