<script lang="ts">
	import '$lib/css/main.css';

	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';
	import { animationDelay, animationDuration } from '$lib/animation.constants';
	import Cursor from '$lib/components/Cursor.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		document.onfullscreenchange = () => {
			if (document.fullscreenElement) {
				document.body.classList.add('full-screen');
			} else {
				document.body.classList.remove('full-screen');
			}
		};
	});
</script>

<Cursor />
<Navbar />
<div class="background">
	<div class="body opacity"></div>
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
		z-index: 2;
	}

	.background {
		background-image: url('/images/background.avif');
		background-position: center;
		background-repeat: repeat;
		filter: blur(0px);
		position: fixed;
		width: 100%;
		height: 100%;
		top: 0px;
		left: 0px;
		right: 0px;
		bottom: 0px;
		z-index: 1;
	}

	main {
		position: fixed;
		top: 45px;
		left: 0px;
		right: 0px;
		bottom: 45px;
		padding: 0px;
		margin: 0px;
		box-sizing: border-box;
		overflow: hidden;
		z-index: 3;
	}
</style>
