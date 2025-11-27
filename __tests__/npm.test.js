const { parseNpmPackageInput } = require('../lib/npm');

describe('NPM Module', () => {
  describe('parseNpmPackageInput', () => {
    describe('unscoped packages', () => {
      it('should parse simple package name', () => {
        const result = parseNpmPackageInput('lodash');
        expect(result).toEqual({
          name: 'lodash',
          version: null,
        });
      });

      it('should parse package with version', () => {
        const result = parseNpmPackageInput('lodash@4.17.21');
        expect(result).toEqual({
          name: 'lodash',
          version: '4.17.21',
        });
      });

      it('should parse package with semver range', () => {
        const result = parseNpmPackageInput('lodash@^4.17.0');
        expect(result).toEqual({
          name: 'lodash',
          version: '^4.17.0',
        });
      });

      it('should parse package with tilde version', () => {
        const result = parseNpmPackageInput('express@~4.18.0');
        expect(result).toEqual({
          name: 'express',
          version: '~4.18.0',
        });
      });

      it('should parse package with hyphen in name', () => {
        const result = parseNpmPackageInput('my-package');
        expect(result).toEqual({
          name: 'my-package',
          version: null,
        });
      });

      it('should parse package name with dots', () => {
        const result = parseNpmPackageInput('package.name');
        expect(result).toEqual({
          name: 'package.name',
          version: null,
        });
      });

      it('should parse package with tag', () => {
        const result = parseNpmPackageInput('react@latest');
        expect(result).toEqual({
          name: 'react',
          version: 'latest',
        });
      });

      it('should parse package with beta tag', () => {
        const result = parseNpmPackageInput('react@beta');
        expect(result).toEqual({
          name: 'react',
          version: 'beta',
        });
      });

      it('should parse package with prerelease version', () => {
        const result = parseNpmPackageInput('package@1.0.0-alpha.1');
        expect(result).toEqual({
          name: 'package',
          version: '1.0.0-alpha.1',
        });
      });
    });

    describe('scoped packages', () => {
      it('should parse scoped package without version', () => {
        const result = parseNpmPackageInput('@angular/core');
        expect(result).toEqual({
          name: '@angular/core',
          version: null,
        });
      });

      it('should parse scoped package with version', () => {
        const result = parseNpmPackageInput('@angular/core@16.0.0');
        expect(result).toEqual({
          name: '@angular/core',
          version: '16.0.0',
        });
      });

      it('should parse scoped package with semver range', () => {
        const result = parseNpmPackageInput('@types/node@^20.0.0');
        expect(result).toEqual({
          name: '@types/node',
          version: '^20.0.0',
        });
      });

      it('should parse scoped package with tag', () => {
        const result = parseNpmPackageInput('@angular/core@latest');
        expect(result).toEqual({
          name: '@angular/core',
          version: 'latest',
        });
      });

      it('should parse scoped package with hyphen in scope', () => {
        const result = parseNpmPackageInput('@my-scope/my-package');
        expect(result).toEqual({
          name: '@my-scope/my-package',
          version: null,
        });
      });

      it('should parse scoped package with underscore', () => {
        const result = parseNpmPackageInput('@my_scope/my_package@1.0.0');
        expect(result).toEqual({
          name: '@my_scope/my_package',
          version: '1.0.0',
        });
      });
    });

    describe('edge cases', () => {
      it('should handle package name with numbers', () => {
        const result = parseNpmPackageInput('package123@1.0.0');
        expect(result).toEqual({
          name: 'package123',
          version: '1.0.0',
        });
      });

      it('should handle complex version strings', () => {
        const result = parseNpmPackageInput('package@>=1.0.0 <2.0.0');
        expect(result).toEqual({
          name: 'package',
          version: '>=1.0.0 <2.0.0',
        });
      });
    });
  });
});
