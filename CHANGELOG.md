# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-10-18

### Added

- Native CSS anchor positioning as a progressive enhancement. On Baseline 2026 browsers (Chrome/Edge 125+, Firefox 145+, Safari 27+) the tooltip target receives an inline `anchor-name` and the panel a matching `position-anchor`, so the browser performs the placement by itself.
- Per-placement `position-area` rules keyed off `data-anchor` / `data-overflow` / `data-placement`; the `offset` gap becomes a margin on the anchor edge (internal `--stt-offset` variable, default `8px`).
- `position-try-fallbacks` lists mirroring the JS engine semantics: `'shift'` tries the same side shifted toward the inline start / inline end corner regions, then the opposite side; `'flip'` tries the opposite side, then the perpendicular sides. If no option avoids overflow the browser applies the last option anyway.
- Post-layout measurement keeps the arrow aimed at the target and rewrites `data-placement` (arrow side and transform origin) when the browser picks a fallback. Viewport resizes and content resizes still re-measure.
- Targets inside an open popover, unsupported browsers, and panels whose native layout degenerates (e.g. a sticky or transformed ancestor shrinks the `position-area` region) automatically keep or switch to the built-in JS positioning engine. The public API is unchanged (no new options).
- New exported helper `anchorPositioningSupported()` in the internal positioning module.

### Changed

- Upgraded the showcase to SvelteKit 3: the config moved from `svelte.config.js` (removed) into the `sveltekit({...})` plugin options of `vite.config.ts`; `$lib` subpath imports moved to `#lib` through the package `imports` field; `tsconfig.json` now extends `$app/tsconfig`.
- Upgraded dev dependencies: `@sveltejs/kit` 2.70.3 → 3.1.0, `@sveltejs/vite-plugin-svelte` 7.3.0 → 7.3.1, `vite` 8.3.0 → 8.3.4, `svelte` 5.57.0 → 5.57.2, `svelte-check` 4.7.6 → 4.7.7, `publint` 0.3.24 → 0.3.25, plus `@sveltejs/package` 2.x → 3.0.1, `@sveltejs/adapter-static` 3.x → 4.0.0 and `@sveltejs/adapter-auto` 7.x → 8.0.0. TypeScript stays on the 6.x line (6.0.3, latest) because `svelte-check` and `svelte-package` do not yet support TypeScript 7 (see sveltejs/language-tools issue #3063).
- Docs, AI docs (`llms.txt` / `llms-full.txt` generator) and structured data (FAQ, JSON-LD `featureList`) cover the native anchor positioning behavior.

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

[1.1.0]: https://github.com/GABRYCA/svelte-tooltip-gca/releases/tag/v1.1.0
[1.0.5]: https://github.com/GABRYCA/svelte-tooltip-gca/releases/tag/v1.0.5
[1.0.4]: https://github.com/GABRYCA/svelte-tooltip-gca/releases/tag/v1.0.4
