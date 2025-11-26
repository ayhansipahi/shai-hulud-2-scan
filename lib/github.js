/**
 * GitHub Repository Fetcher
 *
 * Fetches package files from GitHub repositories for remote scanning.
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
 * Parse GitHub repo input (URL or owner/repo format)
 * @param {string} input - GitHub URL or owner/repo string
 * @returns {{ owner: string, repo: string, branch: string | null }}
 */
function parseGitHubInput(input) {
    // Handle full GitHub URLs
    // https://github.com/owner/repo
    // https://github.com/owner/repo/tree/branch
    // https://github.com/owner/repo.git
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/\s#?]+?)(?:\.git)?(?:\/tree\/([^\/\s#?]+))?(?:\/)?$/i;
    const urlMatch = input.match(urlPattern);

    if (urlMatch) {
        return {
            owner: urlMatch[1],
            repo: urlMatch[2].replace(/\.git$/, ''),
            branch: urlMatch[3] || null,
        };
    }

    // Handle owner/repo format (supports dots like next.js)
    const shortPattern = /^([^\/\s]+)\/([^\/\s#@]+?)(?:@([^\/\s]+))?$/;
    const shortMatch = input.match(shortPattern);

    if (shortMatch) {
        return {
            owner: shortMatch[1],
            repo: shortMatch[2],
            branch: shortMatch[3] || null,
        };
    }

    throw new Error(`Invalid GitHub repository format: ${input}\nExpected: owner/repo, owner/repo@branch, or https://github.com/owner/repo`);
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
                'Accept': 'application/vnd.github.v3.raw',
            },
        };

        https.get(url, options, (res) => {
            // Handle redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return httpsGet(res.headers.location).then(resolve).catch(reject);
            }

            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, data }));
            res.on('error', reject);
        }).on('error', reject);
    });
}

/**
 * Get default branch for a repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<string>}
 */
async function getDefaultBranch(owner, repo) {
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    const { statusCode, data } = await httpsGet(url);

    if (statusCode === 404) {
        throw new Error(`Repository not found: ${owner}/${repo}`);
    }

    if (statusCode !== 200) {
        throw new Error(`GitHub API error (${statusCode}): Failed to get repository info`);
    }

    const repoInfo = JSON.parse(data);
    return repoInfo.default_branch || 'main';
}

/**
 * Fetch file content from GitHub repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} branch - Branch name
 * @param {string} filePath - Path to file
 * @returns {Promise<string | null>}
 */
async function fetchFileContent(owner, repo, branch, filePath) {
    // Use raw.githubusercontent.com for direct file access
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;

    try {
        const { statusCode, data } = await httpsGet(url);

        if (statusCode === 404) {
            return null; // File doesn't exist
        }

        if (statusCode !== 200) {
            return null;
        }

        return data;
    } catch (err) {
        return null;
    }
}

/**
 * Fetch all package files from a GitHub repository
 * @param {string} input - GitHub URL or owner/repo string
 * @param {object} options - Options
 * @returns {Promise<{ repoInfo: object, files: object }>}
 */
async function fetchRepositoryFiles(input, options = {}) {
    const { quiet, json } = options;

    const log = (...args) => {
        if (!quiet && !json) console.log(...args);
    };

    // Parse input
    const { owner, repo, branch: specifiedBranch } = parseGitHubInput(input);

    log(c('cyan', `\n🌐 Fetching from GitHub: ${owner}/${repo}`));

    // Get branch (use specified or fetch default)
    let branch = specifiedBranch;
    if (!branch) {
        log(`   Detecting default branch...`);
        branch = await getDefaultBranch(owner, repo);
    }
    log(`   Branch: ${c('green', branch)}`);

    // Define files to fetch
    const filesToFetch = [
        { name: 'package.json', key: 'packageJson' },
        { name: 'package-lock.json', key: 'packageLock' },
        { name: 'yarn.lock', key: 'yarnLock' },
        { name: 'pnpm-lock.yaml', key: 'pnpmLock' },
    ];

    log(`   Fetching package files...`);

    // Fetch all files in parallel
    const results = await Promise.all(
        filesToFetch.map(async ({ name, key }) => {
            const content = await fetchFileContent(owner, repo, branch, name);
            return { name, key, content };
        })
    );

    // Build files object
    const files = {};
    const foundFiles = [];

    for (const { name, key, content } of results) {
        if (content) {
            files[key] = content;
            foundFiles.push(name);
        }
    }

    if (foundFiles.length === 0) {
        throw new Error(`No package files found in ${owner}/${repo}. Is this a JavaScript/Node.js project?`);
    }

    log(`   Found: ${c('green', foundFiles.join(', '))}\n`);

    return {
        repoInfo: {
            owner,
            repo,
            branch,
            url: `https://github.com/${owner}/${repo}`,
        },
        files,
    };
}

module.exports = {
    parseGitHubInput,
    fetchRepositoryFiles,
    fetchFileContent,
    getDefaultBranch,
};
