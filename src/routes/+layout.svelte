<script lang="ts">
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>svelte-tooltip-gca — Modern tooltips for Svelte 5</title>
	<meta
		name="description"
		content="A modern, theme-aware tooltip action for Svelte 5. Auto light/dark, mobile-friendly, and fully customizable."
	/>
</svelte:head>

{@render children()}
