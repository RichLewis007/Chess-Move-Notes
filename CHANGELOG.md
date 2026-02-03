# Changelog

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed

- Switched formatting and linting from Biome to Prettier + ESLint.
- Added Prettier and ESLint configs plus updated lint-staged, `check`, and fix scripts.

## [0.3.0] - 2026-02-02

### Added

- Vitest test setup with `test`, `test:run`, and `test:coverage` scripts.
- Coverage reporting and CI workflow that runs lint and tests with coverage.
- Unit tests for move token normalization and starting position data integrity.
- `moveSequence` helpers to normalize and apply opening move tokens safely.
- Localization hook (`setMessages`, `t`) for in-app Notice strings.
- README documentation for localization keys and usage.

### Changed

- Opening dropdown now uses a unique key per opening; ECO is display-only.
- Opening dropdown labels now include ECO for easier scanning.
- In-app Notice messages updated to be user-friendly and localizable.

### Fixed

- Custom opening selection no longer crashes when no match is found.
- Opening selection now maps to the intended position (unique key lookup).
- Current-opening detection uses FEN-to-key mapping for correct preselection.
- Move replay and normal move handlers now guard invalid moves.
- Opening move parsing now trims/normalizes whitespace safely.
- Leading-space move token in starting positions data corrected.
- `getSectionInfo` null handling added to avoid edge-context crashes.
- ID writeback now targets the source note instead of the active view.
- Invalid FEN/PGN inputs now surface a Notice instead of throwing.

## [0.2.0] - 2022-02-13

- Previous release details were not recorded.
