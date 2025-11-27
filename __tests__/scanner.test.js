const { PackageScanner } = require('../lib/scanner');

describe('PackageScanner', () => {
  describe('constructor', () => {
    it('should create scanner with default options', () => {
      const scanner = new PackageScanner();
      expect(scanner.options).toEqual({});
      expect(scanner.results.infected).toEqual([]);
      expect(scanner.results.warnings).toEqual([]);
    });

    it('should accept custom options', () => {
      const scanner = new PackageScanner({ quiet: true, json: true });
      expect(scanner.options.quiet).toBe(true);
      expect(scanner.options.json).toBe(true);
    });
  });

  describe('cleanVersion', () => {
    let scanner;

    beforeEach(() => {
      scanner = new PackageScanner({ quiet: true });
    });

    it('should remove caret prefix', () => {
      expect(scanner.cleanVersion('^1.2.3')).toBe('1.2.3');
    });

    it('should remove tilde prefix', () => {
      expect(scanner.cleanVersion('~1.2.3')).toBe('1.2.3');
    });

    it('should remove >= prefix', () => {
      expect(scanner.cleanVersion('>=1.2.3')).toBe('1.2.3');
    });

    it('should handle range with ||', () => {
      expect(scanner.cleanVersion('^1.2.3 || ^2.0.0')).toBe('1.2.3');
    });

    it('should handle empty version', () => {
      expect(scanner.cleanVersion('')).toBe('');
    });

    it('should handle null version', () => {
      expect(scanner.cleanVersion(null)).toBe('');
    });

    it('should handle exact version', () => {
      expect(scanner.cleanVersion('1.2.3')).toBe('1.2.3');
    });
  });

  describe('scanPackageJsonContent', () => {
    let scanner;

    beforeEach(() => {
      scanner = new PackageScanner({ quiet: true });
    });

    it('should scan package.json with dependencies', () => {
      const content = JSON.stringify({
        dependencies: {
          lodash: '^4.17.21',
          express: '^4.18.2',
        },
      });

      scanner.scanPackageJsonContent(content);
      expect(scanner.results.totalPackages).toBe(2);
    });

    it('should scan all dependency types', () => {
      const content = JSON.stringify({
        dependencies: { a: '1.0.0' },
        devDependencies: { b: '1.0.0' },
        peerDependencies: { c: '1.0.0' },
        optionalDependencies: { d: '1.0.0' },
      });

      scanner.scanPackageJsonContent(content);
      expect(scanner.results.totalPackages).toBe(4);
    });

    it('should handle empty package.json', () => {
      const content = JSON.stringify({});
      scanner.scanPackageJsonContent(content);
      expect(scanner.results.totalPackages).toBe(0);
    });

    it('should handle invalid JSON', () => {
      const content = 'not valid json';
      scanner.scanPackageJsonContent(content);
      expect(scanner.results.totalPackages).toBe(0);
    });

    it('should detect infected package', () => {
      const content = JSON.stringify({
        dependencies: {
          'posthog-js': '1.297.3',
        },
      });

      scanner.scanPackageJsonContent(content);
      expect(scanner.results.infected.length).toBe(1);
      expect(scanner.results.infected[0].name).toBe('posthog-js');
    });

    it('should add warning for package on list with different version', () => {
      const content = JSON.stringify({
        dependencies: {
          'posthog-js': '1.0.0',
        },
      });

      scanner.scanPackageJsonContent(content);
      expect(scanner.results.warnings.length).toBe(1);
      expect(scanner.results.warnings[0].name).toBe('posthog-js');
    });
  });

  describe('scanPackageLockContent', () => {
    let scanner;

    beforeEach(() => {
      scanner = new PackageScanner({ quiet: true });
    });

    it('should scan npm v7+ format with packages', () => {
      const content = JSON.stringify({
        packages: {
          '': {},
          'node_modules/lodash': { version: '4.17.21' },
          'node_modules/express': { version: '4.18.2' },
        },
      });

      scanner.scanPackageLockContent(content);
      expect(scanner.results.totalPackages).toBe(2);
    });

    it('should scan npm v6 format with dependencies', () => {
      const content = JSON.stringify({
        dependencies: {
          lodash: { version: '4.17.21' },
          express: {
            version: '4.18.2',
            dependencies: {
              'body-parser': { version: '1.20.0' },
            },
          },
        },
      });

      scanner.scanPackageLockContent(content);
      expect(scanner.results.totalPackages).toBe(3);
    });

    it('should handle nested node_modules paths', () => {
      const content = JSON.stringify({
        packages: {
          '': {},
          'node_modules/express/node_modules/debug': { version: '4.3.4' },
        },
      });

      scanner.scanPackageLockContent(content);
      expect(scanner.results.totalPackages).toBe(1);
    });

    it('should handle scoped packages', () => {
      const content = JSON.stringify({
        packages: {
          '': {},
          'node_modules/@types/node': { version: '20.0.0' },
        },
      });

      scanner.scanPackageLockContent(content);
      expect(scanner.results.totalPackages).toBe(1);
    });
  });

  describe('scanYarnLockContent', () => {
    let scanner;

    beforeEach(() => {
      scanner = new PackageScanner({ quiet: true });
    });

    it('should scan Yarn Classic (v1) format', () => {
      const content = `
"lodash@^4.17.21":
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz"

"express@^4.18.2":
  version "4.18.2"
  resolved "https://registry.yarnpkg.com/express/-/express-4.18.2.tgz"
`;

      scanner.scanYarnLockContent(content);
      expect(scanner.results.totalPackages).toBe(2);
    });

    it('should scan scoped packages in Yarn v1', () => {
      const content = `
"@types/node@^20.0.0":
  version "20.0.0"
  resolved "https://registry.yarnpkg.com/@types/node/-/node-20.0.0.tgz"
`;

      scanner.scanYarnLockContent(content);
      expect(scanner.results.totalPackages).toBe(1);
    });

    it('should scan Yarn Berry (v2+) format', () => {
      const content = `# This file is generated by running "yarn install"
__metadata:
  version: 6

"lodash@npm:^4.17.21":
  version: 4.17.21
  resolution: "lodash@npm:4.17.21"

"express@npm:^4.18.2":
  version: 4.18.2
  resolution: "express@npm:4.18.2"
`;

      scanner.scanYarnLockContent(content);
      expect(scanner.results.totalPackages).toBe(2);
    });
  });

  describe('scanPnpmLockContent', () => {
    let scanner;

    beforeEach(() => {
      scanner = new PackageScanner({ quiet: true });
    });

    it('should scan pnpm lock format', () => {
      const content = `
lockfileVersion: '9.0'

packages:
  'lodash@4.17.21':
    resolution: {integrity: sha512-xxx}

  'express@4.18.2':
    resolution: {integrity: sha512-xxx}
`;

      scanner.scanPnpmLockContent(content);
      expect(scanner.results.totalPackages).toBe(2);
    });

    it('should scan scoped packages in pnpm lock', () => {
      const content = `
lockfileVersion: '9.0'

packages:
  '@types/node@20.0.0':
    resolution: {integrity: sha512-xxx}
`;

      scanner.scanPnpmLockContent(content);
      expect(scanner.results.totalPackages).toBe(1);
    });
  });

  describe('getResults', () => {
    it('should return complete results with summary', () => {
      const scanner = new PackageScanner({ quiet: true });
      const content = JSON.stringify({
        dependencies: {
          lodash: '^4.17.21',
        },
      });

      scanner.scanPackageJsonContent(content);
      const results = scanner.getResults();

      expect(results.summary).toBeDefined();
      expect(results.summary.totalScanned).toBe(1);
      expect(results.summary.isClean).toBe(true);
    });

    it('should mark as not clean when infected', () => {
      const scanner = new PackageScanner({ quiet: true });
      const content = JSON.stringify({
        dependencies: {
          'posthog-js': '1.297.3',
        },
      });

      scanner.scanPackageJsonContent(content);
      const results = scanner.getResults();

      expect(results.summary.isClean).toBe(false);
      expect(results.summary.criticalFindings).toBe(1);
    });
  });

  describe('checkPackage deduplication', () => {
    it('should not count same package twice', () => {
      const scanner = new PackageScanner({ quiet: true });

      scanner.checkPackage('lodash', '4.17.21', 'direct');
      scanner.checkPackage('lodash', '4.17.21', 'transitive');

      expect(scanner.results.totalPackages).toBe(1);
    });

    it('should count different versions separately', () => {
      const scanner = new PackageScanner({ quiet: true });

      scanner.checkPackage('lodash', '4.17.21', 'direct');
      scanner.checkPackage('lodash', '4.17.20', 'transitive');

      expect(scanner.results.totalPackages).toBe(2);
    });
  });

  describe('scanGitHubRepo', () => {
    let scanner;

    beforeEach(() => {
      scanner = new PackageScanner({ quiet: true });
    });

    it('should scan package.json by default', () => {
      const repoInfo = { owner: 'test', repo: 'test' };
      const files = {
        packageJson: JSON.stringify({ dependencies: { lodash: '4.17.21' } }),
      };

      scanner.scanGitHubRepo(repoInfo, files, {});
      expect(scanner.results.totalPackages).toBe(1);
    });

    it('should throw if package.json not found', () => {
      const repoInfo = { owner: 'test', repo: 'test' };
      const files = {};

      expect(() => {
        scanner.scanGitHubRepo(repoInfo, files, {});
      }).toThrow('No package.json found');
    });

    it('should scan all files when all option is true', () => {
      const repoInfo = { owner: 'test', repo: 'test' };
      const files = {
        packageJson: JSON.stringify({ dependencies: { a: '1.0.0' } }),
        packageLock: JSON.stringify({
          packages: {
            '': {},
            'node_modules/b': { version: '1.0.0' },
          },
        }),
      };

      scanner.scanGitHubRepo(repoInfo, files, { all: true });
      expect(scanner.results.totalPackages).toBe(2);
    });

    it('should auto-detect lock file when lock option is true', () => {
      const repoInfo = { owner: 'test', repo: 'test' };
      const files = {
        packageLock: JSON.stringify({
          packages: {
            '': {},
            'node_modules/lodash': { version: '4.17.21' },
          },
        }),
      };

      scanner.scanGitHubRepo(repoInfo, files, { lock: true });
      expect(scanner.results.totalPackages).toBe(1);
    });

    it('should throw if no lock file found when lock option is true', () => {
      const repoInfo = { owner: 'test', repo: 'test' };
      const files = {};

      expect(() => {
        scanner.scanGitHubRepo(repoInfo, files, { lock: true });
      }).toThrow('No lock file found');
    });

    it('should scan yarn lock when yarn option is true', () => {
      const repoInfo = { owner: 'test', repo: 'test' };
      const files = {
        yarnLock: `
"lodash@^4.17.21":
  version "4.17.21"
`,
      };

      scanner.scanGitHubRepo(repoInfo, files, { yarn: true });
      expect(scanner.results.totalPackages).toBe(1);
    });

    it('should throw if no yarn.lock found when yarn option is true', () => {
      const repoInfo = { owner: 'test', repo: 'test' };
      const files = {};

      expect(() => {
        scanner.scanGitHubRepo(repoInfo, files, { yarn: true });
      }).toThrow('No yarn.lock found');
    });

    it('should scan pnpm lock when pnpm option is true', () => {
      const repoInfo = { owner: 'test', repo: 'test' };
      const files = {
        pnpmLock: `
lockfileVersion: '9.0'

packages:
  'lodash@4.17.21':
    resolution: {integrity: sha512-xxx}
`,
      };

      scanner.scanGitHubRepo(repoInfo, files, { pnpm: true });
      expect(scanner.results.totalPackages).toBe(1);
    });

    it('should throw if no pnpm-lock.yaml found when pnpm option is true', () => {
      const repoInfo = { owner: 'test', repo: 'test' };
      const files = {};

      expect(() => {
        scanner.scanGitHubRepo(repoInfo, files, { pnpm: true });
      }).toThrow('No pnpm-lock.yaml found');
    });

    it('should fallback to yarn lock when lock option is true and no package-lock', () => {
      const repoInfo = { owner: 'test', repo: 'test' };
      const files = {
        yarnLock: `
"lodash@^4.17.21":
  version "4.17.21"
`,
      };

      scanner.scanGitHubRepo(repoInfo, files, { lock: true });
      expect(scanner.results.totalPackages).toBe(1);
    });

    it('should fallback to pnpm lock when lock option is true and no package-lock or yarn', () => {
      const repoInfo = { owner: 'test', repo: 'test' };
      const files = {
        pnpmLock: `
lockfileVersion: '9.0'

packages:
  'lodash@4.17.21':
    resolution: {integrity: sha512-xxx}
`,
      };

      scanner.scanGitHubRepo(repoInfo, files, { lock: true });
      expect(scanner.results.totalPackages).toBe(1);
    });

    it('should use custom repo URL from repoInfo', () => {
      const repoInfo = { owner: 'test', repo: 'test', url: 'https://github.com/custom/url' };
      const files = {
        packageJson: JSON.stringify({ dependencies: { lodash: '4.17.21' } }),
      };

      scanner.scanGitHubRepo(repoInfo, files, {});
      expect(scanner.results.scannedFiles[0]).toContain('custom/url');
    });

    it('should scan all available lock files with all option', () => {
      const repoInfo = { owner: 'test', repo: 'test' };
      const files = {
        packageJson: JSON.stringify({ dependencies: { a: '1.0.0' } }),
        yarnLock: `
"b@^1.0.0":
  version "1.0.0"
`,
        pnpmLock: `
lockfileVersion: '9.0'

packages:
  'c@1.0.0':
    resolution: {integrity: sha512-xxx}
`,
      };

      scanner.scanGitHubRepo(repoInfo, files, { all: true });
      expect(scanner.results.totalPackages).toBe(3);
    });
  });

  describe('log method', () => {
    it('should not log when quiet is true', () => {
      const scanner = new PackageScanner({ quiet: true });
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      scanner.log('test message');

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should not log when json is true', () => {
      const scanner = new PackageScanner({ json: true });
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      scanner.log('test message');

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log when neither quiet nor json is true', () => {
      const scanner = new PackageScanner({});
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      scanner.log('test message');

      expect(consoleSpy).toHaveBeenCalledWith('test message');
      consoleSpy.mockRestore();
    });
  });

  describe('printResults', () => {
    it('should print clean message when no infected packages', () => {
      const scanner = new PackageScanner({ quiet: true });
      scanner.scanPackageJsonContent(JSON.stringify({ dependencies: { lodash: '4.17.21' } }));

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      scanner.printResults();

      const output = consoleSpy.mock.calls.map((call) => call[0]).join('\n');
      expect(output).toContain('No infected packages found');
      consoleSpy.mockRestore();
    });

    it('should print critical warning when infected packages found', () => {
      const scanner = new PackageScanner({ quiet: true });
      scanner.scanPackageJsonContent(JSON.stringify({ dependencies: { 'posthog-js': '1.297.3' } }));

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      scanner.printResults();

      const output = consoleSpy.mock.calls.map((call) => call[0]).join('\n');
      expect(output).toContain('CRITICAL');
      expect(output).toContain('posthog-js');
      consoleSpy.mockRestore();
    });

    it('should print warnings when packages on list with different version', () => {
      const scanner = new PackageScanner({ quiet: true });
      scanner.scanPackageJsonContent(JSON.stringify({ dependencies: { 'posthog-js': '1.0.0' } }));

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      scanner.printResults();

      const output = consoleSpy.mock.calls.map((call) => call[0]).join('\n');
      expect(output).toContain('WARNING');
      consoleSpy.mockRestore();
    });

    it('should print recommended actions when infected', () => {
      const scanner = new PackageScanner({ quiet: true });
      scanner.scanPackageJsonContent(JSON.stringify({ dependencies: { 'posthog-js': '1.297.3' } }));

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      scanner.printResults();

      const output = consoleSpy.mock.calls.map((call) => call[0]).join('\n');
      expect(output).toContain('RECOMMENDED ACTIONS');
      consoleSpy.mockRestore();
    });
  });

  describe('checkPackage severity', () => {
    let scanner;

    beforeEach(() => {
      scanner = new PackageScanner({ quiet: true });
    });

    it('should mark exact version match as CRITICAL', () => {
      scanner.checkPackage('posthog-js', '1.297.3', 'direct');

      expect(scanner.results.infected.length).toBe(1);
      expect(scanner.results.infected[0].severity).toBe('CRITICAL');
    });

    it('should mark different version as WARNING', () => {
      scanner.checkPackage('posthog-js', '1.0.0', 'direct');

      expect(scanner.results.warnings.length).toBe(1);
      expect(scanner.results.warnings[0].severity).toBe('WARNING');
    });

    it('should include infected versions in finding', () => {
      scanner.checkPackage('posthog-js', '1.297.3', 'direct');

      expect(scanner.results.infected[0].infectedVersions).toContain('1.297.3');
    });

    it('should record dependency type', () => {
      scanner.checkPackage('posthog-js', '1.297.3', 'transitive');

      expect(scanner.results.infected[0].type).toBe('transitive');
    });
  });

  describe('scanPackageLockContent edge cases', () => {
    let scanner;

    beforeEach(() => {
      scanner = new PackageScanner({ quiet: true });
    });

    it('should handle invalid JSON', () => {
      scanner.scanPackageLockContent('not valid json');
      expect(scanner.results.totalPackages).toBe(0);
    });

    it('should handle both packages and dependencies in same file', () => {
      const content = JSON.stringify({
        packages: {
          '': {},
          'node_modules/a': { version: '1.0.0' },
        },
        dependencies: {
          b: { version: '1.0.0' },
        },
      });

      scanner.scanPackageLockContent(content);
      expect(scanner.results.totalPackages).toBe(2);
    });

    it('should skip empty package paths', () => {
      const content = JSON.stringify({
        packages: {
          '': { version: '1.0.0' },
          'node_modules/a': { version: '1.0.0' },
        },
      });

      scanner.scanPackageLockContent(content);
      expect(scanner.results.totalPackages).toBe(1);
    });

    it('should handle packages without version', () => {
      const content = JSON.stringify({
        packages: {
          '': {},
          'node_modules/a': {},
        },
      });

      scanner.scanPackageLockContent(content);
      expect(scanner.results.totalPackages).toBe(0);
    });
  });

  describe('scanYarnLockContent edge cases', () => {
    let scanner;

    beforeEach(() => {
      scanner = new PackageScanner({ quiet: true });
    });

    it('should handle yarn berry format with __metadata', () => {
      const content = `__metadata:
  version: 6

"lodash@npm:^4.17.21":
  version: 4.17.21
`;

      scanner.scanYarnLockContent(content);
      expect(scanner.results.totalPackages).toBe(1);
    });

    it('should handle multiple version constraints on same line', () => {
      const content = `
"lodash@^4.0.0, lodash@^4.17.0":
  version "4.17.21"
`;

      scanner.scanYarnLockContent(content);
      expect(scanner.results.totalPackages).toBe(1);
    });
  });

  describe('scanPnpmLockContent edge cases', () => {
    let scanner;

    beforeEach(() => {
      scanner = new PackageScanner({ quiet: true });
    });

    it('should stop parsing when hitting another top-level key', () => {
      const content = `
lockfileVersion: '9.0'

packages:
  'lodash@4.17.21':
    resolution: {integrity: sha512-xxx}

snapshots:
  'lodash@4.17.21':
    something: else
`;

      scanner.scanPnpmLockContent(content);
      expect(scanner.results.totalPackages).toBe(1);
    });

    it('should handle v6 format with leading slash', () => {
      const content = `
lockfileVersion: '6.0'

packages:
  '/lodash@4.17.21':
    resolution: {integrity: sha512-xxx}
`;

      scanner.scanPnpmLockContent(content);
      expect(scanner.results.totalPackages).toBe(1);
    });
  });
});
