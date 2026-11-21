// Turns the editor's in-memory board into files and commits them to GitHub.
import { commitFiles } from './github';

// Files picked in the editor that are too big for data URLs (videos, audio).
// key = the path the board JSON will reference (e.g. "assets/videos/market.mp4"), value = File
export const pendingFiles = new Map();
const previewUrls = new Map();

export const addPendingFile = (assetPath, file) => {
  pendingFiles.set(assetPath, file);
  if (previewUrls.has(assetPath)) URL.revokeObjectURL(previewUrls.get(assetPath));
  previewUrls.set(assetPath, URL.createObjectURL(file));
};

// In the editor, show a freshly picked file before it has been published.
export const previewUrlFor = (assetPath) => previewUrls.get(assetPath) || null;

const MAX_BYTES = 95 * 1024 * 1024; // GitHub refuses files over 100 MB

const EXT = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp', 'image/svg+xml': 'svg',
  'audio/webm': 'webm', 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/ogg': 'ogg', 'audio/wav': 'wav', 'audio/x-wav': 'wav',
  'video/mp4': 'mp4', 'video/webm': 'webm',
};

const shortHash = async (str) => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].slice(0, 6).map((b) => b.toString(16).padStart(2, '0')).join('');
};

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

// Replace every embedded data: URL in the month with a real file in public/assets/uploads/<month>/.
const extractDataUrls = async (monthKey, monthData, uploads) => {
  const walk = async (value) => {
    if (typeof value === 'string') {
      const m = value.match(/^data:([\w/+.-]+);base64,(.*)$/s);
      if (!m) return value;
      const ext = EXT[m[1]] || 'bin';
      const name = `${await shortHash(m[2])}.${ext}`;
      const assetPath = `assets/uploads/${monthKey}/${name}`;
      if (!uploads.some((u) => u.path === `public/${assetPath}`)) {
        uploads.push({ path: `public/${assetPath}`, base64: m[2] });
      }
      return assetPath;
    }
    if (Array.isArray(value)) return Promise.all(value.map(walk));
    if (value && typeof value === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(value)) out[k] = await walk(v);
      return out;
    }
    return value;
  };
  return walk(monthData);
};

const usedAssetPaths = (obj, set = new Set()) => {
  if (typeof obj === 'string') {
    set.add(obj);
    set.add(`assets/videos/${obj}`); // local-video items store just the file name
  } else if (Array.isArray(obj)) obj.forEach((v) => usedAssetPaths(v, set));
  else if (obj && typeof obj === 'object') Object.values(obj).forEach((v) => usedAssetPaths(v, set));
  return set;
};

/**
 * Publish one or more months (and the shared tags) in a single commit.
 * months: { "2026-12": monthData, ... }
 * onProgress: (text) => void
 */
export const publishMonths = async (months, tags, onProgress = () => {}) => {
  const files = [];
  const uploads = [];
  const keys = Object.keys(months).sort();

  for (const key of keys) {
    onProgress(`Preparing ${key}…`);
    const clean = await extractDataUrls(key, months[key], uploads);
    const data = {
      items: clean.items || [],
      decorations: clean.decorations || [],
      customHtml: clean.customHtml || '',
      customCss: clean.customCss || '',
      ...(clean.backgroundImage ? { backgroundImage: clean.backgroundImage } : {}),
      ...(clean.borderImage ? { borderImage: clean.borderImage } : {}),
    };
    files.push({ path: `public/data/months/${key}.json`, text: JSON.stringify(data, null, 2) + '\n' });

    // Picked video/audio files that this month actually uses
    const used = usedAssetPaths(data);
    for (const [assetPath, file] of pendingFiles) {
      if (!used.has(assetPath)) continue;
      if (file.size > MAX_BYTES) {
        throw new Error(`${file.name} is ${(file.size / 1048576).toFixed(0)} MB. GitHub only takes files under 100 MB — please make the video smaller first.`);
      }
      onProgress(`Reading ${file.name}…`);
      uploads.push({ path: `public/${assetPath}`, base64: await fileToBase64(file) });
    }
  }

  if (tags) files.push({ path: 'public/data/tags.json', text: JSON.stringify(tags, null, 2) + '\n' });

  const all = [...uploads, ...files];
  onProgress(`Uploading ${all.length} file${all.length === 1 ? '' : 's'}…`);
  const sha = await commitFiles(all, `Update board ${keys.join(', ')}`);

  // Uploaded files are now in the repo, so they no longer need to be kept here.
  uploads.forEach((u) => pendingFiles.delete(u.path.replace(/^public\//, '')));
  return sha;
};
