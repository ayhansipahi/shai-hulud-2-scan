# Infected NPM Package Scanner

[![CI](https://github.com/ayhansipahi/shai-hulud-2-scan/actions/workflows/ci.yml/badge.svg)](https://github.com/ayhansipahi/shai-hulud-2-scan/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/shai-hulud-2-scan.svg)](https://www.npmjs.com/package/shai-hulud-2-scan)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/shai-hulud-2-scan.svg)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](https://www.npmjs.com/package/shai-hulud-2-scan)

Scan your project for compromised npm packages from the **Wiz Security Shai-Hulud 2** supply chain attack.

## What is this?

In November 2025, Wiz Security researchers discovered a major supply chain attack affecting **700+ npm packages**. This tool helps you quickly check if your project is using any of the compromised packages.

**IOC Source:** [Wiz Security Research IOCs](https://github.com/wiz-sec-public/wiz-research-iocs)

## Quick Start

```bash
# Scan current directory
npx github:ayhansipahi/shai-hulud-2-scan

# Scan specific project
npx github:ayhansipahi/shai-hulud-2-scan /path/to/project

# Scan lock file (auto-detects npm/yarn/pnpm)
npx github:ayhansipahi/shai-hulud-2-scan --lock

# Scan a GitHub repository directly
npx github:ayhansipahi/shai-hulud-2-scan --repo facebook/react

# Scan an npm package's dependencies
npx github:ayhansipahi/shai-hulud-2-scan --npm express
```

## Installation (Optional)

```bash
# Global install from GitHub
npm install -g github:ayhansipahi/shai-hulud-2-scan

# Or use directly with npx (no install needed)
npx github:ayhansipahi/shai-hulud-2-scan
```

## Usage

```bash
# Basic scan (package.json)
npx github:ayhansipahi/shai-hulud-2-scan

# Scan lock file (auto-detects npm/yarn/pnpm)
npx github:ayhansipahi/shai-hulud-2-scan --lock

# Scan specific lock file types
npx github:ayhansipahi/shai-hulud-2-scan --yarn     # yarn.lock
npx github:ayhansipahi/shai-hulud-2-scan --pnpm     # pnpm-lock.yaml

# Scan package.json AND all available lock files
npx github:ayhansipahi/shai-hulud-2-scan --all

# Check specific package
npx github:ayhansipahi/shai-hulud-2-scan --check posthog-js

# Output as JSON (for CI/CD)
npx github:ayhansipahi/shai-hulud-2-scan --json

# List all known infected packages
npx github:ayhansipahi/shai-hulud-2-scan --list

# Quiet mode (only output if infected found)
npx github:ayhansipahi/shai-hulud-2-scan --quiet
```

### GitHub Repository Scanning

Scan any public GitHub repository without cloning:

```bash
# By owner/repo
npx github:ayhansipahi/shai-hulud-2-scan --repo facebook/react

# With specific branch
npx github:ayhansipahi/shai-hulud-2-scan --repo vercel/next.js@canary

# By full URL
npx github:ayhansipahi/shai-hulud-2-scan --repo https://github.com/expressjs/express

# Scan all files in a GitHub repo
npx github:ayhansipahi/shai-hulud-2-scan --repo facebook/react --all

# Scan lock file from GitHub repo
npx github:ayhansipahi/shai-hulud-2-scan -r vercel/next.js --lock
```

### NPM Package Scanning

Scan any npm package's dependencies directly from the registry:

```bash
# Scan latest version
npx github:ayhansipahi/shai-hulud-2-scan --npm react

# Scan specific version
npx github:ayhansipahi/shai-hulud-2-scan --npm express@4.18.2

# Scan scoped packages
npx github:ayhansipahi/shai-hulud-2-scan -n @angular/core

# Output as JSON
npx github:ayhansipahi/shai-hulud-2-scan --npm lodash --json
```

## Programmatic Usage

You can also use this package as a library:

```javascript
const { PackageScanner, INFECTED_PACKAGES, ALL_INFECTED_NAMES } = require('shai-hulud-2-scan');

// Create scanner instance
const scanner = new PackageScanner({ quiet: true });

// Scan package.json
scanner.scanPackageJson('./package.json');

// Get results
const results = scanner.getResults();
console.log(results.summary);

// Check if a specific package is infected
if (INFECTED_PACKAGES.has('posthog-js')) {
  console.log('posthog-js versions:', INFECTED_PACKAGES.get('posthog-js'));
}
```

## Supported Lock Files

| File                | Package Manager | Support                      |
| ------------------- | --------------- | ---------------------------- |
| `package-lock.json` | npm             | v6 and v7+ formats           |
| `yarn.lock`         | Yarn            | Classic (v1) and Berry (v2+) |
| `pnpm-lock.yaml`    | pnpm            | v6+ format                   |

## CI/CD Integration

### GitHub Actions

```yaml
name: Security Scan
on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Scan for infected packages
        run: npx github:ayhansipahi/shai-hulud-2-scan --lock
```

### GitLab CI

```yaml
security-scan:
  script:
    - npx github:ayhansipahi/shai-hulud-2-scan --lock --json > scan-results.json
  artifacts:
    reports:
      dotenv: scan-results.json
```

## Exit Codes

| Code | Meaning                             |
| ---- | ----------------------------------- |
| 0    | No infected packages found          |
| 1    | Infected packages detected or error |

## High-Profile Affected Packages

Some notable packages on the infected list:

- `posthog-js`, `posthog-node`
- `@ensdomains/*` (ENS)
- `zapier-platform-*`
- `@browserbasehq/stagehand`
- `@postman/*`
- `kill-port`
- `coinmarketcap-api`
- `uniswap-*`
- `@voiceflow/*`
- `@oku-ui/*`

Run `npx github:ayhansipahi/shai-hulud-2-scan --list` to see all 700+ packages.

## What to do if infected?

1. **Immediately** remove or update affected packages
2. Clear npm cache: `npm cache clean --force`
3. Delete node_modules: `rm -rf node_modules`
4. Reinstall: `npm install`
5. **IMPORTANT:** Rotate any secrets/credentials that may have been exposed
6. Audit your systems for suspicious activity
7. Check CI/CD pipelines for compromise

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

- Found a missing package or incorrect version? [Open an issue](https://github.com/ayhansipahi/shai-hulud-2-scan/issues/new?template=infected_package.md)
- Want to report a bug? [File a bug report](https://github.com/ayhansipahi/shai-hulud-2-scan/issues/new?template=bug_report.md)
- Have a feature idea? [Submit a feature request](https://github.com/ayhansipahi/shai-hulud-2-scan/issues/new?template=feature_request.md)

## Security

For security vulnerabilities, please see our [Security Policy](SECURITY.md).

## License

MIT License - See [LICENSE](LICENSE) file.

## References

- [Wiz Security Research IOCs](https://github.com/wiz-sec-public/wiz-research-iocs)
- [Shai-Hulud Supply Chain Attack Analysis](https://www.wiz.io/blog)

---

**Stay safe!**
