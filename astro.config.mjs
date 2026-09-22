// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import svelte from '@astrojs/svelte';
import stylex from '@stylexjs/unplugin';

/**
 * Cloudflare's workerd SSR runner crashes when Vite rediscovers deps mid-request
 * and rehashes `deps_ssr` while old chunk URLs (e.g. handler-*.js) are still live.
 * The adapter already sets `ignoreOutdatedRequests` for the client env only.
 * @see https://github.com/withastro/astro/issues/16248
 * @see https://github.com/withastro/astro/issues/17788
 */
function stabilizeCloudflareSsrDeps() {
	return {
		name: 'stabilize-cloudflare-ssr-deps',
		configEnvironment(environment) {
			if (environment === 'client') return;
			return {
				optimizeDeps: {
					ignoreOutdatedRequests: true,
					include: [
						'astro/assets/services/noop',
						'astro/logger/console',
						'@astrojs/svelte/server.js',
						'svelte',
						'bits-ui',
						'@stylexjs/stylex',
					],
				},
			};
		},
	};
}

// https://astro.build/config
export default defineConfig({
	adapter: cloudflare({
		imageService: 'compile',
		prerenderEnvironment: 'node',
	}),
	session: false,
	integrations: [svelte()],
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Instrument Serif',
			cssVariable: '--font-display',
			weights: [400],
			styles: ['normal', 'italic'],
			fallbacks: ['Georgia', 'serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'Figtree',
			cssVariable: '--font-body',
			weights: ['300 700'],
			styles: ['normal'],
			fallbacks: ['ui-sans-serif', 'sans-serif'],
		},
	],
	vite: {
		optimizeDeps: {
			include: [
				'astro/assets/services/noop',
				'astro/logger/console',
				'@astrojs/svelte/server.js',
				'svelte',
				'bits-ui',
				'@stylexjs/stylex',
			],
		},
		plugins: [
			stabilizeCloudflareSsrDeps(),
			stylex.vite({
				useCSSLayers: true,
				dev: process.env.NODE_ENV !== 'production',
				runtimeInjection: false,
			}),
		],
	},
});
