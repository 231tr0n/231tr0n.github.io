<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { animationDuration } from '$lib/animation.constants';
	import { linear } from 'svelte/easing';
	import { onDestroy, onMount } from 'svelte';

	let controller = new AbortController();

	let defaultCursorSize = 10;
	let defaultCursorClickSize = 15;
	let innerCircleSizeDifference = 5;
	let outerCircleStrokeWidth = 3;

	let cursorSize = new Tween(defaultCursorSize, { duration: 0, delay: 0, easing: linear });
	let innerCursor = new Tween({ x: 0, y: 0 }, { duration: 0, delay: 0, easing: linear });
	let outerCursor = new Tween(
		{ x: 0, y: 0 },
		{ duration: animationDuration, delay: 0, easing: linear }
	);

	onMount(() => {
		document.addEventListener(
			'mousemove',
			(event) => {
				innerCursor.target = { x: event.clientX, y: event.clientY };
				outerCursor.target = { x: event.clientX, y: event.clientY };
			},
			{ signal: controller.signal }
		);
		document.addEventListener(
			'touchmove',
			(event) => {
				if (event.touches.length === 0) return;
				innerCursor.target = {
					x: event.touches[event.touches.length - 1].clientX,
					y: event.touches[event.touches.length - 1].clientY
				};
				outerCursor.target = {
					x: event.touches[event.touches.length - 1].clientX,
					y: event.touches[event.touches.length - 1].clientY
				};
			},
			{ signal: controller.signal }
		);
		document.addEventListener(
			'mouseleave',
			() => {
				cursorSize.target = 0;
			},
			{ signal: controller.signal }
		);
		document.addEventListener(
			'mouseout',
			() => {
				cursorSize.target = 0;
			},
			{ signal: controller.signal }
		);
		document.addEventListener(
			'mouseover',
			() => {
				cursorSize.target = defaultCursorSize;
			},
			{ signal: controller.signal }
		);
		document.addEventListener(
			'mouseenter',
			() => {
				cursorSize.target = defaultCursorSize;
			},
			{ signal: controller.signal }
		);
		document.addEventListener(
			'mouseup',
			() => {
				cursorSize.target = defaultCursorSize;
			},
			{ signal: controller.signal }
		);
		document.addEventListener(
			'mousedown',
			() => {
				cursorSize.target = defaultCursorClickSize;
			},
			{ signal: controller.signal }
		);
		document.addEventListener(
			'touchcancel',
			() => {
				cursorSize.target = defaultCursorSize;
			},
			{ signal: controller.signal }
		);
		document.addEventListener(
			'touchstart',
			() => {
				cursorSize.target = defaultCursorClickSize;
			},
			{ signal: controller.signal }
		);
		document.addEventListener(
			'touchend',
			() => {
				cursorSize.target = defaultCursorSize;
			},
			{ signal: controller.signal }
		);
	});

	onDestroy(() => {
		controller.abort();
	});
</script>

{#if innerCursor.target.x !== 0 && innerCursor.target.y !== 0}
	<svg>
		<circle
			class="outer-circle"
			cx={outerCursor.current.x}
			cy={outerCursor.current.y}
			r={cursorSize.current}
			stroke-width={outerCircleStrokeWidth} />
		<circle
			class="inner-circle"
			cx={innerCursor.current.x}
			cy={innerCursor.current.y}
			r={cursorSize.current - innerCircleSizeDifference} />
	</svg>
{/if}

<style>
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
