<script lang="ts">
	import '$lib/css/main.css';

	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';
	import { Tween } from 'svelte/motion';
	import { animationDelay, animationDuration } from '$lib/animation.constants';
	import { linear } from 'svelte/easing';
	import { onMount } from 'svelte';

	let { children } = $props();

	let defaultCursorSize = 10;
	let defaultCursorClickSize = 15;
	let innerCircleSizeDifference = 5;

	let cursorSize = new Tween(defaultCursorSize, { duration: 0, delay: 0, easing: linear });
	let innerCursor = new Tween({ x: 0, y: 0 }, { duration: 0, delay: 0, easing: linear });
	let outerCursor = new Tween(
		{ x: 0, y: 0 },
		{ duration: animationDuration, delay: 0, easing: linear }
	);

	onMount(() => {
		document.onfullscreenchange = () => {
			if (document.fullscreenElement) {
				document.body.classList.add('full-screen');
			} else {
				document.body.classList.remove('full-screen');
			}
		};
		document.onmousemove = (event) => {
			innerCursor.target = { x: event.clientX, y: event.clientY };
			outerCursor.target = { x: event.clientX, y: event.clientY };
		};
		document.onmouseleave = () => {
			cursorSize.target = 0;
		};
		document.onmouseout = () => {
			cursorSize.target = 0;
		};
		document.onmouseover = () => {
			cursorSize.target = defaultCursorSize;
		};
		document.onmouseenter = () => {
			cursorSize.target = defaultCursorSize;
		};
		document.onmouseup = () => {
			cursorSize.target = defaultCursorSize;
		};
		document.onmousedown = () => {
			cursorSize.target = defaultCursorClickSize;
		};
	});
</script>

<svg>
	<circle
		class="outer-circle"
		cx={outerCursor.current.x}
		cy={outerCursor.current.y}
		r={cursorSize.current}
		stroke-width={cursorSize.current - innerCircleSizeDifference} />
	<circle
		class="inner-circle"
		cx={innerCursor.current.x}
		cy={innerCursor.current.y}
		r={cursorSize.current - innerCircleSizeDifference} />
</svg>
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

	svg {
		z-index: 8;
		width: 100%;
		height: 100%;
		position: fixed;
		top: 0px;
		bottom: 0px;
		left: 0px;
		right: 0px;
		pointer-events: none;
	}

	.inner-circle {
		fill: var(--color-light-error);
	}

	:global(body.dark) .inner-circle {
		fill: var(--color-dark-error);
	}

	.outer-circle {
		fill: none;
		stroke: var(--color-light-badge-foreground);
	}

	:global(body.dark) .outer-circle {
		stroke: var(--color-dark-badge-foreground);
	}
</style>
