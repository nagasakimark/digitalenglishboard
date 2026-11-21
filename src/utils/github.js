// Minimal GitHub API client used by the editor to publish board changes straight to the repo.
// The token is a fine-grained personal access token with "Contents: read and write" on this repo only.
// It is stored in this browser's localStorage and never committed anywhere.

export const OWNER = 'nagasakimark';
export const REPO = 'digitalenglishboard';
export const BRANCH = 'main';

const TOKEN_KEY = 'deb-github-token';

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
};
export const setToken = (t) => {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t.trim());
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* ignore */ }
};
export const hasToken = () => !!getToken();

const api = async (path, { method = 'GET', body, accept } = {}) => {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: accept || 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try { msg = (await res.json()).message || msg; } catch { /* ignore */ }
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  if (accept && accept.includes('raw')) return res.text();
  return res.json();
};

// Check the token works and can write.
export const checkToken = async () => {
  const repo = await api('');
  if (!repo) throw new Error('Repository not found — check the token has access to digitalenglishboard.');
  if (repo.permissions && !repo.permissions.push) throw new Error('This token can read but not write. Give it "Contents: Read and write".');
  return true;
};

// Read a JSON file from the main branch (always the newest version, even before the site has redeployed).
export const readJsonFile = async (path) => {
  const text = await api(`/contents/${encodeURI(path)}?ref=${BRANCH}`, { accept: 'application/vnd.github.raw+json' });
  return text == null ? null : JSON.parse(text);
};

export const listDir = async (path) => {
  const entries = await api(`/contents/${encodeURI(path)}?ref=${BRANCH}`);
  return Array.isArray(entries) ? entries : [];
};

/**
 * Commit several files to main in ONE commit.
 * files: [{ path, text }] or [{ path, base64 }]
 */
export const commitFiles = async (files, message) => {
  const attempt = async () => {
    const ref = await api(`/git/ref/heads/${BRANCH}`);
    const parentSha = ref.object.sha;
    const parent = await api(`/git/commits/${parentSha}`);

    const tree = [];
    for (const f of files) {
      const blob = await api('/git/blobs', {
        method: 'POST',
        body: f.base64 != null ? { content: f.base64, encoding: 'base64' } : { content: f.text, encoding: 'utf-8' },
      });
      tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    const newTree = await api('/git/trees', { method: 'POST', body: { base_tree: parent.tree.sha, tree } });
    const commit = await api('/git/commits', {
      method: 'POST',
      body: { message, tree: newTree.sha, parents: [parentSha] },
    });
    await api(`/git/refs/heads/${BRANCH}`, { method: 'PATCH', body: { sha: commit.sha } });
    return commit.sha;
  };

  try {
    return await attempt();
  } catch (e) {
    // Someone (or another tab) pushed in between: try once more on top of the new commit.
    if (e.status === 422 || e.status === 409) return attempt();
    throw e;
  }
};

// Latest Pages deploy workflow run, so the editor can show "Live in ~1 min".
export const latestDeployRun = async () => {
  const runs = await api('/actions/runs?branch=main&per_page=1');
  return runs?.workflow_runs?.[0] || null;
};
