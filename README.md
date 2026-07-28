# svelte-tooltip-gca

Modern, theme-aware tooltips for **Svelte 5** as a simple action:

```svelte
<button use:tooltip={'Hello world'}>Hover me</button>
```

- **Svelte 5** action (`use:tooltip`)
- **Auto light and dark** theme detection
- **Custom themes** via a plain object
- **Desktop and mobile friendly** (hover, focus, tap, long-press)
- **Never clipped**, portals to `document.body` with proper z-index
- Smooth **enter and leave animation**
- Auto **placement flip** near viewport edges

---

## Install

```sh
npm install svelte-tooltip-gca
```

Peer dependency: `svelte` ^5.0.0

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
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Preferred side; auto-flips |
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
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    borderRadius: '10px',
    shadow: '0 12px 28px -8px rgba(99, 102, 241, 0.55)',
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
- **`touchBehavior: 'longpress'`**, press and hold to show
- Auto-hides after `touchHideDelay` (default 3s)

---

## Demo

This repository is a SvelteKit library project. Run the docs demo locally:

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

## License

MIT
