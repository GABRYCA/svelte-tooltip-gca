# svelte-tooltip-gca

<img src="static/favicon.png" height="80" alt="svelte-tooltip-gca logo">

Modern, theme-aware tooltips for **Svelte 5** as a simple action:

```svelte
<button use:tooltip={'Hello world'}>Hover me</button>
```

- **Svelte 5** action (`use:tooltip`)
- **Auto light and dark** theme detection
- **Custom themes** via a plain object
- **Desktop and mobile friendly** (hover, focus, tap, long-press)
- **Keyboard friendly**: opens on focus, dismisses with `Escape`
- **Top-layer rendering** via the native Popover API: never clipped and immune to z-index wars
- **Native anchoring**: CSS anchor positioning keeps the panel glued to its target natively on modern browsers, with the JS engine as an automatic fallback
- Smooth **enter and leave animation** (respects `prefers-reduced-motion`)
- **Smart positioning**: stays on the preferred side, shifts to fit, and the arrow re-aims at the target

Demo and Docs: [GitHub Pages](https://gabryca.github.io/svelte-tooltip-gca/)

GitHub repository: [github.com/GABRYCA/svelte-tooltip-gca](https://github.com/GABRYCA/svelte-tooltip-gca)

NPM Repo: [npmjs.com/package/svelte-tooltip-gca](https://www.npmjs.com/package/svelte-tooltip-gca)

Author: [AnonymousGCA](https://anonymousgca.eu)

---

## Install

```sh
npm install svelte-tooltip-gca
```

or with Bun:

```sh
bun add svelte-tooltip-gca
```

Peer dependency: `svelte` ^5.0.0. Zero runtime dependencies. Works on Node.js (npm) and Bun 1.4+.

---

## Quick start

```svelte
<script>
  import { tooltip } from 'svelte-tooltip-gca';
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
```

---

## Options

`use:tooltip` accepts a **string** or an **options object**:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `content` | `string` | — | Tooltip text (required for object form) |
| `html` | `boolean` | `false` | Render content as HTML (trusted only) |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Preferred side |
| `overflowBehavior` | `'shift' \| 'flip'` | `'shift'` | Viewport-overflow strategy (see below); native on anchor-positioning browsers |
| `theme` | `'auto' \| 'light' \| 'dark' \| TooltipTheme` | `'auto'` | Theme mode or custom object |
| `offset` | `number` | `8` | Gap from target (px) |
| `delay` | `number` | `120` | Show delay (ms) |
| `hideDelay` | `number` | `80` | Hide delay (ms) |
| `arrow` | `boolean` | `true` | Show arrow |
| `animation` | `boolean` | `true` | Enable animation |
| `animationDuration` | `number` | `160` | Animation ms |
| `disabled` | `boolean` | `false` | Disable tooltip |
| `class` | `string` | `''` | Extra CSS class |
| `maxWidth` | `number \| string` | theme | Max width override |
| `touchBehavior` | `'tap' \| 'longpress'` | `'tap'` | Touch open behavior |
| `longPressDuration` | `number` | `400` | Long-press ms |
| `touchHideDelay` | `number` | `3000` | Auto-hide on touch (`0` = off) |
| `showOnFocus` | `boolean` | `true` | Show on keyboard focus |
| `onShow` / `onHide` | `() => void` | — | Lifecycle callbacks |

### Overflow behavior

By default (`'shift'`) the tooltip **stays on its preferred side**, slides along the
cross-axis to remain fully visible, and the **arrow re-aims** at the target element
even when the panel is off-centre. It only flips to the opposite side when there is
no room at all on the primary axis.

Pass `overflowBehavior: 'flip'` to restore the legacy strategy (try opposite, then
perpendicular sides):

```svelte
<button
  use:tooltip={{
    content: 'I flip to the other side when space is tight',
    placement: 'top',
    overflowBehavior: 'flip'
  }}
>
  Legacy flip
</button>
```

---

## Native anchor positioning

From version 1.1.0 the action uses the browser's **CSS anchor positioning** module
whenever it is supported (Baseline 2026: Chrome/Edge 125+, Firefox 145+, Safari 27+).
The target element receives an inline `anchor-name`, the panel gets the matching
`position-anchor`, and the browser performs the positioning by itself:

- `position-area` selects the side named by `placement`
- `position-try-fallbacks` implements the `overflowBehavior` fallback order, mirroring the JS engine semantics
- the `offset` gap becomes a margin on the anchor edge (internal `--stt-offset` variable)
- scroll repositioning is fully native, so scrolling costs zero JavaScript
- JavaScript keeps the arrow aiming: it measures the post-layout result each frame to re-aim the arrow and to rewrite `data-placement` (arrow side and transform origin) when the browser chosen fallback shifts the panel

Targets that live inside an open popover, and older browsers, automatically fall
back to the built-in JS engine. Panels whose native layout degenerates (for
example targets in a sticky or transformed ancestor) also switch back to the JS
engine at runtime. No configuration and no new options are required; the public
API is unchanged.

---

## Theming

### Auto (default)

```svelte
<button use:tooltip={{ content: 'Follows page theme', theme: 'auto' }}>
  Auto
</button>
```

Detection order:

1. `data-theme` / `data-color-scheme` / `data-bs-theme` on `<html>` or `<body>`
2. `.dark` / `.theme-dark` class
3. CSS `color-scheme`
4. `prefers-color-scheme` media query

### Force light or dark

```svelte
<button use:tooltip={{ content: 'Light panel', theme: 'light' }}>Light</button>
<button use:tooltip={{ content: 'Dark panel', theme: 'dark' }}>Dark</button>
```

### Custom theme

```svelte
<script>
  import { tooltip } from 'svelte-tooltip-gca';
  import type { TooltipTheme } from 'svelte-tooltip-gca';

  const brand: TooltipTheme = {
    background: '#ff3e00',
    color: '#1b1f24',
    borderRadius: '10px',
    shadow: '0 12px 28px -8px rgba(255, 62, 0, 0.35)',
    padding: '8px 12px'
  };
</script>

<button use:tooltip={{ content: 'Brand tip', theme: brand }}>
  Custom
</button>
```

Theme fields: `background`, `color`, `border`, `shadow`, `borderRadius`, `fontSize`, `fontFamily`, `fontWeight`, `padding`, `maxWidth`, `arrowSize`, `zIndex`.

---

## Mobile

- **`touchBehavior: 'tap'`** (default), first tap shows, second or outside tap hides
- **`touchBehavior: 'longpress'`**, press and hold to show (cancelled if the finger moves — e.g. to scroll)
- Auto-hides after `touchHideDelay` (default 3s)

## Accessibility

- Tooltips render with `role="tooltip"` and are wired up via `aria-describedby`
- Focusable elements open the tooltip on keyboard focus
- Pressing `Escape` dismisses an open tooltip
- Animations are disabled when the user prefers reduced motion
  (`prefers-reduced-motion: reduce`)

---

## Demo

Hosted demo: [Github Pages](https://gabryca.github.io/svelte-tooltip-gca/)

or:

Run the docs demo locally:

```sh
npm install
npm run dev
```

---

## Development and publish

```sh
npm run check     # type-check
npm run build     # build demo + package dist/
npm pack          # create tarball from dist/
npm publish       # publish to npm
```

Library source lives in `src/lib`. The showcase app lives in `src/routes`.

---

## Release Notes

### [1.1.0] - 2026-10-18

#### Added

- Native CSS anchor positioning as a progressive enhancement. On Baseline 2026 browsers (Chrome/Edge 125+, Firefox 145+, Safari 27+) the target and panel are tied together with inline `anchor-name` / `position-anchor`, the browser performs the placement through per-placement `position-area` rules and implements `overflowBehavior` with `position-try-fallbacks`, and scroll repositioning is fully native with zero JavaScript.
- The action measures the post-layout result each frame to keep the arrow aimed at the target and to correct `data-placement` (arrow side and transform origin) whenever the browser picks a fallback. Targets inside an open popover, and unsupported browsers, automatically keep using the built-in JS engine. The public API is unchanged.

#### Changed

- Upgraded the showcase to SvelteKit 3: the config moved from `svelte.config.js` (removed) into the `sveltekit({...})` plugin options of `vite.config.ts`, `$lib` subpath imports moved to `#lib` through the package `imports` field, and `tsconfig.json` now extends `$app/tsconfig`.
- Upgraded dev dependencies (`@sveltejs/kit` 3.1.0, `@sveltejs/adapter-static` 4.0.0, `@sveltejs/adapter-auto` 8.0.0, `@sveltejs/package` 3.0.1, `@sveltejs/vite-plugin-svelte` 7.3.1, `svelte` 5.57.2, `vite` 8.3.4, `svelte-check` 4.7.7, `publint` 0.3.25). TypeScript stays on 6.0.3 (latest 6.x) since `svelte-check` and `svelte-package` don't support TypeScript 7 yet.
- Docs, AI docs (`llms.txt` / `llms-full.txt`) and structured data (FAQ, `featureList`) now cover the native anchor positioning behavior.

### [1.0.5] - 2026-09-17

#### Fixed

- Fixed pen hover, hybrid-laptop sticky clicks, keyboard-click handling, post-touch focus, container `focusin`/`focusout`, long-press context menu, resize/scroll repositioning, timer leaks, reduced-motion removal delay, `window.matchMedia` guards, custom-theme `undefined` handling, tiny-tooltip arrow clamping, non-finite offsets, and mobile `visualViewport` measurement.

#### Changed

- `exports` now include `import` / `default` for Bun and Node resolvers; `sideEffects: false` for better tree-shaking.
- Upgraded dev dependencies (`@sveltejs/kit` 2.70.3, `@sveltejs/vite-plugin-svelte` 7.3.0, `publint` 0.3.24, `svelte` 5.57.0, `svelte-check` 4.7.6, `vite` 8.3.0). TypeScript stays on 6.0.3 (latest 6.x) since `svelte-check` doesn't support TypeScript 7 yet.
- AI-docs generator runs identically on Node.js and Bun (no TypeScript loader required).
- Docs now link the GitHub repository and the author website.

### [1.0.4] - 2026-08-17

#### Changed

- Refreshed the docs with a responsive two-column hero, clearer navigation, accessible skip and focus states, and more focused playground, API, and example layouts.
- Improved tooltip viewport handling so fallback positions remain visible when neither the preferred nor opposite side has enough room.
- Constrained tooltip panels to the viewport and made long content scroll within the panel instead of escaping the screen.

#### Fixed

- Prevented edge-case positioning from producing negative coordinates on very small viewports.

See the complete history in [CHANGELOG.md](CHANGELOG.md).

---

## Links

- GitHub repository: [github.com/GABRYCA/svelte-tooltip-gca](https://github.com/GABRYCA/svelte-tooltip-gca)
- Author: [AnonymousGCA](https://anonymousgca.eu)
- Demo and Docs: [GitHub Pages](https://gabryca.github.io/svelte-tooltip-gca/)
- NPM package: [npmjs.com/package/svelte-tooltip-gca](https://www.npmjs.com/package/svelte-tooltip-gca)

---

## License

MIT
