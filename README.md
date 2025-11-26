# 🔍 Infected NPM Package Scanner

Scan your project for compromised npm packages from the **Wiz Security Shai-Hulud 2** supply chain attack.



## 🚨 What is this?

In late 2024, Wiz Security researchers discovered a major supply chain attack affecting **700+ npm packages**. This tool helps you quickly check if your project is using any of the compromised packages.

**IOC Source:** [Wiz Security Research IOCs](https://github.com/wiz-sec-public/wiz-research-iocs)

## ⚡ Quick Start

```bash
# Scan current directory
npx infected-npm-scanner

# Scan specific project
npx infected-npm-scanner /path/to/project

# Scan package-lock.json (includes transitive deps)
npx infected-npm-scanner --lock
```

## 📦 Installation (Optional)

```bash
# Global install
npm install -g infected-npm-scanner

# Or use directly with npx (no install needed)
npx infected-npm-scanner
```

## 🛠️ Usage

```bash
# Basic scan (package.json)
npx infected-npm-scanner

# Scan package-lock.json for deeper analysis
npx infected-npm-scanner --lock

# Scan both files
npx infected-npm-scanner --all

# Check specific package
npx infected-npm-scanner --check posthog-js

# Output as JSON (for CI/CD)
npx infected-npm-scanner --json

# List all known infected packages
npx infected-npm-scanner --list

# Quiet mode (only output if infected found)
npx infected-npm-scanner --quiet
```

## 🎯 CI/CD Integration

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
        run: npx infected-npm-scanner --lock
```

### GitLab CI

```yaml
security-scan:
  script:
    - npx infected-npm-scanner --lock --json > scan-results.json
  artifacts:
    reports:
      dotenv: scan-results.json
```

## 📋 Exit Codes

| Code | Meaning |
|------|---------|
| 0 | No infected packages found |
| 1 | Infected packages detected or error |

## ⚠️ High-Profile Affected Packages

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

Run `npx infected-npm-scanner --list` to see all 700+ packages.

## 🔧 What to do if infected?

1. **Immediately** remove or update affected packages
2. Clear npm cache: `npm cache clean --force`
3. Delete node_modules: `rm -rf node_modules`
4. Reinstall: `npm install`
5. **IMPORTANT:** Rotate any secrets/credentials that may have been exposed
6. Audit your systems for suspicious activity
7. Check CI/CD pipelines for compromise

## 🤝 Contributing

Found a missing package or incorrect version? Please open an issue or PR!

## 📄 License

MIT License - See [LICENSE](LICENSE) file.

## 🔗 References

- [Wiz Security Research IOCs](https://github.com/wiz-sec-public/wiz-research-iocs)
- [Shai-Hulud Supply Chain Attack Analysis](https://www.wiz.io/blog)

---

**Stay safe! 🛡️**
