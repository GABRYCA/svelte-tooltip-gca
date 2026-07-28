/**
 * svelte-tooltip-gca
 *
 * A modern, theme-aware tooltip action for Svelte 5.
 *
 * @example
 * ```svelte
 * <script>
 *   import { tooltip } from 'svelte-tooltip-gca';
 * </script>
 *
 * <button use:tooltip={'Hello world'}>Hover me</button>
 * ```
 */

export { tooltip } from './tooltip.js';
export { lightTheme, darkTheme, detectDarkMode, resolveTheme } from './themes.js';

export type {
	TooltipParams,
	TooltipOptions,
	TooltipPlacement,
	TooltipTheme,
	TooltipThemeMode,
	ResolvedTooltipOptions
} from './types.js';
