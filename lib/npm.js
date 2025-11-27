/**
 * NPM Registry Fetcher
 *
 * Fetches package information from npm registry for scanning.
 */

const https = require('https');

const COLORS = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

const c = (color, text) => `${COLORS[color]}${text}${COLORS.reset}`;

/**
 * Parse npm package input (name or name@version)
 * @param {string} input - Package name with optional version
 * @returns {{ name: string, version: string | null }}
 */
function parseNpmPackageInput(input) {
  // Handle scoped packages: @scope/package or @scope/package@version
  if (input.startsWith('@')) {
    const scopedMatch = input.match(/^(@[^\/]+\/[^@]+)(?:@(.+))?$/);
    if (scopedMatch) {
      return {
        name: scopedMatch[1],
        version: scopedMatch[2] || null,
      };
    }
  }

  // Handle regular packages: package or package@version
  const match = input.match(/^([^@]+)(?:@(.+))?$/);
  if (match) {
    return {
      name: match[1],
      version: match[2] || null,
    };
  }

  throw new Error(`Invalid npm package format: ${input}`);
}

/**
 * Make HTTPS request with promise
 * @param {string} url - URL to fetch
 * @returns {Promise<{ statusCode: number, data: string }>}
 */
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'shai-hulud-2-scan/1.0',
        Accept: 'application/json',
      },
    };

    https
      .get(url, options, (res) => {
        // Handle redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return httpsGet(res.headers.location).then(resolve).catch(reject);
        }

        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
        res.on('error', reject);
      })
      .on('error', reject);
  });
}

/**
 * Fetch package info from npm registry
 * @param {string} packageName - Package name (with or without scope)
 * @param {string | null} version - Specific version or null for latest
 * @returns {Promise<object>}
 */
async function fetchPackageInfo(packageName, version = null) {
  // Encode scoped package names for URL
  const encodedName = packageName.replace('/', '%2F');

  // Build URL - if version specified, fetch that version; otherwise fetch all and get latest
  const url = version
    ? `https://registry.npmjs.org/${encodedName}/${version}`
    : `https://registry.npmjs.org/${encodedName}/latest`;

  const { statusCode, data } = await httpsGet(url);

  if (statusCode === 404) {
    throw new Error(`Package not found: ${packageName}${version ? `@${version}` : ''}`);
  }

  if (statusCode !== 200) {
    throw new Error(`npm registry error (${statusCode}): Failed to fetch package info`);
  }

  return JSON.parse(data);
}

/**
 * Fetch package and its dependencies from npm registry
 * @param {string} input - Package name with optional version
 * @param {object} options - Options
 * @returns {Promise<{ packageInfo: object, packageJson: string }>}
 */
async function fetchNpmPackage(input, options = {}) {
  const { quiet, json } = options;

  const log = (...args) => {
    if (!quiet && !json) console.log(...args);
  };

  // Parse input
  const { name, version } = parseNpmPackageInput(input);

  log(c('cyan', `\n📦 Fetching from npm: ${name}${version ? `@${version}` : ' (latest)'}`));

  // Fetch package info
  const packageInfo = await fetchPackageInfo(name, version);

  const actualVersion = packageInfo.version;
  log(`   Version: ${c('green', actualVersion)}`);

  // Count dependencies
  const depCount = Object.keys(packageInfo.dependencies || {}).length;
  const devDepCount = Object.keys(packageInfo.devDependencies || {}).length;
  const peerDepCount = Object.keys(packageInfo.peerDependencies || {}).length;

  log(`   Dependencies: ${depCount} direct, ${devDepCount} dev, ${peerDepCount} peer\n`);

  // Create a package.json-like structure for scanning
  const packageJson = JSON.stringify({
    name: packageInfo.name,
    version: packageInfo.version,
    dependencies: packageInfo.dependencies || {},
    devDependencies: packageInfo.devDependencies || {},
    peerDependencies: packageInfo.peerDependencies || {},
    optionalDependencies: packageInfo.optionalDependencies || {},
  });

  return {
    packageInfo: {
      name: packageInfo.name,
      version: actualVersion,
      description: packageInfo.description,
      npmUrl: `https://www.npmjs.com/package/${name}`,
    },
    packageJson,
  };
}

module.exports = {
  parseNpmPackageInput,
  fetchNpmPackage,
  fetchPackageInfo,
};
