<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { animationDuration } from '$lib/animation.constants';
	import { linear } from 'svelte/easing';
	import { onDestroy, onMount } from 'svelte';

	let controller = new AbortController();

	let circleRadius = 50;
	let circleClickRadius = 100;
	let strokeWidth = 10;

	let radius = new Tween(circleRadius, { duration: animationDuration, delay: 0, easing: linear });
	let cursor = new Tween({ x: 0, y: 0 }, { duration: animationDuration, delay: 0, easing: linear });

	onMount(() => {
		document.addEventListener(
			'mousemove',
			(event) => {
				cursor.target = { x: event.clientX, y: event.clientY };
			},
			{ signal: controller.signal }
		);
		document.addEventListener(
			'touchmove',
			(event) => {
				if (event.touches.length === 0) return;
				cursor.target = {
					x: event.touches[event.touches.length - 1].clientX,
					y: event.touches[event.touches.length - 1].clientY
				};
			},
			{ signal: controller.signal }
		);
		document.addEventListener(
			'mouseleave',
			() => {
				radius.target = 0;
			},
			{ signal: controller.signal }
		);
		document.addEventListener(
			'mouseout',
			() => {
				radius.target = 0;
			},
			{ signal: controller.signal }
		);
		document.addEventListener(
			'mouseover',
			() => {
				radius.target = circleRadius;
			},
			{ signal: controller.signal }
		);
		document.addEventListener(
			'mouseenter',
			() => {
				radius.target = circleRadius;
			},
			{ signal: controller.signal }
		);
		document.addEventListener(
			'mouseup',
			() => {
				radius.target = circleRadius;
			},
			{ signal: controller.signal }
		);
		document.addEventListener(
			'mousedown',
			() => {
				radius.target = circleClickRadius;
			},
			{ signal: controller.signal }
		);
		document.addEventListener(
			'touchcancel',
			() => {
				radius.target = circleRadius;
			},
			{ signal: controller.signal }
		);
		document.addEventListener(
			'touchstart',
			() => {
				radius.target = circleClickRadius;
			},
			{ signal: controller.signal }
		);
		document.addEventListener(
			'touchend',
			() => {
				radius.target = circleRadius;
			},
			{ signal: controller.signal }
		);
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
			stroke-width={strokeWidth} />
	</svg>
{/if}

<style>
	svg {
		z-index: 2;
		width: 100%;
		height: 100%;
		position: fixed;
		top: 0px;
		bottom: 0px;
		left: 0px;
		right: 0px;
		pointer-events: none;
	}

	.circle {
		fill: none;
		stroke: var(--color-light-component-background);
	}

	:global(body.dark) .circle {
		stroke: var(--color-dark-component-background);
	}
</style>
