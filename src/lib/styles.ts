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
	max-width: var(--stt-max-width, 260px);
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

/* ---- reduced motion --------------------------------------------------- */
@media (prefers-reduced-motion: reduce) {
	.svelte-tooltip-gca {
		transition: none;
	}
}
`.trim();

	document.head.appendChild(style);
}