# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- ESLint and Prettier configuration for code quality
- Jest testing framework with comprehensive test suite
- GitHub Actions CI/CD workflows
- CONTRIBUTING.md with contribution guidelines
- CODE_OF_CONDUCT.md for community standards
- SECURITY.md for vulnerability reporting
- Issue and pull request templates
- Pre-commit hooks with Husky and lint-staged

### Changed

- Updated package.json with complete metadata

## [1.0.0] - 2025-11-26

### Added

- Initial release
- Core package.json scanning functionality
- npm lock file scanning (package-lock.json v6 and v7+ formats)
- yarn.lock scanning (Classic v1 and Berry v2+ formats)
- pnpm-lock.yaml scanning
- GitHub repository scanning without cloning
- NPM registry package scanning
- Specific package version checking
- List all infected packages command
- JSON output mode for CI/CD integration
- Quiet mode for minimal output
- Colored CLI output with helpful formatting
- Database of 689 compromised packages from Wiz Security IOCs
- MIT License
- Comprehensive README with usage examples
- CI/CD integration examples for GitHub Actions and GitLab CI

### Security

- Zero runtime dependencies to minimize supply chain risk
- Read-only operations for safe scanning

[Unreleased]: https://github.com/ayhansipahi/shai-hulud-2-scan/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/ayhansipahi/shai-hulud-2-scan/releases/tag/v1.0.0
