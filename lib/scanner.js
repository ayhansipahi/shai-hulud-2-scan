const fs = require('fs');
const path = require('path');
const { INFECTED_PACKAGES, ALL_INFECTED_NAMES } = require('../data/infected-packages');

const COLORS = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bold: '\x1b[1m',
};

const c = (color, text) => `${COLORS[color]}${text}${COLORS.reset}`;

class PackageScanner {
    constructor(options = {}) {
        this.options = options;
        this.results = {
            scannedFiles: [],
            totalPackages: 0,
            infected: [],
            warnings: [],
            scanDate: new Date().toISOString(),
        };
        this.seenPackages = new Set();
    }

    log(...args) {
        if (!this.options.quiet && !this.options.json) {
            console.log(...args);
        }
    }

    scanPackageJson(filePath) {
        this.log(c('cyan', `\n📦 Scanning: ${filePath}\n`));
        this.results.scannedFiles.push(filePath);

        let packageJson;
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            packageJson = JSON.parse(content);
        } catch (err) {
            this.log(c('red', `❌ Error reading ${filePath}: ${err.message}`));
            return;
        }

        const allDeps = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies,
            ...packageJson.peerDependencies,
            ...packageJson.optionalDependencies,
        };

        const depCount = Object.keys(allDeps).length;
        this.log(`Found ${depCount} direct dependencies to check...\n`);

        for (const [name, version] of Object.entries(allDeps)) {
            this.checkPackage(name, version, 'direct');
        }
    }

    scanPackageLock(filePath) {
        this.log(c('cyan', `\n🔒 Scanning: ${filePath}\n`));
        this.results.scannedFiles.push(filePath);

        let lockFile;
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            lockFile = JSON.parse(content);
        } catch (err) {
            this.log(c('red', `❌ Error reading ${filePath}: ${err.message}`));
            return;
        }

        // npm v7+ format (packages)
        if (lockFile.packages) {
            for (const [pkgPath, info] of Object.entries(lockFile.packages)) {
                if (!pkgPath || pkgPath === '') continue;
                const name = pkgPath.replace(/^node_modules\//, '').split('node_modules/').pop();
                if (info.version) {
                    this.checkPackage(name, info.version, 'transitive');
                }
            }
        }

        // npm v6 format (dependencies)
        if (lockFile.dependencies) {
            this.scanLockDependencies(lockFile.dependencies);
        }

        this.log(`Scanned ${this.results.totalPackages} packages (including transitive)...\n`);
    }

    scanLockDependencies(deps, depth = 0) {
        for (const [name, info] of Object.entries(deps)) {
            if (info.version) {
                this.checkPackage(name, info.version, depth === 0 ? 'direct' : 'transitive');
            }
            if (info.dependencies) {
                this.scanLockDependencies(info.dependencies, depth + 1);
            }
        }
    }

    checkPackage(name, versionSpec, depType = 'unknown') {
        // Avoid duplicate checks
        const key = `${name}@${versionSpec}`;
        if (this.seenPackages.has(key)) return;
        this.seenPackages.add(key);

        this.results.totalPackages++;

        // Clean version string
        const cleanVersion = this.cleanVersion(versionSpec);

        // Check if package is infected
        if (ALL_INFECTED_NAMES.includes(name)) {
            const infectedVersions = INFECTED_PACKAGES.get(name);

            if (infectedVersions && infectedVersions.includes(cleanVersion)) {
                // Exact version match - CRITICAL
                const finding = {
                    name,
                    version: cleanVersion,
                    specifiedVersion: versionSpec,
                    severity: 'CRITICAL',
                    type: depType,
                    message: 'Exact infected version match!',
                    infectedVersions,
                };
                this.results.infected.push(finding);
                this.log(c('red', `🚨 CRITICAL: ${name}@${cleanVersion} - INFECTED VERSION!`));
            } else {
                // Package on list but different version - WARNING
                const finding = {
                    name,
                    version: cleanVersion,
                    specifiedVersion: versionSpec,
                    severity: 'WARNING',
                    type: depType,
                    message: 'Package is on infected list, verify version carefully',
                    infectedVersions: infectedVersions || [],
                };
                this.results.warnings.push(finding);
                this.log(c('yellow', `⚠️  WARNING: ${name}@${cleanVersion} - Package on infected list`));
            }
        }
    }

    cleanVersion(version) {
        if (!version) return '';
        // Remove range specifiers and get the actual version
        return version
            .replace(/[\^~>=<]/g, '')
            .replace(/\s+/g, '')
            .split('||')[0]
            .trim();
    }

    getResults() {
        return {
            ...this.results,
            summary: {
                totalScanned: this.results.totalPackages,
                criticalFindings: this.results.infected.length,
                warnings: this.results.warnings.length,
                isClean: this.results.infected.length === 0 && this.results.warnings.length === 0,
            },
        };
    }

    printResults() {
        const { infected, warnings, totalPackages } = this.results;

        console.log('\n' + '═'.repeat(60));
        console.log(c('bold', ' SCAN RESULTS'));
        console.log('═'.repeat(60));
        console.log(`Total packages scanned: ${totalPackages}`);
        console.log(`Critical findings: ${c(infected.length > 0 ? 'red' : 'green', infected.length)}`);
        console.log(`Warnings: ${c(warnings.length > 0 ? 'yellow' : 'green', warnings.length)}`);

        if (infected.length > 0) {
            console.log(c('red', '\n🚨 CRITICAL - INFECTED PACKAGES FOUND:\n'));
            infected.forEach(pkg => {
                console.log(c('red', `  • ${pkg.name}@${pkg.version}`));
                console.log(`    Type: ${pkg.type} dependency`);
                console.log(`    Known infected versions: ${pkg.infectedVersions.join(', ')}`);
            });
        }

        if (warnings.length > 0) {
            console.log(c('yellow', '\n⚠️  WARNINGS - PACKAGES ON INFECTED LIST:\n'));
            warnings.forEach(pkg => {
                console.log(c('yellow', `  • ${pkg.name}@${pkg.version}`));
                console.log(`    Type: ${pkg.type} dependency`);
                if (pkg.infectedVersions.length > 0) {
                    console.log(`    Known infected versions: ${pkg.infectedVersions.join(', ')}`);
                }
            });
        }

        if (infected.length > 0) {
            console.log(c('red', '\n' + '═'.repeat(60)));
            console.log(c('bold', ' 🛡️  RECOMMENDED ACTIONS'));
            console.log('═'.repeat(60));
            console.log(`
1. ${c('bold', 'IMMEDIATELY')} remove or update affected packages
2. Clear npm cache: ${c('cyan', 'npm cache clean --force')}
3. Delete node_modules: ${c('cyan', 'rm -rf node_modules')}
4. Reinstall dependencies: ${c('cyan', 'npm install')}
5. ${c('yellow', 'IMPORTANT:')} Rotate any secrets/credentials that may have been exposed
6. Audit your systems for suspicious activity
7. Check CI/CD pipelines for compromise
`);
        } else if (warnings.length === 0) {
            console.log(c('green', '\n✅ No infected packages found! Your project appears clean.\n'));
        } else {
            console.log(c('yellow', '\n⚠️  Review warnings above. Verify you are not using infected versions.\n'));
        }
    }
}

module.exports = { PackageScanner };
