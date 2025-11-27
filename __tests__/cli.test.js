const { execSync, spawn } = require('child_process');
const path = require('path');

const CLI_PATH = path.join(__dirname, '..', 'bin', 'cli.js');

// Helper to run CLI and capture output
function runCLI(args = [], options = {}) {
  const result = {
    stdout: '',
    stderr: '',
    exitCode: 0,
  };

  try {
    result.stdout = execSync(`node ${CLI_PATH} ${args.join(' ')}`, {
      encoding: 'utf8',
      timeout: 30000,
      ...options,
    });
  } catch (err) {
    result.stdout = err.stdout || '';
    result.stderr = err.stderr || '';
    result.exitCode = err.status || 1;
  }

  return result;
}

describe('CLI', () => {
  describe('--help', () => {
    it('should display help message', () => {
      const result = runCLI(['--help']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('USAGE:');
      expect(result.stdout).toContain('OPTIONS:');
      expect(result.stdout).toContain('EXAMPLES:');
    });

    it('should display help with -h flag', () => {
      const result = runCLI(['-h']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('USAGE:');
    });
  });

  describe('--version', () => {
    it('should display version', () => {
      const result = runCLI(['--version']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/v\d+\.\d+\.\d+/);
    });

    it('should display version with -v flag', () => {
      const result = runCLI(['-v']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/v\d+\.\d+\.\d+/);
    });
  });

  describe('--list', () => {
    it('should list infected packages', () => {
      const result = runCLI(['--list']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Known Infected Packages');
      expect(result.stdout).toContain('posthog-js');
    });
  });

  describe('--check', () => {
    it('should detect infected package', () => {
      const result = runCLI(['--check', 'posthog-js']);
      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain('WARNING');
      expect(result.stdout).toContain('posthog-js');
    });

    it('should confirm clean package', () => {
      const result = runCLI(['--check', 'lodash']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('NOT on the infected packages list');
    });

    it('should check scoped package', () => {
      const result = runCLI(['--check', '@types/node']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('NOT on the infected packages list');
    });
  });

  describe('--json', () => {
    it('should output valid JSON', () => {
      const result = runCLI(['--json'], {
        cwd: path.join(__dirname, '..'),
      });

      expect(() => JSON.parse(result.stdout)).not.toThrow();
      const json = JSON.parse(result.stdout);
      expect(json).toHaveProperty('scannedFiles');
      expect(json).toHaveProperty('totalPackages');
      expect(json).toHaveProperty('summary');
    });

    it('should include summary in JSON output', () => {
      const result = runCLI(['--json'], {
        cwd: path.join(__dirname, '..'),
      });

      const json = JSON.parse(result.stdout);
      expect(json.summary).toHaveProperty('totalScanned');
      expect(json.summary).toHaveProperty('criticalFindings');
      expect(json.summary).toHaveProperty('warnings');
      expect(json.summary).toHaveProperty('isClean');
    });
  });

  describe('scanning current project', () => {
    it('should scan package.json in project root', () => {
      const result = runCLI([], {
        cwd: path.join(__dirname, '..'),
      });

      expect(result.stdout).toContain('SCAN RESULTS');
      expect(result.stdout).toContain('Total packages scanned');
    });

    it('should scan with --quiet flag', () => {
      const result = runCLI(['--quiet'], {
        cwd: path.join(__dirname, '..'),
      });

      // Quiet mode should have minimal or no output for clean scan
      expect(result.exitCode).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should error when no package.json found', () => {
      const result = runCLI([], {
        cwd: '/tmp',
      });

      expect(result.exitCode).toBe(1);
      expect(result.stderr || result.stdout).toContain('No package.json');
    });

    it('should error when --repo flag missing value', () => {
      const result = runCLI(['--repo']);
      expect(result.exitCode).toBe(1);
    });

    it('should error when --npm flag missing value', () => {
      const result = runCLI(['--npm']);
      expect(result.exitCode).toBe(1);
    });
  });

  describe('lock file scanning', () => {
    it('should scan with --lock flag', () => {
      const result = runCLI(['--lock'], {
        cwd: path.join(__dirname, '..'),
      });

      // Should find and scan package-lock.json
      expect(result.stdout).toContain('Scanning');
    });
  });
});
