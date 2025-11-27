# Security Policy

## About This Project

This project is a security scanner designed to help identify compromised npm packages from the Shai-Hulud 2 supply chain attack. We take security seriously and appreciate your help in keeping this tool and its users safe.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

### For Critical Vulnerabilities

**Do NOT open a public issue.**

Instead, please report critical security vulnerabilities by emailing the maintainers directly or by using GitHub's private vulnerability reporting feature:

1. Go to the [Security tab](https://github.com/ayhansipahi/shai-hulud-2-scan/security)
2. Click "Report a vulnerability"
3. Provide detailed information about the vulnerability

### What to Include

When reporting a vulnerability, please include:

- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Any suggested fixes (if available)
- Your contact information for follow-up

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 1 week
- **Fix Timeline**: Depends on severity, typically within 2 weeks for critical issues

## Security Considerations

### This Tool's Security Model

- **Zero runtime dependencies**: This scanner has no external npm dependencies at runtime, minimizing supply chain risk
- **Read-only operations**: The scanner only reads files and makes HTTPS requests; it never modifies your code or system
- **No code execution**: The scanner analyzes package manifests without executing any code from scanned packages

### Safe Usage Guidelines

1. **Verify the source**: Always install from the official GitHub repository
2. **Check integrity**: Verify the package hasn't been tampered with before use
3. **Keep updated**: Regularly update to get the latest infected package definitions
4. **Review output**: Carefully review scan results before taking remediation actions

### Known Limitations

- The infected package list is based on publicly available IOCs and may not be exhaustive
- Version matching uses exact comparisons; packages with vulnerable transitive dependencies may not be detected
- GitHub and npm registry scanning requires network access

## Updating Infected Package Data

If you discover additional compromised packages:

1. Verify the information from official sources (Wiz Security IOCs)
2. Open a PR or issue with the package name, affected versions, and source reference
3. Critical additions will be prioritized for quick release

## Acknowledgments

We appreciate responsible disclosure and will acknowledge security researchers who help improve this project (unless they prefer to remain anonymous).
