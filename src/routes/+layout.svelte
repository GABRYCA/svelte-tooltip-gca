<script lang="ts">
	import './layout.css';
	import {
		title,
		description,
		siteUrl,
		ogImageUrl,
		jsonLdBlocks
	} from './seo.js';

	let { children } = $props();
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={siteUrl} />
	<link rel="llms.txt" href="https://gabryca.github.io/svelte-tooltip-gca/llms.txt" />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="svelte-tooltip-gca" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={siteUrl} />
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="svelte-tooltip-gca — tooltips for Svelte 5" />
	<meta property="og:locale" content="en_US" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImageUrl} />
	<meta name="twitter:image:alt" content="svelte-tooltip-gca — tooltips for Svelte 5" />

	{@html jsonLdBlocks}
</svelte:head>

{@render children()}