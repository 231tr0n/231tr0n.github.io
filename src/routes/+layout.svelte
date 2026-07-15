<script lang="ts">
	import '$lib/css/main.css';
	import '$lib/utils/tooltip';

	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Cursor from '$lib/components/Cursor.svelte';
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';
	import { animationDelay, animationDuration } from '$lib/constants/app.constants';
	import { onMount, type Snippet } from 'svelte';
	import { setupScrollbars } from '$lib/utils/scrollbar';
	import { setupExternalLinks } from '$lib/utils/anchor';

	let { children }: { children?: Snippet } = $props();

	let title = $derived.by(() => {
		const path = page.url.pathname;
		if (path === '/') return '231tr0n';
		const seg = path.replace(/\/$/, '').split('/').pop() ?? '';
		return seg.charAt(0).toUpperCase() + seg.slice(1) + ' — 231tr0n';
	});

	$effect(() => {
		return setupExternalLinks();
	});

	onMount(() => {
		const style = document.createElement('style');
		style.textContent = `* { transition: background-color ${String(animationDuration)}ms linear, color ${String(animationDuration)}ms linear; }`;
		document.head.appendChild(style);
		const scrollbars = setupScrollbars();
		document.onfullscreenchange = () => {
			document.body.classList.toggle('full-screen', !!document.fullscreenElement);
		};
		return () => {
			scrollbars.destroy();
			style.remove();
			document.onfullscreenchange = null;
		};
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta content={title} property="og:title" />
	<meta content={page.url.href} property="og:url" />
	<meta name="twitter:title" content={title} />
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
