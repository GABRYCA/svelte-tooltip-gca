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

export function computePosition(
	target: DOMRect,
	tooltip: DOMRect,
	preferred: TooltipPlacement,
	offset: number,
	overflowBehavior: TooltipOverflowBehavior = 'shift'
): PositionResult {
	if (overflowBehavior === 'flip') {
		return computeFlip(target, tooltip, preferred, offset);
	}
	return computeShift(target, tooltip, preferred, offset);
}

/* ------------------------------------------------------------------ */
/*  "shift" strategy (default)                                         */
/* ------------------------------------------------------------------ */

function computeShift(
	target: DOMRect,
	tooltip: DOMRect,
	preferred: TooltipPlacement,
	offset: number
): PositionResult {
	const vw = window.innerWidth;
	const vh = window.innerHeight;

	let placement = preferred;
	if (!fitsPrimaryAxis(place(target, tooltip, preferred, offset), tooltip, preferred, vh, vw)) {
		const opp = opposite(preferred);
		if (fitsPrimaryAxis(place(target, tooltip, opp, offset), tooltip, opp, vh, vw)) {
			placement = opp;
		}
	}

	let pos = place(target, tooltip, placement, offset);
	pos = shiftCrossAxis(pos, tooltip, placement, vw, vh);

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
	offset: number
): PositionResult {
	const vw = window.innerWidth;
	const vh = window.innerHeight;

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
		top: Math.min(Math.max(result.top, VIEWPORT_PADDING), vh - tooltip.height - VIEWPORT_PADDING),
		left: Math.min(Math.max(result.left, VIEWPORT_PADDING), vw - tooltip.width - VIEWPORT_PADDING)
	};
}

/**
 * Return the px offset from the tooltip's start-edge to the point where the
 * arrow should sit so it aims at the centre of the target.
 */
function aimArrow(
	target: DOMRect,
	tooltip: DOMRect,
	pos: { top: number; left: number },
	placement: TooltipPlacement
): number {
	if (placement === 'top' || placement === 'bottom') {
		const targetCentreX = target.left + target.width / 2;
		const raw = targetCentreX - pos.left;
		return Math.max(ARROW_EDGE_PADDING, Math.min(raw, tooltip.width - ARROW_EDGE_PADDING));
	}
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