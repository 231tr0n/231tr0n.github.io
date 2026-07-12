<script lang="ts">
	import { Tween } from 'svelte/motion';
	import {
		animationDuration,
		cursorRadius,
		cursorClickRadius,
		cursorStrokeWidth
	} from '$lib/constants/app.constants';
	import { linear } from 'svelte/easing';
	import { onDestroy, onMount } from 'svelte';
	import { on } from 'svelte/events';

	const controller = new AbortController();

	const radius = new Tween(cursorRadius, { duration: animationDuration, delay: 0, easing: linear });
	const cursor = new Tween(
		{ x: 0, y: 0 },
		{ duration: animationDuration, delay: 0, easing: linear }
	);

	onMount(() => {
		const listenerOptions = { signal: controller.signal };
		on(
			document,
			'mousemove',
			(e) => {
				cursor.target = { x: e.clientX, y: e.clientY };
			},
			listenerOptions
		);
		on(
			document,
			'touchmove',
			(e) => {
				const touch = e.touches[e.touches.length - 1];
				if (touch) cursor.target = { x: touch.clientX, y: touch.clientY };
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
		on(document, 'mouseout', hide, listenerOptions);
		on(document, 'mouseover', show, listenerOptions);
		on(document, 'mouseenter', show, listenerOptions);
		on(document, 'mouseup', show, listenerOptions);
		on(
			document,
			'mousedown',
			() => {
				radius.target = cursorClickRadius;
			},
			listenerOptions
		);
		on(document, 'touchcancel', show, listenerOptions);
		on(
			document,
			'touchstart',
			() => {
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

{#if cursor.target.x !== 0 && cursor.target.y !== 0}
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
