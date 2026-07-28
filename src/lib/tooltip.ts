import type { Action } from 'svelte/action';
import { applyThemeVars, resolveTheme } from './themes.js';
import { computePosition } from './position.js';
import { ensureStyles } from './styles.js';
import type {
	ResolvedTooltipOptions,
	TooltipOptions,
	TooltipParams
} from './types.js';

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
	showOnFocus: true
};

function resolveParams(params: TooltipParams | undefined | null): ResolvedTooltipOptions {
	if (params == null || params === '') {
		return { ...DEFAULTS, content: '' };
	}
	if (typeof params === 'string') {
		return { ...DEFAULTS, content: params };
	}
	return {
		...DEFAULTS,
		...params,
		content: params.content ?? ''
	};
}

function isTouchLikePointer(type: string): boolean {
	return type === 'touch' || type === 'pen';
}

/**
 * Svelte action that attaches a modern, theme-aware tooltip to any HTML element.
 *
 * @example
 * ```svelte
 * <script>
 *   import { tooltip } from 'svelte-tooltip-gca';
 * </script>
 *
 * <button use:tooltip={'Hello!'}>Hover me</button>
 *
 * <button use:tooltip={{ content: 'On the right', placement: 'right' }}>
 *   Options
 * </button>
 * ```
 */
export const tooltip: Action<HTMLElement, TooltipParams | undefined> = (node, params) => {
	let options = resolveParams(params);
	let tooltipEl: HTMLElement | null = null;
	let arrowEl: HTMLElement | null = null;
	let visible = false;
	let showTimer: ReturnType<typeof setTimeout> | null = null;
	let hideTimer: ReturnType<typeof setTimeout> | null = null;
	let touchHideTimer: ReturnType<typeof setTimeout> | null = null;
	let longPressTimer: ReturnType<typeof setTimeout> | null = null;
	let isTouch = false;
	let touchOpened = false;
	/** Ignore mouse hover briefly after touch to avoid ghost mouse events. */
	let ignoreMouseUntil = 0;
	/** Ignore outside-dismiss briefly after opening via tap (same-gesture races). */
	let ignoreDismissUntil = 0;
	/** True when the current pointer gesture already handled tap toggle. */
	let tapHandledByPointer = false;
	let resizeObserver: ResizeObserver | null = null;
	let mediaQuery: MediaQueryList | null = null;

	function clearTimers() {
		if (showTimer) {
			clearTimeout(showTimer);
			showTimer = null;
		}
		if (hideTimer) {
			clearTimeout(hideTimer);
			hideTimer = null;
		}
		if (touchHideTimer) {
			clearTimeout(touchHideTimer);
			touchHideTimer = null;
		}
		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
	}

	function createTooltip() {
		if (tooltipEl || typeof document === 'undefined') return;

		ensureStyles();

		tooltipEl = document.createElement('div');
		tooltipEl.className = 'svelte-tooltip-gca';
		tooltipEl.setAttribute('role', 'tooltip');
		tooltipEl.setAttribute('data-show', 'false');
		tooltipEl.id = `svelte-tooltip-gca-${Math.random().toString(36).slice(2, 10)}`;

		if (options.arrow) {
			arrowEl = document.createElement('div');
			arrowEl.className = 'svelte-tooltip-gca__arrow';
			arrowEl.setAttribute('aria-hidden', 'true');
			tooltipEl.appendChild(arrowEl);
		}

		// Content wrapper so the arrow stays a sibling
		const contentEl = document.createElement('div');
		contentEl.className = 'svelte-tooltip-gca__content';
		tooltipEl.appendChild(contentEl);

		document.body.appendChild(tooltipEl);

		// Link for a11y
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

	function applyContentAndTheme() {
		if (!tooltipEl) return;

		const contentEl =
			tooltipEl.querySelector<HTMLElement>('.svelte-tooltip-gca__content') ?? tooltipEl;

		if (options.html) {
			contentEl.innerHTML = options.content;
		} else {
			contentEl.textContent = options.content;
		}

		// Theme
		const theme = resolveTheme(options.theme);
		if (options.maxWidth !== undefined) {
			theme.maxWidth =
				typeof options.maxWidth === 'number' ? `${options.maxWidth}px` : options.maxWidth;
		}
		applyThemeVars(tooltipEl, theme);

		tooltipEl.style.setProperty('--stt-duration', `${options.animationDuration}ms`);
		tooltipEl.setAttribute('data-animation', options.animation ? 'true' : 'false');
		// Placement attribute is owned by positionTooltip so we don't fight it here
		// on every content refresh (avoids transform-origin transition jerks).

		// Extra classes
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

	/**
	 * Position the tooltip without flashing it to (0,0) or toggling visibility.
	 * Only width/height are needed for placement math, so the current top/left
	 * can stay put while we measure — this removes the click/scroll "jerk".
	 */
	function positionTooltip() {
		if (!tooltipEl) return;

		const targetRect = node.getBoundingClientRect();
		const tipWidth = tooltipEl.offsetWidth;
		const tipHeight = tooltipEl.offsetHeight;

		// Synthetic rect — computePosition only reads width/height.
		const tipRect = {
			width: tipWidth,
			height: tipHeight,
			top: 0,
			left: 0,
			bottom: tipHeight,
			right: tipWidth,
			x: 0,
			y: 0,
			toJSON: () => ({})
		} as DOMRect;

		const { top, left, placement } = computePosition(
			targetRect,
			tipRect,
			options.placement,
			options.offset
		);

		const nextTop = `${Math.round(top)}px`;
		const nextLeft = `${Math.round(left)}px`;
		const prevPlacement = tooltipEl.getAttribute('data-placement');

		// If placement flips while visible, disable transform transition for one
		// frame so transform-origin / translate changes don't animate as a jerk.
		if (visible && prevPlacement && prevPlacement !== placement) {
			const prevTransition = tooltipEl.style.transition;
			tooltipEl.style.transition = 'none';
			tooltipEl.style.top = nextTop;
			tooltipEl.style.left = nextLeft;
			tooltipEl.setAttribute('data-placement', placement);
			// Force reflow, then restore transition for opacity hide animations
			void tooltipEl.offsetWidth;
			tooltipEl.style.transition = prevTransition;
			return;
		}

		tooltipEl.style.top = nextTop;
		tooltipEl.style.left = nextLeft;
		tooltipEl.setAttribute('data-placement', placement);
	}

	function show(immediate = false) {
		if (options.disabled || !options.content) return;

		// Already visible: refresh content/position only — do not re-run the
		// enter animation or thrash timers (focus-after-hover used to jerk).
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

			// Force reflow so the enter transition runs from the hidden state
			void tooltipEl.offsetWidth;

			tooltipEl.setAttribute('data-show', 'true');
			visible = true;
			options.onShow?.();

			// Reposition after paint in case content reflowed (no visibility thrash)
			requestAnimationFrame(() => {
				if (visible) positionTooltip();
			});
		};

		if (immediate || options.delay <= 0) {
			doShow();
		} else {
			showTimer = setTimeout(doShow, options.delay);
		}
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
					destroyTooltipEl();
				}
			};

			if (!options.animation || options.animationDuration <= 0 || immediate) {
				remove();
			} else {
				setTimeout(remove, options.animationDuration + 20);
			}
		};

		if (immediate || options.hideDelay <= 0) {
			doHide();
		} else {
			hideTimer = setTimeout(doHide, options.hideDelay);
		}
	}

	function destroyTooltipEl() {
		if (!tooltipEl) return;

		const id = tooltipEl.id;
		const describedBy = node.getAttribute('aria-describedby');
		if (describedBy) {
			const next = describedBy
				.split(/\s+/)
				.filter((x) => x && x !== id)
				.join(' ');
			if (next) node.setAttribute('aria-describedby', next);
			else node.removeAttribute('aria-describedby');
		}

		tooltipEl.remove();
		tooltipEl = null;
		arrowEl = null;
	}

	function scheduleTouchHide() {
		if (options.touchHideDelay <= 0) return;
		if (touchHideTimer) clearTimeout(touchHideTimer);
		touchHideTimer = setTimeout(() => hide(true), options.touchHideDelay);
	}

	function markTouch() {
		isTouch = true;
		ignoreMouseUntil = Date.now() + 700;
	}

	/** Toggle sticky tooltip for tap / coarse-pointer interactions. */
	function toggleTap() {
		if (options.disabled || !options.content) return;

		if (visible && touchOpened) {
			hide(true);
			return;
		}

		// Opening (or converting a hover-shown tip into a sticky tap tip)
		ignoreDismissUntil = Date.now() + 350;
		show(true);
		touchOpened = true;
		scheduleTouchHide();
	}

	// —— Pointer / mouse ——
	function onPointerEnter(e: PointerEvent) {
		if (isTouchLikePointer(e.pointerType)) {
			markTouch();
			return;
		}
		if (Date.now() < ignoreMouseUntil) return;
		// Sticky tap tip stays until dismissed — don't fight it with hover hide/show
		if (touchOpened) return;
		isTouch = false;
		show();
	}

	function onPointerLeave(e: PointerEvent) {
		if (isTouchLikePointer(e.pointerType)) return;
		if (Date.now() < ignoreMouseUntil) return;
		// Sticky tips opened by tap should not close on mouse leave
		if (touchOpened) return;
		hide();
	}

	// —— Focus (keyboard) ——
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

	// —— Touch / pen via Pointer Events (more reliable than touch* alone) ——
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

		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}

		if (options.touchBehavior === 'tap') {
			// Mark before toggling so the synthetic click (if any) is ignored.
			// Do NOT preventDefault — that would break real button onClick handlers.
			tapHandledByPointer = true;
			toggleTap();
		}
	}

	function onPointerCancel() {
		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
	}

	/**
	 * Click handling:
	 * - After a touch pointer gesture: ignore (already toggled in pointerup).
	 * - Coarse pointers / touch sessions: toggle sticky tip (tap behavior).
	 * - Fine-pointer desktop: dismiss an open tip so click feels responsive
	 *   (hover remains the way to open).
	 */
	function onClick(_e: MouseEvent) {
		// Already handled by pointerup on this gesture — leave the event alone
		// so the host button's own click handlers still run.
		if (tapHandledByPointer) {
			tapHandledByPointer = false;
			return;
		}

		// Ghost click after touch
		if (Date.now() < ignoreMouseUntil) return;

		const coarse =
			typeof window !== 'undefined' &&
			Boolean(window.matchMedia?.('(hover: none), (pointer: coarse)').matches);

		if (options.touchBehavior === 'tap' && (coarse || isTouch)) {
			toggleTap();
			return;
		}

		// Desktop: clicking the trigger dismisses a visible tooltip.
		// Sticky tap tips toggle off; hover tips simply close.
		if (visible) {
			hide(true);
		}
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
			// Theme swap can change padding/font metrics slightly
			positionTooltip();
		}
	}

	// Attach listeners
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
		resizeObserver = new ResizeObserver(() => {
			if (visible) positionTooltip();
		});
		resizeObserver.observe(node);
	}

	if (typeof window !== 'undefined' && window.matchMedia) {
		mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addEventListener?.('change', onThemeChange);
	}

	// Mutation observer for class/data-theme changes on html/body
	let mutationObserver: MutationObserver | null = null;
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

	return {
		update(newParams: TooltipParams | undefined) {
			const wasVisible = visible;
			const prev = options;
			options = resolveParams(newParams);

			if (options.disabled || !options.content) {
				if (wasVisible) hide(true);
				return;
			}

			if (wasVisible && tooltipEl) {
				const contentChanged =
					prev.content !== options.content ||
					prev.html !== options.html ||
					prev.theme !== options.theme ||
					prev.class !== options.class ||
					prev.arrow !== options.arrow ||
					prev.maxWidth !== options.maxWidth ||
					prev.animation !== options.animation ||
					prev.animationDuration !== options.animationDuration;

				const positionChanged =
					prev.placement !== options.placement || prev.offset !== options.offset;

				if (contentChanged) applyContentAndTheme();
				if (contentChanged || positionChanged) positionTooltip();
			}
		},
		destroy() {
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

// Re-export types used by consumers of the action
export type { TooltipParams, TooltipOptions };
