import type { Action } from 'svelte/action';
import { applyThemeVars, resolveTheme } from './themes.js';
import {
	aimArrow,
	anchorPositioningSupported,
	computePosition,
	derivePlacement
} from './position.js';
import { ensureStyles } from './styles.js';
import type {
	ResolvedTooltipOptions,
	TooltipOptions,
	TooltipParams
} from './types.js';

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

const DEFAULTS: Omit<ResolvedTooltipOptions, 'content' | 'onShow' | 'onHide'> = {
	html: false,
	placement: 'top',
	theme: 'auto',
	offset: 8,
	delay: 120,
	hideDelay: 80,
	arrow: true,
	animation: true,
	animationDuration: 160,
	disabled: false,
	class: '',
	maxWidth: undefined,
	touchBehavior: 'tap',
	longPressDuration: 400,
	touchHideDelay: 3000,
	showOnFocus: true,
	overflowBehavior: 'shift'
};

function resolveParams(params: TooltipParams | undefined | null): ResolvedTooltipOptions {
	if (params == null || params === '') return { ...DEFAULTS, content: '' };
	if (typeof params === 'string') return { ...DEFAULTS, content: params };
	return { ...DEFAULTS, ...params, content: params.content ?? '' };
}

function isTouchPointer(type: string): boolean {
	return type === 'touch';
}

function isTouchLikePointer(type: string): boolean {
	return type === 'touch' || type === 'pen';
}

/** Lazy Popover API detection (SSR / Bun safe, no module-eval caching). */
function supportsPopover(): boolean {
	return (
		typeof HTMLElement !== 'undefined' &&
		typeof (HTMLElement.prototype as unknown as Record<string, unknown>).showPopover ===
			'function'
	);
}

let tooltipIdCounter = 0;

function nextTooltipId(): string {
	tooltipIdCounter += 1;
	try {
		const uuid =
			typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
				? crypto.randomUUID().slice(0, 8)
				: null;
		if (uuid) return `svelte-tooltip-gca-${Date.now().toString(36)}-${uuid}`;
	} catch {
		// ignore — fall back to counter
	}
	return `svelte-tooltip-gca-${Date.now().toString(36)}-${tooltipIdCounter.toString(36)}${Math.random()
		.toString(36)
		.slice(2, 6)}`;
}

function prefersReducedMotion(): boolean {
	return (
		typeof window !== 'undefined' &&
		typeof window.matchMedia === 'function' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);
}

function isPureTouchDevice(): boolean {
	if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
	try {
		return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
	} catch {
		return false;
	}
}

/**
 * Extra edge distance tolerated between the panel and its target before the
 * panel counts as dislocated (which hands the instance over to the JS engine).
 */
const ANCHOR_GAP_SLACK = 24;

/* ------------------------------------------------------------------ */
/*  Action                                                             */
/* ------------------------------------------------------------------ */

export const tooltip: Action<HTMLElement, TooltipParams | undefined> = (node, params) => {
	// SSR / non-DOM runtimes (Bun tests, prerender): no-op action, still reactive-safe.
	if (typeof document === 'undefined' || typeof window === 'undefined') {
		return {
			update() {
				// noop on the server — actions only hydrate in the browser
			},
			destroy() {
				// noop
			}
		};
	}

	let options = $state(resolveParams(params));
	let destroyed = false;

	/* ---- imperative internals ---------------------------------------- */
	let tooltipEl: HTMLElement | null = null;
	let arrowEl: HTMLElement | null = null;
	let visible = false;
	let showTimer: ReturnType<typeof setTimeout> | null = null;
	let hideTimer: ReturnType<typeof setTimeout> | null = null;
	let touchHideTimer: ReturnType<typeof setTimeout> | null = null;
	let longPressTimer: ReturnType<typeof setTimeout> | null = null;
	let removeTimer: ReturnType<typeof setTimeout> | null = null;
	let isTouch = false;
	let touchOpened = false;
	let ignoreMouseUntil = 0;
	let tapHandledByPointer = false;
	let resizeObserver: ResizeObserver | null = null;
	let mediaQuery: MediaQueryList | null = null;
	let mutationObserver: MutationObserver | null = null;
	let rafId: number | null = null;
	let longPressActive = false;
	let longPressStartX = 0;
	let longPressStartY = 0;

	/**
	 * Native CSS anchor positioning mode: when the browser supports the
	 * anchor-positioning module alongside the Popover API, the panel is glued
	 * to the target by the browser itself (`position-anchor` + `position-area`
	 * + `position-try-fallbacks`) and the JS position engine only computes the
	 * arrow offset. Scroll repositioning then costs zero JavaScript.
	 */
	const anchorMode = supportsPopover() && anchorPositioningSupported();
	/** Per-instance: anchor mode with an in-flow target (anchors cannot reach
	 * into an open popover from below the top layer). */
	let anchorActive = false;
	let anchorSyncRaf: number | null = null;

	$effect(() => {
		const opts = options;

		if (destroyed) return;

		if (opts.disabled || !opts.content) {
			clearTimers();
			if (visible) hide(true);
			return;
		}

		if (visible && tooltipEl) {
			applyContentAndTheme();
			if (anchorActive) {
				// The position-area stylesheet rules key off data-placement; the
				// follow-up sync measurement corrects it to the side CSS chose.
				tooltipEl.setAttribute('data-placement', opts.placement);
				scheduleAnchorSync();
			} else {
				positionTooltip();
			}
		}
	});

	/* ---- timers ------------------------------------------------------ */

	function clearTimers() {
		if (showTimer) { clearTimeout(showTimer); showTimer = null; }
		if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
		if (touchHideTimer) { clearTimeout(touchHideTimer); touchHideTimer = null; }
		if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
		if (removeTimer) { clearTimeout(removeTimer); removeTimer = null; }
	}

	/* ---- DOM creation / destruction ---------------------------------- */

	function createTooltip() {
		if (tooltipEl || typeof document === 'undefined') return;

		ensureStyles();

		tooltipEl = document.createElement('div');
		tooltipEl.className = 'svelte-tooltip-gca';
		tooltipEl.setAttribute('role', 'tooltip');
		tooltipEl.setAttribute('data-show', 'false');
		tooltipEl.setAttribute('aria-hidden', 'true');
		tooltipEl.id = nextTooltipId();

		// Initial side hint (corrected by measurement afterwards).
		tooltipEl.setAttribute('data-placement', options.placement);
		tooltipEl.setAttribute('data-overflow', options.overflowBehavior);

		// Popover API → renders in the top-layer (above all stacking contexts)
		if (supportsPopover()) {
			tooltipEl.setAttribute('popover', 'manual');
		}

		if (options.arrow) {
			arrowEl = document.createElement('div');
			arrowEl.className = 'svelte-tooltip-gca__arrow';
			arrowEl.setAttribute('aria-hidden', 'true');
			tooltipEl.appendChild(arrowEl);
		}

		const contentEl = document.createElement('div');
		contentEl.className = 'svelte-tooltip-gca__content';
		tooltipEl.appendChild(contentEl);

		document.body.appendChild(tooltipEl);

		if (anchorMode && !node.closest(':popover-open')) {
			// Tie panel and target together natively. An element already running
			// inside an open popover cannot serve as a DOM anchor for an element
			// below it in the top layer — those targets keep the JS engine.
			anchorActive = true;
			tooltipEl.setAttribute('data-anchor', 'true');
			tooltipEl.style.setProperty('position-anchor', `--${tooltipEl.id}`);
			node.style.setProperty('anchor-name', `--${tooltipEl.id}`);
		}

		if (resizeObserver && tooltipEl) {
			try { resizeObserver.observe(tooltipEl); } catch { /* noop */ }
		}

		// a11y link
		const describedBy = node.getAttribute('aria-describedby');
		if (describedBy) {
			if (!describedBy.split(/\s+/).includes(tooltipEl.id)) {
				node.setAttribute('aria-describedby', `${describedBy} ${tooltipEl.id}`);
			}
		} else {
			node.setAttribute('aria-describedby', tooltipEl.id);
		}

		applyContentAndTheme();
	}

	function destroyTooltipEl() {
		if (!tooltipEl) return;

		try { resizeObserver?.unobserve(tooltipEl); } catch { /* noop */ }

		const id = tooltipEl.id;

		// Detach the native anchor tie-up when it was set.
		if (node.style.getPropertyValue('anchor-name') === `--${id}`) {
			node.style.removeProperty('anchor-name');
		}

		const describedBy = node.getAttribute('aria-describedby');
		if (describedBy) {
			const next = describedBy.split(/\s+/).filter((x) => x && x !== id).join(' ');
			if (next) node.setAttribute('aria-describedby', next);
			else node.removeAttribute('aria-describedby');
		}

		// Close the popover before removing from DOM
		if (supportsPopover() && tooltipEl.matches(':popover-open')) {
			try { tooltipEl.hidePopover(); } catch { /* noop */ }
		}

		tooltipEl.remove();
		tooltipEl = null;
		arrowEl = null;
	}

	/* ---- popover show / hide helpers --------------------------------- */

	function openPopover() {
		if (!tooltipEl || !supportsPopover()) return;
		if (!tooltipEl.matches(':popover-open')) {
			try { tooltipEl.showPopover(); } catch { /* already open */ }
		}
	}

	function closePopover() {
		if (!tooltipEl || !supportsPopover()) return;
		if (tooltipEl.matches(':popover-open')) {
			try { tooltipEl.hidePopover(); } catch { /* already closed */ }
		}
	}

	/* ---- content / theme --------------------------------------------- */

	function applyContentAndTheme() {
		if (!tooltipEl) return;

		const contentEl =
			tooltipEl.querySelector<HTMLElement>('.svelte-tooltip-gca__content') ?? tooltipEl;

		if (options.html) {
			contentEl.innerHTML = options.content;
		} else {
			contentEl.textContent = options.content;
		}

		const theme = resolveTheme(options.theme);
		if (options.maxWidth !== undefined) {
			theme.maxWidth =
				typeof options.maxWidth === 'number' ? `${options.maxWidth}px` : options.maxWidth;
		}
		applyThemeVars(tooltipEl, theme);

		if (anchorActive) {
			// The gap from the target is expressed as a margin next to the anchor
			// edge (position-area positioning), not as an inset offset.
			const offset = Number.isFinite(options.offset) ? options.offset : 8;
			tooltipEl.style.setProperty('--stt-offset', `${offset}px`);
			tooltipEl.setAttribute('data-overflow', options.overflowBehavior);
		}

		tooltipEl.style.setProperty('--stt-duration', `${options.animationDuration}ms`);
		tooltipEl.setAttribute('data-animation', options.animation ? 'true' : 'false');

		tooltipEl.className = 'svelte-tooltip-gca';
		if (options.class) {
			for (const cls of options.class.split(/\s+/).filter(Boolean)) {
				tooltipEl.classList.add(cls);
			}
		}

		// Arrow presence
		if (options.arrow && !arrowEl) {
			arrowEl = document.createElement('div');
			arrowEl.className = 'svelte-tooltip-gca__arrow';
			arrowEl.setAttribute('aria-hidden', 'true');
			tooltipEl.insertBefore(arrowEl, tooltipEl.firstChild);
		} else if (!options.arrow && arrowEl) {
			arrowEl.remove();
			arrowEl = null;
		}
	}

	/* ---- positioning ------------------------------------------------- */

	/**
	 * CSS anchor-positioning mode: the browser owns the panel position
	 * (`position-area` + `position-try-fallbacks`). JS only measures the
	 * post-layout result once per frame to keep `data-placement` (arrow side +
	 * transform-origin) and the arrow offset pointing at the target.
	 */
	function syncAnchorPosition() {
		anchorSyncRaf = null;
		if (!anchorActive || !visible || !tooltipEl) return;

		const targetRect = node.getBoundingClientRect();
		const tipRect = tooltipEl.getBoundingClientRect();
		if (!tipRect.width || !tipRect.height) return;

		const measured = derivePlacement(targetRect, tipRect);
		const offset = Number.isFinite(options.offset) ? (options.offset as number) : 8;

		if (measured === null || measured.gap > offset + ANCHOR_GAP_SLACK) {
			// Overlapping / degenerate / far-flung layout: the browser's anchor
			// positioning produced nothing usable here (e.g. a sticky or transformed
			// ancestor shrinks the position-area region below the panel size) — hand
			// this instance over to the JS engine.
			disableAnchorMode();
			positionTooltip();
			return;
		}

		if (tooltipEl.getAttribute('data-placement') !== measured.placement) {
			tooltipEl.setAttribute('data-placement', measured.placement);
		}
		applyArrowOffset(
			measured.placement,
			aimArrow(targetRect, tipRect, tipRect, measured.placement)
		);
	}

	/** Give up on native anchoring for this instance and restore JS positioning. */
	function disableAnchorMode() {
		if (!anchorActive) return;
		anchorActive = false;
		if (!tooltipEl) return;
		tooltipEl.removeAttribute('data-anchor');
		tooltipEl.style.removeProperty('position-anchor');
		const id = tooltipEl.id;
		if (node.style.getPropertyValue('anchor-name') === `--${id}`) {
			node.style.removeProperty('anchor-name');
		}
	}

	function scheduleAnchorSync() {
		if (anchorSyncRaf !== null) cancelAnimationFrame(anchorSyncRaf);
		anchorSyncRaf = requestAnimationFrame(syncAnchorPosition);
	}

	function positionTooltip() {
		if (!tooltipEl) return;
		if (anchorActive) {
			scheduleAnchorSync();
			return;
		}

		const targetRect = node.getBoundingClientRect();
		const tipWidth = tooltipEl.offsetWidth;
		const tipHeight = tooltipEl.offsetHeight;

		const tipRect = {
			width: tipWidth,
			height: tipHeight,
			top: 0, left: 0,
			bottom: tipHeight, right: tipWidth,
			x: 0, y: 0,
			toJSON: () => ({})
		} as DOMRect;

		const { top, left, placement, arrowOffset } = computePosition(
			targetRect,
			tipRect,
			options.placement,
			options.offset,
			options.overflowBehavior
		);

		const nextTop = `${Math.round(top)}px`;
		const nextLeft = `${Math.round(left)}px`;
		const prevPlacement = tooltipEl.getAttribute('data-placement');

		if (visible && prevPlacement && prevPlacement !== placement) {
			const prev = tooltipEl.style.transition;
			tooltipEl.style.transition = 'none';
			tooltipEl.style.top = nextTop;
			tooltipEl.style.left = nextLeft;
			tooltipEl.setAttribute('data-placement', placement);
			applyArrowOffset(placement, arrowOffset);
			void tooltipEl.offsetWidth;
			tooltipEl.style.transition = prev;
			return;
		}

		tooltipEl.style.top = nextTop;
		tooltipEl.style.left = nextLeft;
		tooltipEl.setAttribute('data-placement', placement);
		applyArrowOffset(placement, arrowOffset);
	}

	function applyArrowOffset(placement: string, arrowOffset: number) {
		if (!tooltipEl) return;
		if (arrowOffset < 0) {
			tooltipEl.style.removeProperty('--stt-arrow-x');
			tooltipEl.style.removeProperty('--stt-arrow-y');
			return;
		}
		const px = `${Math.round(arrowOffset)}px`;
		if (placement === 'top' || placement === 'bottom') {
			tooltipEl.style.setProperty('--stt-arrow-x', px);
			tooltipEl.style.removeProperty('--stt-arrow-y');
		} else {
			tooltipEl.style.setProperty('--stt-arrow-y', px);
			tooltipEl.style.removeProperty('--stt-arrow-x');
		}
	}

	/* ---- show / hide ------------------------------------------------- */

	function show(immediate = false) {
		if (options.disabled || !options.content) return;

		if (visible && tooltipEl) {
			clearTimers();
			applyContentAndTheme();
			positionTooltip();
			return;
		}

		clearTimers();

		const doShow = () => {
			createTooltip();
			if (!tooltipEl) return;

			applyContentAndTheme();

			openPopover();
			positionTooltip();

			void tooltipEl.offsetWidth;

			tooltipEl.setAttribute('data-show', 'true');
			tooltipEl.setAttribute('aria-hidden', 'false');
			visible = true;
			options.onShow?.();

			requestAnimationFrame(() => {
				if (!visible) return;
				if (anchorActive) syncAnchorPosition();
				else positionTooltip();
			});
		};

		if (immediate || options.delay <= 0) doShow();
		else showTimer = setTimeout(doShow, options.delay);
	}

	function hide(immediate = false) {
		clearTimers();

		const doHide = () => {
			if (!tooltipEl) {
				visible = false;
				touchOpened = false;
				return;
			}

			tooltipEl.setAttribute('data-show', 'false');
			tooltipEl.setAttribute('aria-hidden', 'true');
			visible = false;
			touchOpened = false;
			options.onHide?.();

			const remove = () => {
				removeTimer = null;
				if (tooltipEl && tooltipEl.getAttribute('data-show') === 'false') {
					closePopover();
					destroyTooltipEl();
				}
			};

			if (!options.animation || options.animationDuration <= 0 || immediate || prefersReducedMotion()) {
				remove();
			} else {
				removeTimer = setTimeout(remove, options.animationDuration + 20);
			}
		};

		if (immediate || options.hideDelay <= 0) doHide();
		else hideTimer = setTimeout(doHide, options.hideDelay);
	}

	/* ---- touch helpers ----------------------------------------------- */

	function scheduleTouchHide() {
		if (options.touchHideDelay <= 0) return;
		if (touchHideTimer) clearTimeout(touchHideTimer);
		touchHideTimer = setTimeout(() => hide(true), options.touchHideDelay);
	}

	function markTouch() {
		isTouch = true;
		ignoreMouseUntil = Date.now() + 700;
	}

	function toggleTap() {
		if (options.disabled || !options.content) return;
		if (visible && touchOpened) { hide(true); return; }
		show(true);
		touchOpened = true;
		scheduleTouchHide();
	}

	/* ---- event handlers ---------------------------------------------- */

	function onPointerEnter(e: PointerEvent) {
		// Pen hover behaves like a mouse; only true touch skips hover.
		if (isTouchPointer(e.pointerType)) { markTouch(); return; }
		if (Date.now() < ignoreMouseUntil) return;
		if (touchOpened) return;
		isTouch = false;
		show();
	}

	function onPointerLeave(e: PointerEvent) {
		if (isTouchLikePointer(e.pointerType)) {
			cancelLongPress();
			return;
		}
		if (Date.now() < ignoreMouseUntil) return;
		if (touchOpened) return;
		hide();
	}

	function onFocusIn(e: FocusEvent) {
		if (!options.showOnFocus) return;
		// Suppress the synthetic focus that follows a touch, but don't latch
		// forever — keyboard focus must keep working afterwards.
		if (Date.now() < ignoreMouseUntil) return;
		if (touchOpened) return;
		if (e.relatedTarget && node.contains(e.relatedTarget as Node)) return;
		show();
	}

	function onFocusOut(e: FocusEvent) {
		if (!options.showOnFocus) return;
		if (Date.now() < ignoreMouseUntil) return;
		if (touchOpened) return;
		if (e.relatedTarget && node.contains(e.relatedTarget as Node)) return;
		hide();
	}

	function onPointerDown(e: PointerEvent) {
		if (!isTouchPointer(e.pointerType)) return;
		markTouch();
		tapHandledByPointer = false;
		if (options.touchBehavior === 'longpress') {
			longPressActive = true;
			longPressStartX = e.clientX;
			longPressStartY = e.clientY;
			const duration =
				Number.isFinite(options.longPressDuration) && options.longPressDuration >= 0
					? options.longPressDuration
					: 400;
			longPressTimer = setTimeout(() => {
				longPressActive = false;
				tapHandledByPointer = true;
				show(true);
				touchOpened = true;
				scheduleTouchHide();
			}, duration);
		}
	}

	function onPointerMove(e: PointerEvent) {
		if (!isTouchPointer(e.pointerType)) return;
		if (!longPressActive) return;
		const dx = Math.abs(e.clientX - longPressStartX);
		const dy = Math.abs(e.clientY - longPressStartY);
		if (dx + dy > 10) cancelLongPress();
	}

	function cancelLongPress() {
		longPressActive = false;
		if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
	}

	function onPointerUp(e: PointerEvent) {
		if (!isTouchPointer(e.pointerType)) return;
		markTouch();
		cancelLongPress();
		if (options.touchBehavior === 'tap') {
			tapHandledByPointer = true;
			toggleTap();
		}
	}

	function onPointerCancel() {
		cancelLongPress();
	}

	function onClick(e: MouseEvent) {
		if (tapHandledByPointer) { tapHandledByPointer = false; return; }
		// Keyboard-activated clicks (Enter/Space) carry detail === 0;
		// focus handlers own those — don't toggle or dismiss here.
		if (e.detail === 0) return;
		if (Date.now() < ignoreMouseUntil) return;

		if (options.touchBehavior === 'tap' && (isTouch || isPureTouchDevice())) {
			toggleTap();
			return;
		}
		if (visible) hide(true);
	}

	function onContextMenu(e: Event) {
		// A long-press otherwise summons the OS context menu / text selection
		// alongside the tooltip on mobile.
		if (longPressActive || (touchOpened && visible)) e.preventDefault();
	}

	function onDocumentPointerDown(e: Event) {
		if (!visible || !touchOpened) return;
		const target = e.target as Node | null;
		if (target && (node.contains(target) || tooltipEl?.contains(target))) return;
		hide(true);
	}

	function onScrollOrResize(e: Event) {
		if (!visible) return;
		// Inner content scroll (overflow-y: auto) must not reposition.
		if (tooltipEl && e.target instanceof Node && tooltipEl.contains(e.target)) return;
		if (anchorActive) {
			// Scroll keeps the panel glued to the anchor natively; only viewport
			// resizes can change the layout enough to warrant re-measuring.
			if (e.type !== 'resize') return;
			scheduleAnchorSync();
			return;
		}
		if (rafId !== null) return;
		rafId = requestAnimationFrame(() => {
			rafId = null;
			if (visible) positionTooltip();
		});
	}

	function onKeyDown(e: KeyboardEvent) {
		if (e.key !== 'Escape') return;
		if (visible) hide(true);
	}

	let themeRaf: number | null = null;

	function onThemeChange() {
		if (themeRaf !== null) return;
		themeRaf = requestAnimationFrame(() => {
			themeRaf = null;
			if (visible && tooltipEl) {
				applyContentAndTheme();
				positionTooltip();
			}
		});
	}

	/* ---- attach listeners -------------------------------------------- */

	node.addEventListener('pointerenter', onPointerEnter);
	node.addEventListener('pointerleave', onPointerLeave);
	node.addEventListener('pointerdown', onPointerDown);
	node.addEventListener('pointermove', onPointerMove);
	node.addEventListener('pointerup', onPointerUp);
	node.addEventListener('pointercancel', onPointerCancel);
	node.addEventListener('focusin', onFocusIn);
	node.addEventListener('focusout', onFocusOut);
	node.addEventListener('click', onClick);
	node.addEventListener('contextmenu', onContextMenu);

	document.addEventListener('pointerdown', onDocumentPointerDown, true);
	window.addEventListener('scroll', onScrollOrResize, true);
	window.addEventListener('resize', onScrollOrResize);
	window.addEventListener('keydown', onKeyDown);

	if (typeof ResizeObserver !== 'undefined') {
		resizeObserver = new ResizeObserver(() => { if (visible) positionTooltip(); });
		resizeObserver.observe(node);
	}

	if (typeof window !== 'undefined' && window.matchMedia) {
		mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addEventListener?.('change', onThemeChange);
	}

	if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
		mutationObserver = new MutationObserver(onThemeChange);
		mutationObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class', 'data-theme', 'data-color-scheme', 'data-bs-theme', 'style']
		});
		if (document.body) {
			mutationObserver.observe(document.body, {
				attributes: true,
				attributeFilter: ['class', 'data-theme', 'data-color-scheme', 'data-bs-theme', 'style']
			});
		}
	}

	/* ---- action contract --------------------------------------------- */

	return {
		update(newParams: TooltipParams | undefined) {
			options = resolveParams(newParams);
		},

		destroy() {
			destroyed = true;
			clearTimers();
			cancelLongPress();
			if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
			if (anchorSyncRaf !== null) { cancelAnimationFrame(anchorSyncRaf); anchorSyncRaf = null; }
			if (themeRaf !== null) { cancelAnimationFrame(themeRaf); themeRaf = null; }
			hide(true);
			destroyTooltipEl();

			node.removeEventListener('pointerenter', onPointerEnter);
			node.removeEventListener('pointerleave', onPointerLeave);
			node.removeEventListener('pointerdown', onPointerDown);
			node.removeEventListener('pointermove', onPointerMove);
			node.removeEventListener('pointerup', onPointerUp);
			node.removeEventListener('pointercancel', onPointerCancel);
			node.removeEventListener('focusin', onFocusIn);
			node.removeEventListener('focusout', onFocusOut);
			node.removeEventListener('click', onClick);
			node.removeEventListener('contextmenu', onContextMenu);

			document.removeEventListener('pointerdown', onDocumentPointerDown, true);
			window.removeEventListener('scroll', onScrollOrResize, true);
			window.removeEventListener('resize', onScrollOrResize);
			window.removeEventListener('keydown', onKeyDown);

			resizeObserver?.disconnect();
			mutationObserver?.disconnect();
			mediaQuery?.removeEventListener?.('change', onThemeChange);
		}
	};
};

export type { TooltipParams, TooltipOptions };