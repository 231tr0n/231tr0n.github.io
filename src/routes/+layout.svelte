<script lang="ts">
	import '#lib/css/main.css';
	import '#lib/utils/tooltip.js';

	import Navbar from '#lib/components/Navbar.svelte';
	import Footer from '#lib/components/Footer.svelte';
	import Cursor from '#lib/components/Cursor.svelte';
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';
	import { animationDelay, animationDuration } from '#lib/constants/app.constants.js';
	import { onMount, type Snippet } from 'svelte';
	import { on } from 'svelte/events';
	import { afterNavigate } from '$app/navigation';
	import { setupScrollbars } from '#lib/utils/scrollbar.js';
	import { setupExternalLinks } from '#lib/utils/anchor.js';

	let { children }: { children?: Snippet } = $props();

	const getRouteTitle = (routeId: string | null): string | null => {
		switch (routeId) {
			case '/misc/htmlplayground':
				return 'HTML Playground';
			case '/misc/sourcemap':
				return 'Bundle Statistics';
			case '/games/ludo':
				return 'Ludo';
			case '/games/tictactoe':
				return 'Tic Tac Toe';
			case '/blog/config':
				return 'Neovim Configuration';
			case null:
			default:
				return null;
		}
	};

	const title = $derived.by(() => {
		if (page.route.id === '/') return '231tr0n — Linux Enthusiast, Programmer and Gopher';
		const mapped = getRouteTitle(page.route.id);
		if (mapped !== null) return `${mapped} — 231tr0n`;
		const seg = page.url.pathname.replace(/\/$/, '').split('/').pop() ?? '';
		return seg.charAt(0).toUpperCase() + seg.slice(1) + ' — 231tr0n';
	});

	const canonicalUrl = $derived(`${__SITE_URL__}${page.url.pathname}`);

	$effect(() => {
		return setupExternalLinks();
	});

	onMount(() => {
		const style = document.createElement('style');
		style.textContent = `* { transition: background-color ${String(animationDuration)}ms linear, color ${String(animationDuration)}ms linear; }`;
		document.head.appendChild(style);
		const scrollbars = setupScrollbars();
		let offControllerChange: (() => void) | null = null;

		if ('serviceWorker' in navigator) {
			let hadController = navigator.serviceWorker.controller !== null;
			let reloading = false;
			offControllerChange = on(navigator.serviceWorker, 'controllerchange', () => {
				if (!hadController) {
					hadController = true;
					return;
				}
				if (reloading) return;
				reloading = true;
				window.location.reload();
			});

			void (async () => {
				try {
					const registration = await navigator.serviceWorker.ready;
					if (navigator.serviceWorker.controller && registration.waiting) {
						registration.waiting.postMessage({ type: 'SKIP_WAITING' });
					}
					on(registration, 'updatefound', () => {
						const newWorker = registration.installing;
						if (!newWorker) return;

						on(newWorker, 'statechange', () => {
							if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
								newWorker.postMessage({ type: 'SKIP_WAITING' });
							}
						});
					});
				} catch (error) {
					console.error('Failed to get service worker registration', error);
				}
			})();
		}

		return () => {
			scrollbars.destroy();
			style.remove();
			offControllerChange?.();
		};
	});

	afterNavigate(({ shallow, type }) => {
		if (shallow && type === 'goto') return;

		if ('serviceWorker' in navigator) {
			void (async () => {
				try {
					const registration = await navigator.serviceWorker.getRegistration();
					await registration?.update();
				} catch (error) {
					console.error('Failed to update service worker', error);
				}
			})();
		}
	});
</script>

<svelte:head>
	{#if !page.error}
		<meta content={title} property="og:title" />
		<meta content={canonicalUrl} property="og:url" />
		<meta name="twitter:title" content={title} />
		<meta
			content="Personal website of Srikar (231tr0n) — Linux enthusiast, Gopher, programmer, badminton player and gamer."
			property="og:description" />
		<meta
			name="twitter:description"
			content="Personal website of Srikar (231tr0n) — Linux enthusiast, Gopher, programmer, badminton player and gamer." />
	{/if}
	<meta content="{__SITE_URL__}/images/banner.avif" property="og:image" />
	<meta content="image/avif" property="og:image:type" />
	<meta content="1200" property="og:image:width" />
	<meta content="630" property="og:image:height" />
	<meta content="231tr0n banner" property="og:image:alt" />
	<meta name="twitter:image" content="{__SITE_URL__}/images/banner.avif" />
</svelte:head>

<Cursor />
<Navbar />
<div class="background">
	<div class="zeltron-body-background opacity"></div>
</div>
{#key page.url.pathname}
	<main
		in:fade={{ duration: animationDuration, delay: animationDelay }}
		out:fade={{ duration: animationDuration }}>
		{@render children?.()}
	</main>
{/key}
<Footer />

<style>
	.opacity {
		position: fixed;
		width: 100%;
		height: 100%;
		opacity: 85%;
		z-index: var(--z-index-background-opacity);
	}

	.background {
		background-image: url('/images/background.avif');
		background-position: center;
		background-repeat: repeat;
		filter: blur(4px);
		position: fixed;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: var(--z-index-background);
	}

	main {
		position: fixed;
		top: var(--layout-header-height);
		left: 0;
		right: 0;
		bottom: var(--layout-footer-height);
		padding: 0;
		margin: 0;
		box-sizing: border-box;
		overflow: hidden;
		z-index: var(--z-index-main);
	}
</style>
