/**
 * Centralized SEO, structured-data definitions.
 *
 */

export const siteUrl = 'https://gabryca.github.io/svelte-tooltip-gca/';
export const ogImageUrl = `${siteUrl}og-image.png`;

export const title = 'svelte-tooltip-gca — Tooltips for Svelte 5 (Docs & Demo)';

export const version = '1.0.4';

export const description =
	'Modern, theme-aware tooltip action (use:tooltip) for Svelte 5: automatic light/dark themes, mobile touch support, top-layer Popover API rendering and zero dependencies. Docs, quick start, API reference and live playground.';

export interface FaqItem {
	question: string;
	answer: string;
}

export const faqItems: FaqItem[] = [
	{
		question: 'What is svelte-tooltip-gca?',
		answer:
			'svelte-tooltip-gca is a modern, theme-aware tooltip library for Svelte 5. It ships as a single Svelte action (use:tooltip) with zero dependencies, automatic light and dark themes, mobile touch support, and top-layer rendering through the native Popover API.'
	},
	{
		question: 'How do I install svelte-tooltip-gca?',
		answer:
			"Run npm install svelte-tooltip-gca. The package requires Svelte 5 (^5.0.0) as a peer dependency and works in SvelteKit, Vite and any Svelte 5 app."
	},
	{
		question: 'How do I add a tooltip to an element?',
		answer:
			"Import the tooltip action and attach it with use:tooltip. Pass a string (use:tooltip={'Hello'}) for the simplest case, or an options object (use:tooltip={{ content: 'Hello', placement: 'right', delay: 200 }}) for full control."
	},
	{
		question: 'Does it work on mobile and touch devices?',
		answer:
			"Yes. On touch devices the default behavior is tap-to-toggle, with an optional long-press mode (touchBehavior: 'longpress'). Tapping outside dismisses the tooltip, and it auto-hides after touchHideDelay (default 3000ms)."
	},
	{
		question: 'How do I theme the tooltip?',
		answer:
			"Use theme: 'auto' (default), 'light' or 'dark', or pass a custom TooltipTheme object with fields such as background, color, borderRadius, padding, shadow and maxWidth."
	},
	{
		question: 'Is the tooltip accessible?',
		answer:
			'Yes. Tooltips render with role="tooltip", are connected to their target via aria-describedby, open on keyboard focus, dismiss with Escape, and animations respect prefers-reduced-motion.'
	},
	{
		question: 'How does it avoid being clipped by overflow?',
		answer:
			"Tooltips render in the browser's top layer using the native Popover API, so they are never clipped by overflow: hidden containers and are immune to z-index conflicts."
	},
	{
		question: 'Does svelte-tooltip-gca have any dependencies?',
		answer: 'No runtime dependencies. The only peer dependency is Svelte 5 (^5.0.0).'
	}
];

export const webSiteSchema = JSON.stringify({
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	name: 'svelte-tooltip-gca — Docs & Demo',
	url: siteUrl,
	description,
	inLanguage: 'en'
});

export const softwareSchema = JSON.stringify({
	'@context': 'https://schema.org',
	'@type': 'SoftwareApplication',
	name: 'svelte-tooltip-gca',
	alternateName: 'svelte tooltip gca',
	description,
	applicationCategory: 'DeveloperApplication',
	operatingSystem: 'Any',
	url: siteUrl,
	installUrl: 'https://www.npmjs.com/package/svelte-tooltip-gca',
	downloadUrl: 'https://www.npmjs.com/package/svelte-tooltip-gca',
	softwareVersion: version,
	license: 'https://opensource.org/licenses/MIT',
	offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
	author: { '@type': 'Person', name: 'AnonymousGCA', url: 'https://anonymousgca.eu' },
	publisher: { '@type': 'Organization', name: 'GABRYCA', url: 'https://github.com/GABRYCA' },
	programmingLanguage: 'JavaScript',
	softwareRequirements: 'Svelte ^5.0.0',
	featureList:
		'Auto light/dark theme, mobile touch support, Popover API top-layer, keyboard accessible, zero dependencies'
});

export const faqSchema = JSON.stringify({
	'@context': 'https://schema.org',
	'@type': 'FAQPage',
	mainEntity: faqItems.map(({ question, answer }) => ({
		'@type': 'Question',
		name: question,
		acceptedAnswer: { '@type': 'Answer', text: answer }
	}))
});

/**
 * The three schema blocks joined as ready-to-inline <script type="application/ld+json"> tags.
 * Rendered via a single {@html} block in the layout <svelte:head>, which avoids Svelte's
 * hydration comment markers inside the JSON body.
 */
export const jsonLdBlocks = [webSiteSchema, softwareSchema, faqSchema]
.map((schema) => `<script type="application/ld+json">${schema}</script>`)
.join('\n');
