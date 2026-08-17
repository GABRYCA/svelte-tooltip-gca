/**
 * Generates AI-friendly documentation files (static/llms.txt and static/llms-full.txt)
 * from a single source of truth so they never drift from the docs site:
 *
 *   - version / name / description / homepage  → read from package.json
 *   - title / description / FAQ                → imported from src/routes/seo.ts
 *     (the same module that feeds the visible FAQ and JSON-LD on the site)
 *   - install / quick start / API tables       → maintained here (mirrors README.md)
 *
 * Run automatically as part of `npm run build` (or manually: npm run generate:ai-docs).
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// --- Data sources -----------------------------------------------------------

const pkg = JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));

const { faqItems, description, siteUrl } = await import(
	pathToFileURL(path.join(projectRoot, 'src', 'routes', 'seo.ts')).href
);

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

- Single Svelte 5 action (\`use:tooltip\`) — no wrapper components required
- Auto light and dark theme detection
- Custom themes via a plain object
- Desktop and mobile friendly (hover, focus, tap, long-press)
- Keyboard friendly: opens on focus, dismisses with \`Escape\`
- Top-layer rendering via the native Popover API — never clipped, immune to z-index wars
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
