import type { TooltipTheme, TooltipThemeMode } from './types.js';

/** Modern light theme (default when the page is light). */
export const lightTheme: Required<TooltipTheme> = {
	background: '#1f2937',
	color: '#f9fafb',
	border: 'transparent',
	shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.15)',
	borderRadius: '8px',
	fontSize: '13px',
	fontFamily:
		'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
	fontWeight: '500',
	padding: '6px 10px',
	maxWidth: '260px',
	arrowSize: '6px',
	zIndex: 9999
};

/**
 * Modern dark theme for dark pages.
 * Slightly lighter panel so it lifts off dark backgrounds.
 */
export const darkTheme: Required<TooltipTheme> = {
	background: '#f3f4f6',
	color: '#111827',
	border: 'transparent',
	shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.45), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
	borderRadius: '8px',
	fontSize: '13px',
	fontFamily:
		'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
	fontWeight: '500',
	padding: '6px 10px',
	maxWidth: '260px',
	arrowSize: '6px',
	zIndex: 9999
};

/**
 * Detect whether the current page is in dark mode.
 * Checks, in order:
 * 1. `data-theme` / `data-color-scheme` / `data-bs-theme` on `<html>` or `<body>`
 * 2. `.dark` / `.theme-dark` class on `<html>` or `<body>`
 * 3. `color-scheme` CSS property on the root
 * 4. `prefers-color-scheme: dark` media query
 */
export function detectDarkMode(): boolean {
	if (typeof document === 'undefined') return false;

	const root = document.documentElement;
	const body = document.body;

	const attrCandidates = [
		root.getAttribute('data-theme'),
		root.getAttribute('data-color-scheme'),
		root.getAttribute('data-bs-theme'),
		body?.getAttribute('data-theme'),
		body?.getAttribute('data-color-scheme'),
		body?.getAttribute('data-bs-theme')
	];

	for (const value of attrCandidates) {
		if (!value) continue;
		const v = value.toLowerCase();
		if (v === 'dark' || v.includes('dark')) return true;
		if (v === 'light' || v.includes('light')) return false;
	}

	if (
		root.classList.contains('dark') ||
		root.classList.contains('theme-dark') ||
		body?.classList.contains('dark') ||
		body?.classList.contains('theme-dark')
	) {
		return true;
	}

	if (
		root.classList.contains('light') ||
		root.classList.contains('theme-light') ||
		body?.classList.contains('light') ||
		body?.classList.contains('theme-light')
	) {
		return false;
	}

	try {
		const scheme = getComputedStyle(root).colorScheme;
		if (scheme.includes('dark') && !scheme.includes('light')) return true;
		if (scheme.includes('light') && !scheme.includes('dark')) return false;
	} catch {
		// ignore
	}

	return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

/**
 * Resolve a theme mode or partial custom theme into a complete theme object.
 */
export function resolveTheme(theme: TooltipThemeMode | TooltipTheme): Required<TooltipTheme> {
	if (theme === 'light') return { ...lightTheme };
	if (theme === 'dark') return { ...darkTheme };

	if (theme === 'auto') {
		return detectDarkMode() ? { ...darkTheme } : { ...lightTheme };
	}

	const base = detectDarkMode() ? darkTheme : lightTheme;
	return {
		...base,
		...theme,
		arrowSize:
			theme.arrowSize !== undefined
				? typeof theme.arrowSize === 'number'
					? `${theme.arrowSize}px`
					: theme.arrowSize
				: base.arrowSize
	};
}

/**
 * Apply a resolved theme as CSS custom properties on an element.
 */
export function applyThemeVars(el: HTMLElement, theme: Required<TooltipTheme>): void {
	const arrow =
		typeof theme.arrowSize === 'number' ? `${theme.arrowSize}px` : String(theme.arrowSize);

	el.style.setProperty('--stt-bg', theme.background);
	el.style.setProperty('--stt-color', theme.color);
	el.style.setProperty('--stt-border', theme.border);
	el.style.setProperty('--stt-shadow', theme.shadow);
	el.style.setProperty('--stt-radius', theme.borderRadius);
	el.style.setProperty('--stt-font-size', theme.fontSize);
	el.style.setProperty('--stt-font-family', theme.fontFamily);
	el.style.setProperty('--stt-font-weight', theme.fontWeight);
	el.style.setProperty('--stt-padding', theme.padding);
	el.style.setProperty('--stt-max-width', theme.maxWidth);
	el.style.setProperty('--stt-arrow-size', arrow);
	el.style.setProperty('--stt-z-index', String(theme.zIndex));
}
