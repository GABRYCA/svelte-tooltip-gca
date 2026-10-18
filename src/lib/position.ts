import type { TooltipPlacement, TooltipOverflowBehavior } from './types.js';

export interface PositionResult {
	top: number;
	left: number;
	placement: TooltipPlacement;
	/**
	 * Distance in px from the *start edge* of the tooltip to the centre of the
	 * arrow. For top/bottom placements this is measured from the left edge;
	 * for left/right from the top edge. A negative value means "use the CSS
	 * default (50 %)".
	 */
	arrowOffset: number;
}

const VIEWPORT_PADDING = 8;

/** Minimum distance the arrow centre keeps from the tooltip's corner. */
const ARROW_EDGE_PADDING = 12;

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

let cachedAnchorSupport: boolean | null = null;

/**
 * Runtime support check for the CSS anchor positioning module
 * (`anchor-name`, `position-anchor`, `position-area` and
 * `position-try-fallbacks`). Baseline 2026: Chrome/Edge 125+, Firefox 145+
 * and Safari 27+. Evaluated once and cached; safe on SSR / Bun / Node.
 */
export function anchorPositioningSupported(): boolean {
	if (cachedAnchorSupport !== null) return cachedAnchorSupport;
	cachedAnchorSupport = false;
	try {
		if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
			cachedAnchorSupport =
				CSS.supports('position-area', 'top') &&
				CSS.supports('anchor-name', '--stt-probe') &&
				CSS.supports('position-try-fallbacks', 'top, bottom') &&
				CSS.supports('position-try-fallbacks', 'flip-block');
		}
	} catch {
		cachedAnchorSupport = false;
	}
	return cachedAnchorSupport;
}

/**
 * Infer which side the tooltip currently sits on from rendered geometry.
 *
 * Used in CSS anchor-positioning mode, where the browser may apply a
 * `position-try-fallbacks` option (corner region or opposite side) without
 * informing JS. The derived placement drives the arrow side and `transform-origin`
 * so they stay in sync with whatever position CSS picked, and the returned gap
 * lets callers detect a dislocated panel. Returns `null` when the two rects
 * are degenerate (e.g. detached elements or a panel collapsed to zero size) or
 * when all four side gaps are negative (the panel overlaps the anchor).
 */
export function derivePlacement(
	target: DOMRect,
	tooltip: DOMRect
): { placement: TooltipPlacement; gap: number } | null {
	if (!Number.isFinite(target.top) || !Number.isFinite(tooltip.top)) return null;
	if (tooltip.width <= 0 || tooltip.height <= 0) return null;

	/** Signed edge distance for each side: ~0 when the tooltip abuts the
	 * anchor on that side (within margin / epsilon), negative when it overlaps. */
	const EPS = 1;
	const candidates: Array<[TooltipPlacement, number]> = [
		['top', target.top - tooltip.bottom],
		['bottom', tooltip.top - target.bottom],
		['left', target.left - tooltip.right],
		['right', tooltip.left - target.right]
	];

	let best: TooltipPlacement | null = null;
	let bestGap = Infinity;
	for (const [placement, gap] of candidates) {
		// Gaps beyond epsilon on the negative side mean the panel overlaps the anchor.
		if (gap >= -EPS && Math.abs(gap) < bestGap) {
			best = placement;
			bestGap = Math.abs(gap);
		}
	}
	if (best === null) return null;
	return { placement: best, gap: bestGap };
}

export function computePosition(
	target: DOMRect,
	tooltip: DOMRect,
	preferred: TooltipPlacement,
	offset = 8,
	overflowBehavior: TooltipOverflowBehavior = 'shift',
	viewport?: { width: number; height: number }
): PositionResult {
	const safeOffset = Number.isFinite(offset) ? (offset as number) : 8;
	if (overflowBehavior === 'flip') {
		return computeFlip(target, tooltip, preferred, safeOffset, viewport);
	}
	return computeShift(target, tooltip, preferred, safeOffset, viewport);
}

/* ------------------------------------------------------------------ */
/*  "shift" strategy (default)                                         */
/* ------------------------------------------------------------------ */

function computeShift(
	target: DOMRect,
	tooltip: DOMRect,
	preferred: TooltipPlacement,
	offset: number,
	viewport?: { width: number; height: number }
): PositionResult {
	const { vw, vh } = getViewportSize(viewport);

	let placement = preferred;
	if (!fitsPrimaryAxis(place(target, tooltip, preferred, offset), tooltip, preferred, vh, vw)) {
		const opp = opposite(preferred);
		if (fitsPrimaryAxis(place(target, tooltip, opp, offset), tooltip, opp, vh, vw)) {
			placement = opp;
		}
	}

	let pos = place(target, tooltip, placement, offset);
	pos = shiftCrossAxis(pos, tooltip, placement, vw, vh);
	pos = clampToViewport({ ...pos, placement }, tooltip, vw, vh);

	const arrowOffset = aimArrow(target, tooltip, pos, placement);

	return { ...pos, placement, arrowOffset };
}

/* ------------------------------------------------------------------ */
/*  "flip" strategy (legacy)                                           */
/* ------------------------------------------------------------------ */

function computeFlip(
	target: DOMRect,
	tooltip: DOMRect,
	preferred: TooltipPlacement,
	offset: number,
	viewport?: { width: number; height: number }
): PositionResult {
	const { vw, vh } = getViewportSize(viewport);

	const candidates: TooltipPlacement[] = [preferred, ...flipOrder(preferred)];

	for (const placement of candidates) {
		const pos = place(target, tooltip, placement, offset);
		if (fitsAll(pos, tooltip, vw, vh)) {
			const clamped = clampToViewport({ ...pos, placement }, tooltip, vw, vh);
			return { ...clamped, arrowOffset: -1 };
		}
	}

	const fallback = place(target, tooltip, preferred, offset);
	const clamped = clampToViewport({ ...fallback, placement: preferred }, tooltip, vw, vh);
	return { ...clamped, arrowOffset: -1 };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Viewport size with SSR / test fallbacks.
 * Prefers `visualViewport` (accurate on mobile with keyboard / pinch-zoom),
 * falls back to `window.innerWidth/Height`, then `documentElement` client
 * size, then a sane default so imports never crash under Bun / Node.
 */
function getViewportSize(explicit?: { width: number; height: number }): {
	vw: number;
	vh: number;
} {
	if (explicit && Number.isFinite(explicit.width) && Number.isFinite(explicit.height)) {
		return { vw: explicit.width, vh: explicit.height };
	}
	if (typeof window !== 'undefined') {
		const vv =
			typeof window.visualViewport !== 'undefined' ? window.visualViewport : undefined;
		const vw =
			(vv?.width ??
				window.innerWidth ??
				(typeof document !== 'undefined'
					? document.documentElement?.clientWidth
					: undefined)) ||
			1024;
		const vh =
			(vv?.height ??
				window.innerHeight ??
				(typeof document !== 'undefined'
					? document.documentElement?.clientHeight
					: undefined)) ||
			768;
		// Clamp against the layout viewport so scrollbars never push the tip off-screen.
		const layoutW =
			typeof document !== 'undefined'
				? document.documentElement?.clientWidth
				: undefined;
		const layoutH =
			typeof document !== 'undefined'
				? document.documentElement?.clientHeight
				: undefined;
		return {
			vw: layoutW ? Math.min(vw, Math.max(layoutW, 0)) || vw : vw,
			vh: layoutH ? Math.min(vh, Math.max(layoutH, 0)) || vh : vh
		};
	}
	return { vw: 1024, vh: 768 };
}

function place(
	target: DOMRect,
	tooltip: DOMRect,
	placement: TooltipPlacement,
	offset: number
): { top: number; left: number } {
	switch (placement) {
		case 'top':
			return {
				top: target.top - tooltip.height - offset,
				left: target.left + target.width / 2 - tooltip.width / 2
			};
		case 'bottom':
			return {
				top: target.bottom + offset,
				left: target.left + target.width / 2 - tooltip.width / 2
			};
		case 'left':
			return {
				top: target.top + target.height / 2 - tooltip.height / 2,
				left: target.left - tooltip.width - offset
			};
		case 'right':
			return {
				top: target.top + target.height / 2 - tooltip.height / 2,
				left: target.right + offset
			};
	}
}

/** Check if tooltip fits on the primary axis. */
function fitsPrimaryAxis(
	pos: { top: number; left: number },
	tooltip: DOMRect,
	placement: TooltipPlacement,
	vh: number,
	vw: number
): boolean {
	switch (placement) {
		case 'top':
			return pos.top >= VIEWPORT_PADDING;
		case 'bottom':
			return pos.top + tooltip.height <= vh - VIEWPORT_PADDING;
		case 'left':
			return pos.left >= VIEWPORT_PADDING;
		case 'right':
			return pos.left + tooltip.width <= vw - VIEWPORT_PADDING;
	}
}

function fitsAll(
	pos: { top: number; left: number },
	tooltip: DOMRect,
	vw: number,
	vh: number
): boolean {
	return (
		pos.top >= VIEWPORT_PADDING &&
		pos.left >= VIEWPORT_PADDING &&
		pos.top + tooltip.height <= vh - VIEWPORT_PADDING &&
		pos.left + tooltip.width <= vw - VIEWPORT_PADDING
	);
}

/** Slide the tooltip along the cross-axis so it stays inside the viewport. */
function shiftCrossAxis(
	pos: { top: number; left: number },
	tooltip: DOMRect,
	placement: TooltipPlacement,
	vw: number,
	vh: number
): { top: number; left: number } {
	const out = { ...pos };

	if (placement === 'top' || placement === 'bottom') {
		// horizontal slide
		if (out.left < VIEWPORT_PADDING) out.left = VIEWPORT_PADDING;
		if (out.left + tooltip.width > vw - VIEWPORT_PADDING) {
			out.left = vw - tooltip.width - VIEWPORT_PADDING;
		}
	} else {
		// vertical slide
		if (out.top < VIEWPORT_PADDING) out.top = VIEWPORT_PADDING;
		if (out.top + tooltip.height > vh - VIEWPORT_PADDING) {
			out.top = vh - tooltip.height - VIEWPORT_PADDING;
		}
	}

	return out;
}

function clampToViewport(
	result: { top: number; left: number; placement: TooltipPlacement },
	tooltip: DOMRect,
	vw: number,
	vh: number
): { top: number; left: number; placement: TooltipPlacement } {
	return {
		...result,
		top: clampCoordinate(result.top, vh, tooltip.height),
		left: clampCoordinate(result.left, vw, tooltip.width)
	};
}

/** Clamp a coordinate without producing a negative upper bound on tiny viewports. */
function clampCoordinate(value: number, viewportSize: number, tooltipSize: number): number {
	const max = viewportSize - tooltipSize - VIEWPORT_PADDING;
	if (max < VIEWPORT_PADDING) return Math.max(0, (viewportSize - tooltipSize) / 2);
	return Math.min(Math.max(value, VIEWPORT_PADDING), max);
}

/**
 * Return the px offset from the tooltip's start-edge to the point where the
 * arrow should sit so it aims at the centre of the target.
 *
 * Also used in CSS anchor-positioning mode, where JS does not position the
 * panel itself but still aims the arrow from a post-layout measurement
 * (pass the measured tooltip rect for both `tooltip` and `pos`).
 */
export function aimArrow(
	target: DOMRect,
	tooltip: DOMRect,
	pos: { top: number; left: number },
	placement: TooltipPlacement
): number {
	if (placement === 'top' || placement === 'bottom') {
		if (tooltip.width < ARROW_EDGE_PADDING * 2) return tooltip.width / 2;
		const targetCentreX = target.left + target.width / 2;
		const raw = targetCentreX - pos.left;
		return Math.max(ARROW_EDGE_PADDING, Math.min(raw, tooltip.width - ARROW_EDGE_PADDING));
	}
	if (tooltip.height < ARROW_EDGE_PADDING * 2) return tooltip.height / 2;
	const targetCentreY = target.top + target.height / 2;
	const raw = targetCentreY - pos.top;
	return Math.max(ARROW_EDGE_PADDING, Math.min(raw, tooltip.height - ARROW_EDGE_PADDING));
}

function opposite(p: TooltipPlacement): TooltipPlacement {
	switch (p) {
		case 'top': return 'bottom';
		case 'bottom': return 'top';
		case 'left': return 'right';
		case 'right': return 'left';
	}
}

function flipOrder(preferred: TooltipPlacement): TooltipPlacement[] {
	switch (preferred) {
		case 'top': return ['bottom', 'right', 'left'];
		case 'bottom': return ['top', 'right', 'left'];
		case 'left': return ['right', 'top', 'bottom'];
		case 'right': return ['left', 'top', 'bottom'];
	}
}
