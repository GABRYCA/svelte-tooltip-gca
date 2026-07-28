/**
 * Preferred placement of the tooltip relative to the target element.
 * When space is insufficient, the tooltip automatically flips to the opposite side.
 */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

/**
 * Built-in theme modes.
 * - `'auto'` — follows the page / system light or dark preference
 * - `'light'` / `'dark'` — force a built-in theme
 */
export type TooltipThemeMode = 'auto' | 'light' | 'dark';

/**
 * CSS variable values that define a tooltip theme.
 * Any omitted fields fall back to the active built-in theme.
 */
export interface TooltipTheme {
	/** Background color of the tooltip panel */
	background?: string;
	/** Text color */
	color?: string;
	/** Border color (set to `'transparent'` to hide) */
	border?: string;
	/** Box shadow */
	shadow?: string;
	/** Border radius */
	borderRadius?: string;
	/** Font size */
	fontSize?: string;
	/** Font family */
	fontFamily?: string;
	/** Font weight */
	fontWeight?: string;
	/** Padding */
	padding?: string;
	/** Max width of the tooltip */
	maxWidth?: string;
	/** Arrow size in pixels (number or CSS length) */
	arrowSize?: string | number;
	/** Z-index of the tooltip (default: 9999) */
	zIndex?: number | string;
}

/**
 * Full configuration object accepted by `use:tooltip`.
 */
export interface TooltipOptions {
	/** Tooltip text content. HTML is escaped by default. */
	content: string;

	/**
	 * When `true`, `content` is treated as HTML (use with trusted content only).
	 * @default false
	 */
	html?: boolean;

	/**
	 * Preferred placement. The tooltip flips automatically when there is not enough space.
	 * @default 'top'
	 */
	placement?: TooltipPlacement;

	/**
	 * Theme mode or a custom theme object.
	 * Pass `'auto' | 'light' | 'dark'` or a partial {@link TooltipTheme}.
	 * @default 'auto'
	 */
	theme?: TooltipThemeMode | TooltipTheme;

	/**
	 * Distance in pixels between the target and the tooltip.
	 * @default 8
	 */
	offset?: number;

	/**
	 * Show delay in milliseconds (desktop hover / focus).
	 * @default 120
	 */
	delay?: number;

	/**
	 * Hide delay in milliseconds.
	 * @default 80
	 */
	hideDelay?: number;

	/**
	 * Whether to render a small arrow pointing at the target.
	 * @default true
	 */
	arrow?: boolean;

	/**
	 * Enable enter/leave animation.
	 * @default true
	 */
	animation?: boolean;

	/**
	 * Animation duration in milliseconds.
	 * @default 160
	 */
	animationDuration?: number;

	/**
	 * Disable the tooltip entirely.
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Extra CSS class(es) applied to the tooltip element.
	 */
	class?: string;

	/**
	 * Max width as a number (px) or CSS length string.
	 * Overrides theme `maxWidth` when set.
	 */
	maxWidth?: number | string;

	/**
	 * How the tooltip opens on touch devices:
	 * - `'tap'` — first tap shows, second tap or outside tap hides
	 * - `'longpress'` — press and hold to show
	 *
	 * On desktop (fine pointer), hover/focus still open the tooltip; a click on
	 * the trigger dismisses it. Coarse-pointer devices use tap/longpress as above.
	 * @default 'tap'
	 */
	touchBehavior?: 'tap' | 'longpress';

	/**
	 * Long-press duration in ms when `touchBehavior` is `'longpress'`.
	 * @default 400
	 */
	longPressDuration?: number;

	/**
	 * Auto-hide timeout on touch devices (ms). `0` disables auto-hide.
	 * @default 3000
	 */
	touchHideDelay?: number;

	/**
	 * Show on keyboard focus of the target.
	 * @default true
	 */
	showOnFocus?: boolean;

	/**
	 * Callback when the tooltip is shown.
	 */
	onShow?: () => void;

	/**
	 * Callback when the tooltip is hidden.
	 */
	onHide?: () => void;
}

/**
 * Parameters accepted by the `tooltip` action.
 * A plain string is treated as `{ content: string }`.
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
	onShow?: () => void;
	onHide?: () => void;
}
