const { INFECTED_PACKAGES, ALL_INFECTED_NAMES } = require('../data/infected-packages');

describe('Infected Packages Database', () => {
  describe('INFECTED_PACKAGES', () => {
    it('should be a Map', () => {
      expect(INFECTED_PACKAGES).toBeInstanceOf(Map);
    });

    it('should have entries', () => {
      expect(INFECTED_PACKAGES.size).toBeGreaterThan(0);
    });

    it('should have known infected packages', () => {
      expect(INFECTED_PACKAGES.has('posthog-js')).toBe(true);
      expect(INFECTED_PACKAGES.has('posthog-node')).toBe(true);
    });

    it('should have version arrays for each package', () => {
      for (const [name, versions] of INFECTED_PACKAGES) {
        expect(Array.isArray(versions)).toBe(true);
        expect(versions.length).toBeGreaterThan(0);
        versions.forEach((version) => {
          expect(typeof version).toBe('string');
          expect(version.length).toBeGreaterThan(0);
        });
      }
    });

    it('should have valid semver-like versions', () => {
      const versionRegex = /^\d+\.\d+\.\d+(-[\w.]+)?$/;

      for (const [name, versions] of INFECTED_PACKAGES) {
        versions.forEach((version) => {
          expect(version).toMatch(versionRegex);
        });
      }
    });
  });

  describe('ALL_INFECTED_NAMES', () => {
    it('should be an array', () => {
      expect(Array.isArray(ALL_INFECTED_NAMES)).toBe(true);
    });

    it('should have entries', () => {
      expect(ALL_INFECTED_NAMES.length).toBeGreaterThan(0);
    });

    it('should match INFECTED_PACKAGES keys', () => {
      const mapKeys = Array.from(INFECTED_PACKAGES.keys());
      expect(ALL_INFECTED_NAMES.sort()).toEqual(mapKeys.sort());
    });

    it('should contain known infected packages', () => {
      expect(ALL_INFECTED_NAMES).toContain('posthog-js');
      expect(ALL_INFECTED_NAMES).toContain('posthog-node');
      expect(ALL_INFECTED_NAMES).toContain('kill-port');
    });

    it('should have unique entries', () => {
      const uniqueNames = new Set(ALL_INFECTED_NAMES);
      expect(uniqueNames.size).toBe(ALL_INFECTED_NAMES.length);
    });
  });

  describe('Package name format', () => {
    it('should have valid npm package names', () => {
      const validNameRegex = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

      ALL_INFECTED_NAMES.forEach((name) => {
        expect(name).toMatch(validNameRegex);
      });
    });

    it('should handle scoped packages correctly', () => {
      const scopedPackages = ALL_INFECTED_NAMES.filter((name) => name.startsWith('@'));
      expect(scopedPackages.length).toBeGreaterThan(0);

      scopedPackages.forEach((name) => {
        expect(name).toContain('/');
      });
    });
  });
});
