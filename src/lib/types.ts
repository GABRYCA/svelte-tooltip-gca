/**
 * Preferred placement of the tooltip relative to the target element.
 * When space is insufficient, the tooltip automatically flips to the opposite side.
 */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

/**
 * How the tooltip behaves when it overflows the viewport.
 * - `'shift'` — stay on the preferred side, slide along the cross-axis, and
 *   re-aim the arrow at the target (default).
 * - `'flip'` — try the opposite side, then perpendicular sides (legacy)... honestly I think that it doesn't work anymore but
 * 	 it was already planned for removal (=
 */
export type TooltipOverflowBehavior = 'shift' | 'flip';

/**
 * Built-in theme modes.
 */
export type TooltipThemeMode = 'auto' | 'light' | 'dark';

/**
 * CSS variable values that define a tooltip theme.
 */
export interface TooltipTheme {
	background?: string;
	color?: string;
	border?: string;
	shadow?: string;
	borderRadius?: string;
	fontSize?: string;
	fontFamily?: string;
	fontWeight?: string;
	padding?: string;
	maxWidth?: string;
	arrowSize?: string | number;
	zIndex?: number | string;
}

/**
 * Full configuration object accepted by `use:tooltip`.
 */
export interface TooltipOptions {
	content: string;
	html?: boolean;
	placement?: TooltipPlacement;
	theme?: TooltipThemeMode | TooltipTheme;
	offset?: number;
	delay?: number;
	hideDelay?: number;
	arrow?: boolean;
	animation?: boolean;
	animationDuration?: number;
	disabled?: boolean;
	class?: string;
	maxWidth?: number | string;
	touchBehavior?: 'tap' | 'longpress';
	longPressDuration?: number;
	touchHideDelay?: number;
	showOnFocus?: boolean;
	onShow?: () => void;
	onHide?: () => void;

	/**
	 * Viewport-overflow strategy.
	 *
	 * - `'shift'` **(default)** — the tooltip stays on its preferred side and
	 *   slides along the cross-axis so it remains fully visible. The arrow
	 *   re-aims at the target element even when the panel is off-centre.
	 * - `'flip'` — legacy behaviour: the tooltip tries the opposite side, then
	 *   perpendicular sides. Useful in edge-cases where shifting would look odd
	 *   (e.g. very wide tooltips in narrow viewports).
	 *
	 * @default 'shift'
	 */
	overflowBehavior?: TooltipOverflowBehavior;
}

/**
 * Parameters accepted by the `tooltip` action.
 */
export type TooltipParams = string | TooltipOptions;

/** Resolved options after defaults are applied. */
export interface ResolvedTooltipOptions {
	content: string;
	html: boolean;
	placement: TooltipPlacement;
	theme: TooltipThemeMode | TooltipTheme;
	offset: number;
	delay: number;
	hideDelay: number;
	arrow: boolean;
	animation: boolean;
	animationDuration: number;
	disabled: boolean;
	class: string;
	maxWidth: number | string | undefined;
	touchBehavior: 'tap' | 'longpress';
	longPressDuration: number;
	touchHideDelay: number;
	showOnFocus: boolean;
	overflowBehavior: TooltipOverflowBehavior;
	onShow?: () => void;
	onHide?: () => void;
}