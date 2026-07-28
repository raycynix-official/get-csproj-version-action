# Changelog

## 1.2.0 - 2026-07-28

### Added

- Added version extraction from the nearest `Directory.Build.props` when the selected `.csproj` does not define a version.
- Added an integration test for projects that inherit their version from `Directory.Build.props`.

### Changed

- Updated action metadata and documentation to describe centrally managed project versions.

## 1.1.0 - 2026-06-23

### Changed

- Updated logging.

## 1.0.1 - 2026-06-23

### Changed

- Updated GitHub Action runtime from Node.js 20 to Node.js 24.
- Improved project auto-discovery for solution files and nested project directories.
- Stopped treating dependency `Version` attributes as project versions.
