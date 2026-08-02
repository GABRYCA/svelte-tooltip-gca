import type { Action } from 'svelte/action';
import { applyThemeVars, resolveTheme } from './themes.js';
import { computePosition } from './position.js';
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

function isTouchLikePointer(type: string): boolean {
	return type === 'touch' || type === 'pen';
}

/** Feature-detect the Popover API once. */
const supportsPopover =
	typeof HTMLElement !== 'undefined' &&
	typeof HTMLElement.prototype.showPopover === 'function';

/* ------------------------------------------------------------------ */
/*  Action                                                             */
/* ------------------------------------------------------------------ */

export const tooltip: Action<HTMLElement, TooltipParams | undefined> = (node, params) => {
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
	let isTouch = false;
	let touchOpened = false;
	let ignoreMouseUntil = 0;
	let ignoreDismissUntil = 0;
	let tapHandledByPointer = false;
	let resizeObserver: ResizeObserver | null = null;
	let mediaQuery: MediaQueryList | null = null;
	let mutationObserver: MutationObserver | null = null;

	$effect(() => {
		const opts = options;

		if (destroyed) return;

		if (opts.disabled || !opts.content) {
			if (visible) hide(true);
			return;
		}

		if (visible && tooltipEl) {
			applyContentAndTheme();
			positionTooltip();
		}
	});

	/* ---- timers ------------------------------------------------------ */

	function clearTimers() {
		if (showTimer) { clearTimeout(showTimer); showTimer = null; }
		if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
		if (touchHideTimer) { clearTimeout(touchHideTimer); touchHideTimer = null; }
		if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
	}

	/* ---- DOM creation / destruction ---------------------------------- */

	function createTooltip() {
		if (tooltipEl || typeof document === 'undefined') return;

		ensureStyles();

		tooltipEl = document.createElement('div');
		tooltipEl.className = 'svelte-tooltip-gca';
		tooltipEl.setAttribute('role', 'tooltip');
		tooltipEl.setAttribute('data-show', 'false');
		tooltipEl.id = `svelte-tooltip-gca-${Math.random().toString(36).slice(2, 10)}`;

		// Popover API → renders in the top-layer (above all stacking contexts)
		if (supportsPopover) {
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
		positionTooltip();
	}

	function destroyTooltipEl() {
		if (!tooltipEl) return;

		const id = tooltipEl.id;
		const describedBy = node.getAttribute('aria-describedby');
		if (describedBy) {
			const next = describedBy.split(/\s+/).filter((x) => x && x !== id).join(' ');
			if (next) node.setAttribute('aria-describedby', next);
			else node.removeAttribute('aria-describedby');
		}

		// Close the popover before removing from DOM
		if (supportsPopover && tooltipEl.matches(':popover-open')) {
			try { tooltipEl.hidePopover(); } catch { /* noop */ }
		}

		tooltipEl.remove();
		tooltipEl = null;
		arrowEl = null;
	}

	/* ---- popover show / hide helpers --------------------------------- */

	function openPopover() {
		if (!tooltipEl || !supportsPopover) return;
		if (!tooltipEl.matches(':popover-open')) {
			try { tooltipEl.showPopover(); } catch { /* already open */ }
		}
	}

	function closePopover() {
		if (!tooltipEl || !supportsPopover) return;
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

	function positionTooltip() {
		if (!tooltipEl) return;

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
			positionTooltip();

			openPopover();

			void tooltipEl.offsetWidth;

			tooltipEl.setAttribute('data-show', 'true');
			visible = true;
			options.onShow?.();

			requestAnimationFrame(() => {
				if (visible) positionTooltip();
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
			visible = false;
			touchOpened = false;
			options.onHide?.();

			const remove = () => {
				if (tooltipEl && tooltipEl.getAttribute('data-show') === 'false') {
					closePopover();
					destroyTooltipEl();
				}
			};

			if (!options.animation || options.animationDuration <= 0 || immediate) {
				remove();
			} else {
				setTimeout(remove, options.animationDuration + 20);
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
		ignoreDismissUntil = Date.now() + 350;
		show(true);
		touchOpened = true;
		scheduleTouchHide();
	}

	/* ---- event handlers ---------------------------------------------- */

	function onPointerEnter(e: PointerEvent) {
		if (isTouchLikePointer(e.pointerType)) { markTouch(); return; }
		if (Date.now() < ignoreMouseUntil) return;
		if (touchOpened) return;
		isTouch = false;
		show();
	}

	function onPointerLeave(e: PointerEvent) {
		if (isTouchLikePointer(e.pointerType)) return;
		if (Date.now() < ignoreMouseUntil) return;
		if (touchOpened) return;
		hide();
	}

	function onFocus() {
		if (!options.showOnFocus) return;
		if (isTouch || Date.now() < ignoreMouseUntil) return;
		if (touchOpened) return;
		show();
	}

	function onBlur() {
		if (!options.showOnFocus) return;
		if (isTouch || Date.now() < ignoreMouseUntil) return;
		if (touchOpened) return;
		hide();
	}

	function onPointerDown(e: PointerEvent) {
		if (!isTouchLikePointer(e.pointerType)) return;
		markTouch();
		tapHandledByPointer = false;
		if (options.touchBehavior === 'longpress') {
			longPressTimer = setTimeout(() => {
				show(true);
				touchOpened = true;
				ignoreDismissUntil = Date.now() + 350;
				scheduleTouchHide();
			}, options.longPressDuration);
		}
	}

	function onPointerUp(e: PointerEvent) {
		if (!isTouchLikePointer(e.pointerType)) return;
		markTouch();
		if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
		if (options.touchBehavior === 'tap') {
			tapHandledByPointer = true;
			toggleTap();
		}
	}

	function onPointerCancel() {
		if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
	}

	function onClick(_e: MouseEvent) {
		if (tapHandledByPointer) { tapHandledByPointer = false; return; }
		if (Date.now() < ignoreMouseUntil) return;

		const coarse =
			typeof window !== 'undefined' &&
			Boolean(window.matchMedia?.('(hover: none), (pointer: coarse)').matches);

		if (options.touchBehavior === 'tap' && (coarse || isTouch)) { toggleTap(); return; }
		if (visible) hide(true);
	}

	function onDocumentPointerDown(e: Event) {
		if (!visible || !touchOpened) return;
		if (Date.now() < ignoreDismissUntil) return;
		const target = e.target as Node | null;
		if (target && (node.contains(target) || tooltipEl?.contains(target))) return;
		hide(true);
	}

	function onScrollOrResize() {
		if (visible) positionTooltip();
	}

	function onThemeChange() {
		if (visible && tooltipEl) {
			applyContentAndTheme();
			positionTooltip();
		}
	}

	/* ---- attach listeners -------------------------------------------- */

	node.addEventListener('pointerenter', onPointerEnter);
	node.addEventListener('pointerleave', onPointerLeave);
	node.addEventListener('pointerdown', onPointerDown);
	node.addEventListener('pointerup', onPointerUp);
	node.addEventListener('pointercancel', onPointerCancel);
	node.addEventListener('focus', onFocus);
	node.addEventListener('blur', onBlur);
	node.addEventListener('click', onClick);

	document.addEventListener('pointerdown', onDocumentPointerDown, true);
	window.addEventListener('scroll', onScrollOrResize, true);
	window.addEventListener('resize', onScrollOrResize);

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
			hide(true);
			destroyTooltipEl();

			node.removeEventListener('pointerenter', onPointerEnter);
			node.removeEventListener('pointerleave', onPointerLeave);
			node.removeEventListener('pointerdown', onPointerDown);
			node.removeEventListener('pointerup', onPointerUp);
			node.removeEventListener('pointercancel', onPointerCancel);
			node.removeEventListener('focus', onFocus);
			node.removeEventListener('blur', onBlur);
			node.removeEventListener('click', onClick);

			document.removeEventListener('pointerdown', onDocumentPointerDown, true);
			window.removeEventListener('scroll', onScrollOrResize, true);
			window.removeEventListener('resize', onScrollOrResize);

			resizeObserver?.disconnect();
			mutationObserver?.disconnect();
			mediaQuery?.removeEventListener?.('change', onThemeChange);
		}
	};
};

export type { TooltipParams, TooltipOptions };