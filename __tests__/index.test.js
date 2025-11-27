const index = require('../index');

describe('Module exports', () => {
  it('should export PackageScanner', () => {
    expect(index.PackageScanner).toBeDefined();
    expect(typeof index.PackageScanner).toBe('function');
  });

  it('should export INFECTED_PACKAGES', () => {
    expect(index.INFECTED_PACKAGES).toBeDefined();
    expect(index.INFECTED_PACKAGES).toBeInstanceOf(Map);
  });

  it('should export ALL_INFECTED_NAMES', () => {
    expect(index.ALL_INFECTED_NAMES).toBeDefined();
    expect(Array.isArray(index.ALL_INFECTED_NAMES)).toBe(true);
  });

  it('should export fetchRepositoryFiles', () => {
    expect(index.fetchRepositoryFiles).toBeDefined();
    expect(typeof index.fetchRepositoryFiles).toBe('function');
  });

  it('should export parseGitHubInput', () => {
    expect(index.parseGitHubInput).toBeDefined();
    expect(typeof index.parseGitHubInput).toBe('function');
  });

  it('should export fetchNpmPackage', () => {
    expect(index.fetchNpmPackage).toBeDefined();
    expect(typeof index.fetchNpmPackage).toBe('function');
  });

  it('should export parseNpmPackageInput', () => {
    expect(index.parseNpmPackageInput).toBeDefined();
    expect(typeof index.parseNpmPackageInput).toBe('function');
  });

  describe('PackageScanner instantiation', () => {
    it('should create instance with new', () => {
      const scanner = new index.PackageScanner();
      expect(scanner).toBeDefined();
      expect(typeof scanner.scanPackageJson).toBe('function');
      expect(typeof scanner.scanPackageLock).toBe('function');
      expect(typeof scanner.getResults).toBe('function');
    });
  });
});
