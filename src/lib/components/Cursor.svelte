<script lang="ts">
	import { Tween } from 'svelte/motion';
	import {
		animationDuration,
		cursorRadius,
		cursorClickRadius,
		cursorStrokeWidth
	} from '#lib/constants/app.constants.js';
	import { linear } from 'svelte/easing';
	import { onDestroy, onMount } from 'svelte';
	import { on } from 'svelte/events';

	const controller = new AbortController();

	const radius = new Tween(cursorRadius, { duration: animationDuration, delay: 0, easing: linear });
	const cursor = new Tween(
		{ x: 0, y: 0 },
		{ duration: animationDuration, delay: 0, easing: linear }
	);

	let visible = $state(false);

	const moveCursor = (x: number, y: number) => {
		if (visible) {
			cursor.target = { x, y };
			return;
		}
		void cursor.set({ x, y }, { duration: 0 });
		visible = true;
	};

	onMount(() => {
		const listenerOptions = { signal: controller.signal };
		on(
			document,
			'mousemove',
			(e) => {
				moveCursor(e.clientX, e.clientY);
			},
			listenerOptions
		);
		on(
			document,
			'touchmove',
			(e) => {
				const touch = Array.from(e.touches).at(-1);
				if (touch) moveCursor(touch.clientX, touch.clientY);
			},
			listenerOptions
		);
		const hide = () => {
			radius.target = 0;
		};
		const show = () => {
			radius.target = cursorRadius;
		};
		on(document, 'mouseleave', hide, listenerOptions);
		on(document, 'mouseenter', show, listenerOptions);
		on(document, 'mouseup', show, listenerOptions);
		on(
			document,
			'mousedown',
			(e) => {
				moveCursor(e.clientX, e.clientY);
				radius.target = cursorClickRadius;
			},
			listenerOptions
		);
		on(document, 'touchcancel', show, listenerOptions);
		on(
			document,
			'touchstart',
			(e) => {
				const touch = e.touches.item(0);
				if (touch) moveCursor(touch.clientX, touch.clientY);
				radius.target = cursorClickRadius;
			},
			listenerOptions
		);
		on(document, 'touchend', show, listenerOptions);
	});

	onDestroy(() => {
		controller.abort();
	});
</script>

{#if visible}
	<svg>
		<circle
			class="circle"
			cx={cursor.current.x}
			cy={cursor.current.y}
			r={radius.current}
			stroke-width={cursorStrokeWidth} />
	</svg>
{/if}

<style>
	svg {
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: var(--z-index-cursor);
	}

	.circle {
		fill: none;
		stroke: var(--color-component-background);
	}
</style>
