# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.5] - 2026-09-17

### Fixed

- Fixed pen hover being ignored (only true touch skips hover now).
- Fixed sticky tooltips on hybrid touchscreen laptops (click toggles only for real touch or pure touch devices).
- Fixed keyboard-activated clicks (`detail === 0`) wrongly toggling or dismissing focused tooltips.
- Fixed touch breaking keyboard focus permanently (focus works again after the post-touch window).
- Fixed container triggers missing child focus (now uses `focusin` / `focusout` with `relatedTarget` checks).
- Fixed long-press firing the OS context menu and a trailing click toggle.
- Fixed tooltip content growth (wrapping, images, theme changes) leaving stale positions (tooltip is now resize-observed).
- Fixed inner content scroll triggering useless repositions.
- Fixed untracked hide-removal timer leaking on rapid show/hide/destroy.
- Fixed `prefers-reduced-motion` still delaying tooltip removal.
- Fixed `window.matchMedia` crashes when `document` exists without `window` (Bun / Node / test shims).
- Fixed custom themes with explicit `undefined` values overwriting the base theme; numeric `maxWidth` now normalizes to `px`.
- Fixed tiny tooltips (< 24px) pushing the arrow outside the panel.
- Fixed non-finite `offset` values producing `NaNpx` positions.
- Fixed viewport measurement on mobile with keyboard / pinch-zoom (uses `visualViewport` with layout fallbacks).

### Changed

- Clarified `TooltipOverflowBehavior`: kept `'flip'` for backwards compatibility, documented `'shift'` as preferred.
- Clarified that `lightTheme` is a dark panel for light pages (and vice versa) for contrast.
- `package.json` exports now include `import` / `default` alongside `svelte` / `types` for Bun and Node resolvers; `sideEffects` set to `false` for better tree-shaking.
- Upgraded dev dependencies: `@sveltejs/kit` 2.70.1 → 2.70.3, `@sveltejs/vite-plugin-svelte` 7.2.0 → 7.3.0, `publint` 0.3.22 → 0.3.24, `svelte` 5.56.8 → 5.57.0, `svelte-check` 4.7.4 → 4.7.6, `vite` 8.1.5 → 8.3.0. TypeScript stays on the 6.x line (6.0.3, latest) because `svelte-check` does not yet support TypeScript 7 without experimental flags.
- `scripts/generate-ai-docs.mjs` no longer imports TypeScript directly; it parses `seo.ts` as text so it runs identically on Node.js and Bun.
- Removed redundant duplicate tooltip styles and the stale `flip` comment without changing public APIs.
- Docs footer and README now link the GitHub repository and the author website; no gradients used.

## [1.0.4] - 2026-08-17

### Changed

- Refreshed the docs with a responsive two-column hero, clearer navigation, accessible skip and focus states, and more focused playground, API, and example layouts.
- Improved tooltip viewport handling so fallback positions remain visible when neither the preferred nor opposite side has enough room.
- Constrained tooltip panels to the viewport and made long content scroll within the panel instead of escaping the screen.

### Fixed

- Prevented edge-case positioning from producing negative coordinates on very small viewports.

[1.0.5]: https://github.com/GABRYCA/svelte-tooltip-gca/releases/tag/v1.0.5
[1.0.4]: https://github.com/GABRYCA/svelte-tooltip-gca/releases/tag/v1.0.4
