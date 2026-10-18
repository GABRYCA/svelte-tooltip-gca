const STYLE_ID = 'svelte-tooltip-gca-styles';

/**
 * Inject the package stylesheet once into `document.head`.
 * Safe to call multiple times; subsequent calls are no-ops.
 */
export function ensureStyles(): void {
	if (typeof document === 'undefined') return;
	if (document.getElementById(STYLE_ID)) return;

	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = `
/* ---- base panel -------------------------------------------------------- */
.svelte-tooltip-gca {
	/* Override UA [popover] defaults */
	inset: auto;
	margin: 0;
	overflow: visible;
	color: var(--stt-color, #f9fafb);
	background: var(--stt-bg, #1f2937);
	border: 1px solid var(--stt-border, transparent);
	padding: var(--stt-padding, 6px 10px);

	/* Layout */
	position: fixed;
	z-index: var(--stt-z-index, 9999);
	max-width: min(var(--stt-max-width, 260px), max(0px, calc(100vw - 16px)));
	max-height: max(0px, calc(100vh - 16px));
	border-radius: var(--stt-radius, 8px);
	box-shadow: var(--stt-shadow, 0 10px 25px -5px rgba(0, 0, 0, 0.25));
	font-size: var(--stt-font-size, 13px);
	font-family: var(--stt-font-family, ui-sans-serif, system-ui, sans-serif);
	font-weight: var(--stt-font-weight, 500);
	line-height: 1.4;
	letter-spacing: 0.01em;
	text-align: left;
	pointer-events: none;
	box-sizing: border-box;
	word-wrap: break-word;
	overflow-wrap: break-word;
	white-space: normal;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;

	/* Animation – hidden state */
	opacity: 0;
	transform: scale(0.96);
	transition:
		opacity var(--stt-duration, 160ms) cubic-bezier(0.16, 1, 0.3, 1),
		transform var(--stt-duration, 160ms) cubic-bezier(0.16, 1, 0.3, 1);
	will-change: opacity, transform;
}

.svelte-tooltip-gca[data-show="true"] {
	opacity: 1;
	transform: scale(1);
}

.svelte-tooltip-gca[data-animation="false"] {
	transition: none;
}

.svelte-tooltip-gca__content {
	max-height: max(0px, calc(100vh - 32px));
	overflow-y: auto;
}

/* ---- transform-origin per placement ------------------------------------ */
.svelte-tooltip-gca[data-placement="top"]    { transform-origin: bottom center; }
.svelte-tooltip-gca[data-placement="bottom"] { transform-origin: top center; }
.svelte-tooltip-gca[data-placement="left"]   { transform-origin: right center; }
.svelte-tooltip-gca[data-placement="right"]  { transform-origin: left center; }

/* ---- directional nudge (hidden → shown) -------------------------------- */
.svelte-tooltip-gca:not([data-show="true"])[data-placement="top"]    { transform: scale(0.96) translateY(4px); }
.svelte-tooltip-gca:not([data-show="true"])[data-placement="bottom"] { transform: scale(0.96) translateY(-4px); }
.svelte-tooltip-gca:not([data-show="true"])[data-placement="left"]   { transform: scale(0.96) translateX(4px); }
.svelte-tooltip-gca:not([data-show="true"])[data-placement="right"]  { transform: scale(0.96) translateX(-4px); }

.svelte-tooltip-gca[data-show="true"][data-placement="top"],
.svelte-tooltip-gca[data-show="true"][data-placement="bottom"] { transform: scale(1) translateY(0); }
.svelte-tooltip-gca[data-show="true"][data-placement="left"],
.svelte-tooltip-gca[data-show="true"][data-placement="right"]  { transform: scale(1) translateX(0); }

/* ---- arrow ------------------------------------------------------------- */
.svelte-tooltip-gca__arrow {
	position: absolute;
	width: var(--stt-arrow-size, 6px);
	height: var(--stt-arrow-size, 6px);
	background: var(--stt-bg, #1f2937);
	border: 1px solid var(--stt-border, transparent);
	transform: rotate(45deg);
	pointer-events: none;
	box-sizing: border-box;
}

/*
 * Arrow position is driven by --stt-arrow-x / --stt-arrow-y (set from JS).
 * Falls back to 50 % when the variable is absent (flip mode / centred).
 */
.svelte-tooltip-gca[data-placement="top"] .svelte-tooltip-gca__arrow {
	bottom: calc(var(--stt-arrow-size, 6px) / -2);
	left: var(--stt-arrow-x, 50%);
	margin-left: calc(var(--stt-arrow-size, 6px) / -2);
	border-top: none;
	border-left: none;
}

.svelte-tooltip-gca[data-placement="bottom"] .svelte-tooltip-gca__arrow {
	top: calc(var(--stt-arrow-size, 6px) / -2);
	left: var(--stt-arrow-x, 50%);
	margin-left: calc(var(--stt-arrow-size, 6px) / -2);
	border-bottom: none;
	border-right: none;
}

.svelte-tooltip-gca[data-placement="left"] .svelte-tooltip-gca__arrow {
	right: calc(var(--stt-arrow-size, 6px) / -2);
	top: var(--stt-arrow-y, 50%);
	margin-top: calc(var(--stt-arrow-size, 6px) / -2);
	border-bottom: none;
	border-left: none;
}

.svelte-tooltip-gca[data-placement="right"] .svelte-tooltip-gca__arrow {
	left: calc(var(--stt-arrow-size, 6px) / -2);
	top: var(--stt-arrow-y, 50%);
	margin-top: calc(var(--stt-arrow-size, 6px) / -2);
	border-top: none;
	border-right: none;
}

/* ---- native CSS anchor positioning (progressive enhancement) ------------
 * When the browser supports CSS anchor positioning (Baseline 2026: Chrome/Edge
 * 125+, Firefox 145+, Safari 27+) the action adds data-anchor="true" plus an
 * inline position-anchor on the panel and an anchor-name on the target, and
 * the browser keeps the panel glued to the target natively (including during
 * scroll) with no JS repositioning at all. Older engines simply never match
 * these rules and keep the JS engine.
 *
 * position-area selects the side; the offset gap is a margin on the anchor
 * edge (--stt-offset). The try fallbacks mirror the JS engine semantics with
 * plain slot keywords only (span tokens are not accepted as fallback values):
 * "shift" tries the same side shifted to the inline-start / inline-end
 * [top left, top right] corner regions, then the opposite side; if no option
 * avoids overflow the browser applies the last option anyway. "flip" tries
 * the opposite side first, then the perpendicular ones. A post-layout
 * measurement then rewrites data-placement to the side CSS actually picked,
 * and with it the arrow side and transform origin.
 */
.svelte-tooltip-gca[data-anchor="true"][data-overflow="shift"][data-placement="top"] {
	position-area: top;
	margin-bottom: var(--stt-offset, 8px);
	position-try-fallbacks: top left, top right, bottom;
}

.svelte-tooltip-gca[data-anchor="true"][data-overflow="shift"][data-placement="bottom"] {
	position-area: bottom;
	margin-top: var(--stt-offset, 8px);
	position-try-fallbacks: bottom left, bottom right, top;
}

.svelte-tooltip-gca[data-anchor="true"][data-overflow="shift"][data-placement="left"] {
	position-area: left;
	margin-right: var(--stt-offset, 8px);
	position-try-fallbacks: left top, left bottom, right;
}

.svelte-tooltip-gca[data-anchor="true"][data-overflow="shift"][data-placement="right"] {
	position-area: right;
	margin-left: var(--stt-offset, 8px);
	position-try-fallbacks: right top, right bottom, left;
}

/* 'flip' mirrors the legacy engine order: opposite side first, then perpendicular. */
.svelte-tooltip-gca[data-anchor="true"][data-overflow="flip"][data-placement="top"] {
	position-area: top;
	margin-bottom: var(--stt-offset, 8px);
	position-try-fallbacks: bottom, right, left;
}

.svelte-tooltip-gca[data-anchor="true"][data-overflow="flip"][data-placement="bottom"] {
	position-area: bottom;
	margin-top: var(--stt-offset, 8px);
	position-try-fallbacks: top, right, left;
}

.svelte-tooltip-gca[data-anchor="true"][data-overflow="flip"][data-placement="left"] {
	position-area: left;
	margin-right: var(--stt-offset, 8px);
	position-try-fallbacks: right, top, bottom;
}

.svelte-tooltip-gca[data-anchor="true"][data-overflow="flip"][data-placement="right"] {
	position-area: right;
	margin-left: var(--stt-offset, 8px);
	position-try-fallbacks: left, top, bottom;
}

/* ---- reduced motion --------------------------------------------------- */
@media (prefers-reduced-motion: reduce) {
	.svelte-tooltip-gca {
		transition: none;
	}
}
`.trim();

	document.head.appendChild(style);
}
