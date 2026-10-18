import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import process from 'node:process';
import { defineConfig } from 'vite';

// SvelteKit 3: all configuration lives on the `sveltekit` Vite plugin
// (svelte.config.js is no longer supported).
export default defineConfig({
	plugins: [
		sveltekit({
			preprocess: vitePreprocess(),
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				fallback: '404.html',
				precompress: false,
				strict: true
			}),
			paths: {
				// BASE_PATH (GitHub Pages: "/svelte-tooltip-gca") must start with "/".
				base: process.argv.includes('dev')
					? ''
					: (process.env.BASE_PATH as '' | `/${string}` | undefined)
			}
		})
	]
});
