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
.svelte-tooltip-gca {
	position: fixed;
	z-index: var(--stt-z-index, 9999);
	max-width: var(--stt-max-width, 260px);
	padding: var(--stt-padding, 6px 10px);
	border-radius: var(--stt-radius, 8px);
	background: var(--stt-bg, #1f2937);
	color: var(--stt-color, #f9fafb);
	border: 1px solid var(--stt-border, transparent);
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
	opacity: 0;
	transform: scale(0.96);
	transition:
		opacity var(--stt-duration, 160ms) cubic-bezier(0.16, 1, 0.3, 1),
		transform var(--stt-duration, 160ms) cubic-bezier(0.16, 1, 0.3, 1);
	will-change: opacity, transform;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

.svelte-tooltip-gca[data-show="true"] {
	opacity: 1;
	transform: scale(1);
}

.svelte-tooltip-gca[data-animation="false"] {
	transition: none;
}

.svelte-tooltip-gca[data-placement="top"] {
	transform-origin: bottom center;
}
.svelte-tooltip-gca[data-placement="bottom"] {
	transform-origin: top center;
}
.svelte-tooltip-gca[data-placement="left"] {
	transform-origin: right center;
}
.svelte-tooltip-gca[data-placement="right"] {
	transform-origin: left center;
}

.svelte-tooltip-gca[data-show="true"][data-placement="top"] {
	transform: scale(1) translateY(0);
}
.svelte-tooltip-gca[data-show="true"][data-placement="bottom"] {
	transform: scale(1) translateY(0);
}
.svelte-tooltip-gca[data-show="true"][data-placement="left"] {
	transform: scale(1) translateX(0);
}
.svelte-tooltip-gca[data-show="true"][data-placement="right"] {
	transform: scale(1) translateX(0);
}

.svelte-tooltip-gca:not([data-show="true"])[data-placement="top"] {
	transform: scale(0.96) translateY(4px);
}
.svelte-tooltip-gca:not([data-show="true"])[data-placement="bottom"] {
	transform: scale(0.96) translateY(-4px);
}
.svelte-tooltip-gca:not([data-show="true"])[data-placement="left"] {
	transform: scale(0.96) translateX(4px);
}
.svelte-tooltip-gca:not([data-show="true"])[data-placement="right"] {
	transform: scale(0.96) translateX(-4px);
}

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

.svelte-tooltip-gca[data-placement="top"] .svelte-tooltip-gca__arrow {
	bottom: calc(var(--stt-arrow-size, 6px) / -2);
	left: 50%;
	margin-left: calc(var(--stt-arrow-size, 6px) / -2);
	border-top: none;
	border-left: none;
}

.svelte-tooltip-gca[data-placement="bottom"] .svelte-tooltip-gca__arrow {
	top: calc(var(--stt-arrow-size, 6px) / -2);
	left: 50%;
	margin-left: calc(var(--stt-arrow-size, 6px) / -2);
	border-bottom: none;
	border-right: none;
}

.svelte-tooltip-gca[data-placement="left"] .svelte-tooltip-gca__arrow {
	right: calc(var(--stt-arrow-size, 6px) / -2);
	top: 50%;
	margin-top: calc(var(--stt-arrow-size, 6px) / -2);
	border-bottom: none;
	border-left: none;
}

.svelte-tooltip-gca[data-placement="right"] .svelte-tooltip-gca__arrow {
	left: calc(var(--stt-arrow-size, 6px) / -2);
	top: 50%;
	margin-top: calc(var(--stt-arrow-size, 6px) / -2);
	border-top: none;
	border-right: none;
}
`.trim();

	document.head.appendChild(style);
}
