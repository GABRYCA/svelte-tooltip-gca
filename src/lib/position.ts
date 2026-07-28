import type { TooltipPlacement } from './types.js';

export interface PositionResult {
	top: number;
	left: number;
	placement: TooltipPlacement;
}

const VIEWPORT_PADDING = 8;

/**
 * Compute fixed-position coordinates for the tooltip, flipping when needed
 * so the panel stays inside the viewport.
 */
export function computePosition(
	target: DOMRect,
	tooltip: DOMRect,
	preferred: TooltipPlacement,
	offset: number
): PositionResult {
	const vw = window.innerWidth;
	const vh = window.innerHeight;

	const placements: TooltipPlacement[] = [preferred, ...oppositeOrder(preferred)];

	for (const placement of placements) {
		const pos = place(target, tooltip, placement, offset);
		if (fits(pos, tooltip, vw, vh)) {
			return clampToViewport({ ...pos, placement }, tooltip, vw, vh);
		}
	}

	// Fall back to preferred even if it overflows, then clamp
	const fallback = place(target, tooltip, preferred, offset);
	return clampToViewport({ ...fallback, placement: preferred }, tooltip, vw, vh);
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

function fits(
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

function clampToViewport(
	result: PositionResult,
	tooltip: DOMRect,
	vw: number,
	vh: number
): PositionResult {
	return {
		...result,
		top: Math.min(
			Math.max(result.top, VIEWPORT_PADDING),
			vh - tooltip.height - VIEWPORT_PADDING
		),
		left: Math.min(
			Math.max(result.left, VIEWPORT_PADDING),
			vw - tooltip.width - VIEWPORT_PADDING
		)
	};
}

function oppositeOrder(preferred: TooltipPlacement): TooltipPlacement[] {
	switch (preferred) {
		case 'top':
			return ['bottom', 'right', 'left'];
		case 'bottom':
			return ['top', 'right', 'left'];
		case 'left':
			return ['right', 'top', 'bottom'];
		case 'right':
			return ['left', 'top', 'bottom'];
	}
}
