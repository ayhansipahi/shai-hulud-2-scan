# Contributing to Shai-Hulud-2-Scan

Thank you for your interest in contributing to this security scanner! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the maintainers.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/shai-hulud-2-scan.git`
3. Add upstream remote: `git remote add upstream https://github.com/ayhansipahi/shai-hulud-2-scan.git`
4. Create a branch: `git checkout -b feature/your-feature-name`

## How to Contribute

### Reporting Bugs

Before submitting a bug report:

1. Check the [existing issues](https://github.com/ayhansipahi/shai-hulud-2-scan/issues) to avoid duplicates
2. Use the bug report template when creating a new issue
3. Include as much detail as possible:
   - Node.js version
   - Operating system
   - Steps to reproduce
   - Expected vs actual behavior
   - Relevant logs or error messages

### Suggesting Features

Feature requests are welcome! Please:

1. Check existing issues/discussions first
2. Use the feature request template
3. Explain the use case and why this feature would be beneficial

### Adding Infected Packages

If you discover additional compromised packages from the Shai-Hulud 2 attack:

1. Verify the information from official sources (Wiz Security IOCs)
2. Update `data/infected-packages.js` with the package name and affected versions
3. Add a reference to the source in your PR description

## Development Setup

```bash
# Clone the repository
git clone https://github.com/ayhansipahi/shai-hulud-2-scan.git
cd shai-hulud-2-scan

# Install dependencies
npm install

# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format
```

### Project Structure

```
shai-hulud-2-scan/
├── bin/
│   └── cli.js          # CLI entry point
├── lib/
│   ├── scanner.js      # Core scanning logic
│   ├── github.js       # GitHub repository fetching
│   └── npm.js          # NPM registry integration
├── data/
│   └── infected-packages.js  # Compromised package database
├── __tests__/          # Test files
└── index.js            # Module exports
```

## Coding Standards

### JavaScript Style

- Use ES6+ features where appropriate
- No external runtime dependencies (keep the package lightweight)
- Use JSDoc comments for public APIs
- Follow the existing code style (enforced by ESLint and Prettier)

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add yarn berry lock file support
fix: handle scoped packages correctly
docs: update installation instructions
test: add tests for npm registry scanning
chore: update dependencies
```

### Code Quality

Before submitting a PR:

```bash
# Run all checks
npm run lint
npm run format:check
npm test
```

## Testing

### Running Tests

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- __tests__/scanner.test.js
```

### Writing Tests

- Place test files in `__tests__/` directory
- Name test files as `*.test.js`
- Test both success and error cases
- Aim for high coverage on critical scanning logic

## Pull Request Process

1. **Update your branch**: Before submitting, rebase on main:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Ensure quality**: All checks must pass:
   - Tests pass (`npm test`)
   - Linting passes (`npm run lint`)
   - Code is formatted (`npm run format:check`)

3. **Write a good PR description**:
   - Describe what changes you made
   - Reference any related issues
   - Include screenshots/examples if relevant

4. **Review process**:
   - At least one maintainer approval is required
   - Address review feedback promptly
   - Keep the PR focused on a single change

5. **After merge**:
   - Delete your branch
   - Pull the latest main

## Questions?

Feel free to open a [discussion](https://github.com/ayhansipahi/shai-hulud-2-scan/discussions) or reach out to the maintainers.

Thank you for contributing to making npm safer!
