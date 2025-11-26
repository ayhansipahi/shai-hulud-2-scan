#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { PackageScanner } = require('../lib/scanner');
const { INFECTED_PACKAGES, ALL_INFECTED_NAMES } = require('../data/infected-packages');

const VERSION = '1.0.0';

const COLORS = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m',
    bold: '\x1b[1m',
};

const c = (color, text) => `${COLORS[color]}${text}${COLORS.reset}`;

function printBanner() {
    console.log(c('cyan', `
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ${c('bold', '🔍 Infected NPM Package Scanner')}                           ║
║   ${c('yellow', 'Wiz Security Shai-Hulud 2 IOCs')}                            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`));
}

function printHelp() {
    printBanner();
    console.log(`
${c('bold', 'USAGE:')}
  npx github:ayhansipahi/shai-hulud-2-scan [options] [path]

${c('bold', 'OPTIONS:')}
  ${c('cyan', '-h, --help')}        Show this help message
  ${c('cyan', '-v, --version')}     Show version number
  ${c('cyan', '-l, --lock')}        Scan package-lock.json instead of package.json
  ${c('cyan', '-a, --all')}         Scan both package.json and package-lock.json
  ${c('cyan', '-j, --json')}        Output results as JSON
  ${c('cyan', '-q, --quiet')}       Only output if infected packages found
  ${c('cyan', '--list')}            List all known infected packages
  ${c('cyan', '--check <pkg>')}     Check if a specific package is infected

${c('bold', 'EXAMPLES:')}
  ${c('green', 'npx github:ayhansipahi/shai-hulud-2-scan')}                    # Scan current directory
  ${c('green', 'npx github:ayhansipahi/shai-hulud-2-scan ./my-project')}       # Scan specific directory
  ${c('green', 'npx github:ayhansipahi/shai-hulud-2-scan --lock')}             # Scan package-lock.json
  ${c('green', 'npx github:ayhansipahi/shai-hulud-2-scan --all')}              # Scan both files
  ${c('green', 'npx github:ayhansipahi/shai-hulud-2-scan --check posthog-js')} # Check specific package
  ${c('green', 'npx github:ayhansipahi/shai-hulud-2-scan --json > report.json')} # Export JSON report

${c('bold', 'MORE INFO:')}
  GitHub: https://github.com/ayhansipahi/shai-hulud-2-scan
  IOC Source: https://github.com/wiz-sec-public/wiz-research-iocs
`);
}

function printVersion() {
    console.log(`infected-npm-scanner v${VERSION}`);
}

function listInfectedPackages() {
    printBanner();
    console.log(c('bold', `\nKnown Infected Packages (${ALL_INFECTED_NAMES.length} total):\n`));
    
    // Group by scope
    const scoped = {};
    const unscoped = [];
    
    ALL_INFECTED_NAMES.forEach(name => {
        if (name.startsWith('@')) {
            const scope = name.split('/')[0];
            if (!scoped[scope]) scoped[scope] = [];
            scoped[scope].push(name);
        } else {
            unscoped.push(name);
        }
    });
    
    // Print scoped packages
    Object.keys(scoped).sort().forEach(scope => {
        console.log(c('cyan', `\n${scope}/`));
        scoped[scope].forEach(pkg => {
            const versions = INFECTED_PACKAGES.get(pkg);
            const versionStr = versions ? c('red', ` (${versions.join(', ')})`) : '';
            console.log(`  ${pkg.split('/')[1]}${versionStr}`);
        });
    });
    
    // Print unscoped packages
    console.log(c('cyan', '\n[unscoped packages]'));
    unscoped.sort().forEach(pkg => {
        const versions = INFECTED_PACKAGES.get(pkg);
        const versionStr = versions ? c('red', ` (${versions.join(', ')})`) : '';
        console.log(`  ${pkg}${versionStr}`);
    });
}

function checkSpecificPackage(packageName) {
    printBanner();
    
    const isInfected = ALL_INFECTED_NAMES.includes(packageName);
    const versions = INFECTED_PACKAGES.get(packageName);
    
    if (isInfected) {
        console.log(c('red', `\n⚠️  WARNING: ${packageName} is on the infected packages list!\n`));
        if (versions) {
            console.log(`Known infected versions: ${c('red', versions.join(', '))}`);
        }
        console.log(`\n${c('yellow', 'Recommendation:')} Remove or update this package immediately.`);
        process.exit(1);
    } else {
        console.log(c('green', `\n✅ ${packageName} is NOT on the infected packages list.\n`));
        process.exit(0);
    }
}

function findProjectFiles(dir) {
    const packageJson = path.join(dir, 'package.json');
    const packageLock = path.join(dir, 'package-lock.json');
    const yarnLock = path.join(dir, 'yarn.lock');
    const pnpmLock = path.join(dir, 'pnpm-lock.yaml');
    
    return {
        packageJson: fs.existsSync(packageJson) ? packageJson : null,
        packageLock: fs.existsSync(packageLock) ? packageLock : null,
        yarnLock: fs.existsSync(yarnLock) ? yarnLock : null,
        pnpmLock: fs.existsSync(pnpmLock) ? pnpmLock : null,
    };
}

// Parse arguments
const args = process.argv.slice(2);
const flags = {
    help: args.includes('-h') || args.includes('--help'),
    version: args.includes('-v') || args.includes('--version'),
    lock: args.includes('-l') || args.includes('--lock'),
    all: args.includes('-a') || args.includes('--all'),
    json: args.includes('-j') || args.includes('--json'),
    quiet: args.includes('-q') || args.includes('--quiet'),
    list: args.includes('--list'),
    check: args.includes('--check'),
};

// Get target directory (non-flag argument)
const targetDir = args.find(arg => !arg.startsWith('-') && args[args.indexOf(arg) - 1] !== '--check') || '.';
const checkPackage = flags.check ? args[args.indexOf('--check') + 1] : null;

// Handle commands
if (flags.help) {
    printHelp();
    process.exit(0);
}

if (flags.version) {
    printVersion();
    process.exit(0);
}

if (flags.list) {
    listInfectedPackages();
    process.exit(0);
}

if (flags.check && checkPackage) {
    checkSpecificPackage(checkPackage);
    process.exit(0);
}

// Main scanning logic
async function main() {
    if (!flags.quiet && !flags.json) {
        printBanner();
    }
    
    const resolvedDir = path.resolve(targetDir);
    const files = findProjectFiles(resolvedDir);
    
    if (!files.packageJson && !files.packageLock) {
        console.error(c('red', `\n❌ No package.json or package-lock.json found in ${resolvedDir}\n`));
        process.exit(1);
    }
    
    const scanner = new PackageScanner({ quiet: flags.quiet, json: flags.json });
    
    if (flags.all) {
        if (files.packageJson) {
            scanner.scanPackageJson(files.packageJson);
        }
        if (files.packageLock) {
            scanner.scanPackageLock(files.packageLock);
        }
    } else if (flags.lock) {
        if (files.packageLock) {
            scanner.scanPackageLock(files.packageLock);
        } else {
            console.error(c('red', `\n❌ No package-lock.json found in ${resolvedDir}\n`));
            process.exit(1);
        }
    } else {
        if (files.packageJson) {
            scanner.scanPackageJson(files.packageJson);
        }
    }
    
    const results = scanner.getResults();
    
    if (flags.json) {
        console.log(JSON.stringify(results, null, 2));
    } else {
        scanner.printResults();
    }
    
    // Exit with error code if infected packages found
    process.exit(results.infected.length > 0 ? 1 : 0);
}

main().catch(err => {
    console.error(c('red', `\n❌ Error: ${err.message}\n`));
    process.exit(1);
});
