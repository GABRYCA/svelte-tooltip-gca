/**
 * Generates AI-friendly documentation files (static/llms.txt and static/llms-full.txt)
 * from a single source of truth so they never drift from the docs site:
 *
 *   - version / name / description / homepage  → read from package.json
 *   - description / siteUrl / FAQ               → parsed from src/routes/seo.ts
 *     (the same module that feeds the visible FAQ and JSON-LD on the site;
 *     parsed as text so this script runs identically on Node.js and Bun
 *     without requiring a TypeScript loader)
 *   - install / quick start / API tables       → maintained here (mirrors README.md)
 *
 * Run automatically as part of `npm run build` (or manually: npm run generate:ai-docs).
 * Compatible with Node.js >= 18 and Bun >= 1.0 (uses only node:fs / node:url / node:path).
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// --- Data sources -----------------------------------------------------------

const pkg = JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));

/**
 * Parse seo.ts as text (no TS import) for maximum runtime compatibility:
 * works on plain Node, npm, npx, Bun and Bunx without extra loaders.
 */
function parseSeoTs() {
	const src = readFileSync(path.join(projectRoot, 'src', 'routes', 'seo.ts'), 'utf8');
	const pick = (re, fallback = '') => {
		const m = src.match(re);
		return m?.[1] ?? fallback;
	};
	const siteUrl = pick(/export const siteUrl\s*=\s*['"]([^'"]+)['"]/, pkg.homepage ?? '');
	const description = pick(
		/export const description\s*=\s*'([\s\S]*?)';/,
		pkg.description ?? ''
	);
	const faqItems = [];
	const faqBlock = src.match(/export const faqItems[^=]*=\s*\[([\s\S]*?)\];/);
	const stripQuotes = (s) => s.slice(1, -1);
	if (faqBlock) {
		const re =
			/question\s*:\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")\s*,\s*answer\s*:\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g;
		let m;
		while ((m = re.exec(faqBlock[1]))) {
			faqItems.push({ question: stripQuotes(m[1]).trim(), answer: stripQuotes(m[2]).trim() });
		}
	}
	return { siteUrl, description, faqItems };
}

const { faqItems, description, siteUrl } = parseSeoTs();

const name = pkg.name;
const version = pkg.version;
const homepage = pkg.homepage;
const repo = pkg.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, '') ?? '';
const npmUrl = `https://www.npmjs.com/package/${name}`;
const license = pkg.license;

// --- Static content (mirrors README.md; API tables are maintained here) ----

const apiOptionsTable = `| Option | Type | Default | Description |
| --- | --- | --- | --- |
| \`content\` | \`string\` | — | Tooltip text (required for object form) |
| \`html\` | \`boolean\` | \`false\` | Render content as HTML (trusted only) |
| \`placement\` | \`'top' \\| 'bottom' \\| 'left' \\| 'right'\` | \`'top'\` | Preferred side |
| \`overflowBehavior\` | \`'shift' \\| 'flip'\` | \`'shift'\` | Viewport-overflow strategy |
| \`theme\` | \`'auto' \\| 'light' \\| 'dark' \\| TooltipTheme\` | \`'auto'\` | Theme mode or custom object |
| \`offset\` | \`number\` | \`8\` | Gap from target (px) |
| \`delay\` | \`number\` | \`120\` | Show delay (ms) |
| \`hideDelay\` | \`number\` | \`80\` | Hide delay (ms) |
| \`arrow\` | \`boolean\` | \`true\` | Show arrow |
| \`animation\` | \`boolean\` | \`true\` | Enable animation |
| \`animationDuration\` | \`number\` | \`160\` | Animation ms |
| \`disabled\` | \`boolean\` | \`false\` | Disable tooltip |
| \`class\` | \`string\` | \`''\` | Extra CSS class |
| \`maxWidth\` | \`number \\| string\` | theme | Max width override |
| \`touchBehavior\` | \`'tap' \\| 'longpress'\` | \`'tap'\` | Touch open behavior |
| \`longPressDuration\` | \`number\` | \`400\` | Long-press ms |
| \`touchHideDelay\` | \`number\` | \`3000\` | Auto-hide on touch (\`0\` = off) |
| \`showOnFocus\` | \`boolean\` | \`true\` | Show on keyboard focus |
| \`onShow\` / \`onHide\` | \`() => void\` | — | Lifecycle callbacks |`;

const faqMarkdown = faqItems
	.map(({ question, answer }) => `### ${question}\n\n${answer}`)
	.join('\n\n');

// --- llms.txt (index) -------------------------------------------------------

const llmsTxt = `# ${name}

> ${description}

${name} is an npm package that adds tooltips to any Svelte 5 element through a single Svelte action. It requires Svelte \`^5.0.0\` as a peer dependency and works in SvelteKit, Vite and any Svelte 5 app.

## Optional

- Package name: \`${name}\`
- Latest version: \`${version}\`
- License: ${license}
- Author: ${pkg.author?.name ?? 'GABRYCA'} (${pkg.author?.url ?? 'https://github.com/GABRYCA'})
- Dependencies: 0 runtime dependencies; peer dependency \`svelte ^5.0.0\`

## Important

- [Docs & Demo site](${homepage}): official documentation with a live playground, API reference, theming guide and FAQ
- [Full docs for LLMs (llms-full.txt)](${siteUrl}llms-full.txt): the complete documentation as a single Markdown file
- [npm package](${npmUrl}): install with \`npm install ${name}\`
- [GitHub repository](${repo}): source code, issues and changelog
- [License (${license})](${repo}/blob/master/LICENSE)
`;

// --- llms-full.txt (complete docs) ------------------------------------------

const llmsFullTxt = `# ${name} — complete documentation

> ${description}. ${license} licensed, no runtime dependencies, peer dependency \`svelte ^5.0.0\`.

This file contains the full documentation for the \`${name}\` package (v${version}) so LLMs and AI agents can answer questions about installation, usage, options, theming, mobile behavior, accessibility and the FAQ without fetching multiple pages.

## What it is

\`${name}\` is a tooltip library for Svelte 5 that ships as a single Svelte action. You attach it to any element with \`use:tooltip\`, passing either a string or an options object.

Key features:

- Single Svelte 5 action (\`use:tooltip\`), no wrapper components required
- Auto light and dark theme detection
- Custom themes via a plain object
- Desktop and mobile friendly (hover, focus, tap, long-press)
- Keyboard friendly: opens on focus, dismisses with \`Escape\`
- Top-layer rendering via the native Popover API: never clipped and immune to z-index wars
- Native CSS anchor positioning (Baseline 2026) with an automatic JS engine fallback for older browsers
- Smooth enter and leave animation (respects \`prefers-reduced-motion\`)
- Smart positioning: stays on the preferred side, shifts to fit, arrow re-aims at the target

## Install

\`\`\`sh
npm install ${name}
\`\`\`

Peer dependency: \`svelte\` ^5.0.0. The package has zero runtime dependencies.

## Quick start

\`\`\`svelte
<script>
  import { tooltip } from '${name}';
</script>

<button use:tooltip={'Saved!'}>Save</button>

<button
  use:tooltip={{
    content: 'Delete permanently',
    placement: 'right',
    delay: 200
  }}
>
  Delete
</button>
\`\`\`

## Options

\`use:tooltip\` accepts a **string** or an **options object**:

${apiOptionsTable}

### Overflow behavior

By default (\`'shift'\`) the tooltip **stays on its preferred side**, slides along the cross-axis to remain fully visible, and the **arrow re-aims** at the target element even when the panel is off-centre. It only flips to the opposite side when there is no room at all on the primary axis.

Pass \`overflowBehavior: 'flip'\` to restore the legacy strategy (try opposite, then perpendicular sides).

On browsers that support CSS anchor positioning (Baseline 2026: Chrome/Edge 125+, Firefox 145+, Safari 27+) both strategies run natively in the browser via \`position-area\` and \`position-try-fallbacks\`, and scroll tracking costs zero JavaScript. Older browsers automatically use the built-in JS engine described above. See the \`Anchor positioning\` section for details.

## Anchor positioning

From version 1.1.0 the action uses the browser's native CSS anchor positioning whenever it is supported (Baseline 2026: Chrome/Edge 125+, Firefox 145+, Safari 27+). The target element gets an inline \`anchor-name\`, the panel gets the matching \`position-anchor\`, and the browser performs the positioning itself:

- \`position-area\` selects the side named by \`placement\`
- \`position-try-fallbacks\` implements the \`overflowBehavior\` fallback order (mirror of the JS engine semantics)
- the gap from \`offset\` becomes a margin on the anchor edge via the internal \`--stt-offset\` variable
- scroll repositioning is fully native and costs zero JavaScript
- JavaScript keeps only the arrow aiming: it measures the post-layout result each frame and rewrites \`data-placement\` (arrow side and transform origin) plus the arrow offset

Targets that live inside an open popover and browsers without support automatically fall back to the built-in JS engine. No configuration is required and the public API is unchanged.

## Theming

### Auto (default)

Detection order:

1. \`data-theme\` / \`data-color-scheme\` / \`data-bs-theme\` on \`<html>\` or \`<body>\`
2. \`.dark\` / \`.theme-dark\` class
3. CSS \`color-scheme\`
4. \`prefers-color-scheme\` media query

### Force light or dark

Pass \`theme: 'light'\` or \`theme: 'dark'\` in the options object.

### Custom theme

Pass a partial \`TooltipTheme\` object — only override what you need:

\`\`\`ts
import type { TooltipTheme } from '${name}';

const brand: TooltipTheme = {
  background: '#ff3e00',
  color: '#1b1f24',
  borderRadius: '10px',
  shadow: '0 12px 28px -8px rgba(255, 62, 0, 0.35)',
  padding: '8px 12px'
};
\`\`\`

Theme fields: \`background\`, \`color\`, \`border\`, \`shadow\`, \`borderRadius\`, \`fontSize\`, \`fontFamily\`, \`fontWeight\`, \`padding\`, \`maxWidth\`, \`arrowSize\`, \`zIndex\`.

## Mobile

- \`touchBehavior: 'tap'\` (default): first tap shows, second or outside tap hides
- \`touchBehavior: 'longpress'\`: press and hold to show (cancelled if the finger moves — e.g. to scroll)
- Auto-hides after \`touchHideDelay\` (default 3s)

## Accessibility

- Tooltips render with \`role="tooltip"\` and are wired up via \`aria-describedby\`
- Focusable elements open the tooltip on keyboard focus
- Pressing \`Escape\` dismisses an open tooltip
- Animations are disabled when the user prefers reduced motion (\`prefers-reduced-motion: reduce\`)

## Exports

\`\`\`ts
import {
  tooltip,          // Svelte action
  lightTheme,       // default light theme object
  darkTheme,        // default dark theme object
  detectDarkMode,   // () => boolean
  resolveTheme      // resolve mode/partial → full theme
} from '${name}';

import type {
  TooltipParams,
  TooltipOptions,
  TooltipTheme,
  TooltipThemeMode,
  TooltipPlacement
} from '${name}';
\`\`\`

## FAQ

${faqMarkdown}

## Links

- Docs & Demo: ${homepage}
- GitHub repository: ${repo}
- npm package: ${npmUrl}
- Author: ${pkg.author?.name ?? 'GABRYCA'} (${pkg.author?.url ?? 'https://anonymousgca.eu'})

## License

${license} — see the LICENSE file in the repository.
`;

// --- Write ------------------------------------------------------------------

const staticDir = path.join(projectRoot, 'static');
writeFileSync(path.join(staticDir, 'llms.txt'), llmsTxt, 'utf8');
writeFileSync(path.join(staticDir, 'llms-full.txt'), llmsFullTxt, 'utf8');

console.log(`Generated AI docs for ${name} v${version}:`);
console.log(`  - ${path.relative(projectRoot, path.join(staticDir, 'llms.txt'))}`);
console.log(`  - ${path.relative(projectRoot, path.join(staticDir, 'llms-full.txt'))}`);
