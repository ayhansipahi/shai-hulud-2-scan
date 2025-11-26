/**
 * Infected NPM Package Scanner
 * 
 * Scan for compromised packages from the Wiz Security Shai-Hulud 2 attack.
 * 
 * @example
 * const { PackageScanner, INFECTED_PACKAGES, ALL_INFECTED_NAMES } = require('infected-npm-scanner');
 * 
 * const scanner = new PackageScanner();
 * scanner.scanPackageJson('./package.json');
 * const results = scanner.getResults();
 */

const { PackageScanner } = require('./lib/scanner');
const { INFECTED_PACKAGES, ALL_INFECTED_NAMES } = require('./data/infected-packages');

module.exports = {
    PackageScanner,
    INFECTED_PACKAGES,
    ALL_INFECTED_NAMES,
};
