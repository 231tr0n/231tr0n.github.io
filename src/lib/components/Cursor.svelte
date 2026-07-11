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
		const sig = { signal: controller.signal };
		on(
			document,
			'mousemove',
			(e) => {
				cursor.target = { x: e.clientX, y: e.clientY };
			},
			sig
		);
		on(
			document,
			'touchmove',
			(e) => {
				const touch = e.touches[e.touches.length - 1];
				if (touch) cursor.target = { x: touch.clientX, y: touch.clientY };
			},
			sig
		);
		const hide = () => {
			radius.target = 0;
		};
		const show = () => {
			radius.target = cursorRadius;
		};
		on(document, 'mouseleave', hide, sig);
		on(document, 'mouseout', hide, sig);
		on(document, 'mouseover', show, sig);
		on(document, 'mouseenter', show, sig);
		on(document, 'mouseup', show, sig);
		on(
			document,
			'mousedown',
			() => {
				radius.target = cursorClickRadius;
			},
			sig
		);
		on(document, 'touchcancel', show, sig);
		on(
			document,
			'touchstart',
			() => {
				radius.target = cursorClickRadius;
			},
			sig
		);
		on(document, 'touchend', show, sig);
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
		z-index: 2;
		position: fixed;
		top: 0px;
		bottom: 0px;
		left: 0px;
		right: 0px;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.circle {
		fill: none;
		stroke: var(--color-component-background);
	}
</style>
