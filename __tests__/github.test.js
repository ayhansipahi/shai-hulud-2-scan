const { parseGitHubInput } = require('../lib/github');

describe('GitHub Module', () => {
  describe('parseGitHubInput', () => {
    describe('owner/repo format', () => {
      it('should parse simple owner/repo', () => {
        const result = parseGitHubInput('facebook/react');
        expect(result).toEqual({
          owner: 'facebook',
          repo: 'react',
          branch: null,
        });
      });

      it('should parse owner/repo with branch', () => {
        const result = parseGitHubInput('vercel/next.js@canary');
        expect(result).toEqual({
          owner: 'vercel',
          repo: 'next.js',
          branch: 'canary',
        });
      });

      it('should parse owner/repo with dots in repo name', () => {
        const result = parseGitHubInput('vercel/next.js');
        expect(result).toEqual({
          owner: 'vercel',
          repo: 'next.js',
          branch: null,
        });
      });

      it('should parse owner/repo with hyphen', () => {
        const result = parseGitHubInput('my-org/my-repo');
        expect(result).toEqual({
          owner: 'my-org',
          repo: 'my-repo',
          branch: null,
        });
      });

      it('should parse owner/repo with underscore', () => {
        const result = parseGitHubInput('my_org/my_repo');
        expect(result).toEqual({
          owner: 'my_org',
          repo: 'my_repo',
          branch: null,
        });
      });
    });

    describe('GitHub URL format', () => {
      it('should parse https://github.com/owner/repo', () => {
        const result = parseGitHubInput('https://github.com/facebook/react');
        expect(result).toEqual({
          owner: 'facebook',
          repo: 'react',
          branch: null,
        });
      });

      it('should parse http://github.com/owner/repo', () => {
        const result = parseGitHubInput('http://github.com/facebook/react');
        expect(result).toEqual({
          owner: 'facebook',
          repo: 'react',
          branch: null,
        });
      });

      it('should parse URL with .git suffix', () => {
        const result = parseGitHubInput('https://github.com/facebook/react.git');
        expect(result).toEqual({
          owner: 'facebook',
          repo: 'react',
          branch: null,
        });
      });

      it('should parse URL with trailing slash', () => {
        const result = parseGitHubInput('https://github.com/facebook/react/');
        expect(result).toEqual({
          owner: 'facebook',
          repo: 'react',
          branch: null,
        });
      });

      it('should parse URL with branch in tree path', () => {
        const result = parseGitHubInput('https://github.com/facebook/react/tree/main');
        expect(result).toEqual({
          owner: 'facebook',
          repo: 'react',
          branch: 'main',
        });
      });

      it('should parse URL with www prefix', () => {
        const result = parseGitHubInput('https://www.github.com/facebook/react');
        expect(result).toEqual({
          owner: 'facebook',
          repo: 'react',
          branch: null,
        });
      });

      it('should parse URL without protocol prefix', () => {
        const result = parseGitHubInput('github.com/facebook/react');
        expect(result).toEqual({
          owner: 'facebook',
          repo: 'react',
          branch: null,
        });
      });
    });

    describe('invalid inputs', () => {
      it('should throw error for invalid format', () => {
        expect(() => parseGitHubInput('invalid')).toThrow('Invalid GitHub repository format');
      });

      it('should throw error for empty string', () => {
        expect(() => parseGitHubInput('')).toThrow('Invalid GitHub repository format');
      });

      it('should throw error for just owner', () => {
        expect(() => parseGitHubInput('facebook')).toThrow('Invalid GitHub repository format');
      });

      it('should throw error for URL without repo', () => {
        expect(() => parseGitHubInput('https://github.com/facebook')).toThrow(
          'Invalid GitHub repository format'
        );
      });
    });
  });
});
