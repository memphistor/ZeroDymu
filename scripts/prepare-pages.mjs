/**
 * Prepares the `expo export --platform web` output for GitHub Pages.
 *
 * Expo writes flat files (`/breath.html`), but GitHub Pages only resolves a
 * clean URL like `/ZeroDymu/breath` if it finds `/ZeroDymu/breath/index.html`.
 * This script rewrites each route into its own directory so deep links and
 * refreshes work, and adds the extras Pages needs.
 *
 * Run via `npm run deploy` (or `npm run build:web`).
 */
import { cp, mkdir, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
if (!existsSync(DIST)) {
  console.error('dist/ not found — run `expo export --platform web` first.');
  process.exit(1);
}

/** Routes that must stay as top-level files rather than directories. */
const KEEP_AS_FILE = new Set(['index.html', '404.html']);

/** `foo.html` -> `foo`; nested `(tabs)/index.html` -> `(tabs)`. */
function routeDirFor(file) {
  const noExt = file.slice(0, -'.html'.length);
  return noExt.endsWith('/index') ? noExt.slice(0, -'/index'.length) : noExt;
}

/** Walk the export and collect every `.html` file, relative to `dist/`. */
async function findHtmlFiles(dir = DIST, prefix = '') {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      // Leave build output and assets alone.
      if (['_expo', 'assets', 'node_modules'].includes(entry.name)) continue;
      found.push(...(await findHtmlFiles(path.join(dir, entry.name), rel)));
    } else if (entry.name.endsWith('.html')) {
      found.push(rel);
    }
  }
  return found;
}

let converted = 0;
for (const rel of await findHtmlFiles()) {
  const base = path.basename(rel);
  if (KEEP_AS_FILE.has(base)) continue;

  const from = path.join(DIST, rel);
  const targetDir = path.join(DIST, routeDirFor(rel));
  const to = path.join(targetDir, 'index.html');

  // Skip if we already rewrote this one (the walk can revisit it).
  if (from === to) continue;

  await mkdir(targetDir, { recursive: true });
  await rename(from, to);
  converted += 1;
}

// Pages serves this for any unknown path. Copying the entry HTML means the
// client router takes over and shows the in-app "not found" screen instead of
// a bare GitHub 404 — and a hard refresh on any route keeps working.
await cp(path.join(DIST, 'index.html'), path.join(DIST, '404.html'));

// Pages runs Jekyll by default, which drops files starting with an underscore
// (`_expo/`) — exactly where the JS bundle lives.
await writeFile(path.join(DIST, '.nojekyll'), '');

// gh-pages leaves these behind from the previous release when they are not in
// the new output. Guard against stale files (e.g. a `.gitignore`) being served.
for (const stale of ['_config.yml', '.gitignore']) {
  await rm(path.join(DIST, stale), { force: true });
}

// A tiny health file so it is obvious which commit is deployed.
const meta = {
  app: 'Zero Dymu',
  channel: 'github-pages',
  base: '/ZeroDymu',
  builtAt: new Date().toISOString(),
};
await writeFile(path.join(DIST, 'build-info.json'), `${JSON.stringify(meta, null, 2)}\n`);

// Fail loudly if the bundle would be served from the wrong origin.
const indexHtml = await import('node:fs/promises').then((fs) =>
  fs.readFile(path.join(DIST, 'index.html'), 'utf8'),
);
if (!indexHtml.includes('/ZeroDymu/_expo/')) {
  console.error('index.html does not reference /ZeroDymu/_expo/ — check expo.experiments.baseUrl.');
  process.exit(1);
}

console.log(`Prepared dist/ for GitHub Pages (${converted} routes rewritten).`);
