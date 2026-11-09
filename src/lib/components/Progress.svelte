<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { linear } from 'svelte/easing';
	import { animationDuration } from '#lib/constants/app.constants.js';
	import type { Snippet } from 'svelte';

	let {
		value,
		max,
		label = 'Progress',
		children
	}: {
		value: number;
		max: number;
		label?: string;
		children?: Snippet;
	} = $props();

	// svelte-ignore state_referenced_locally
	const initialValue = $state.snapshot(value);
	const progress = new Tween(initialValue, {
		duration: animationDuration,
		easing: linear
	});

	$effect(() => {
		progress.target = value;
	});
</script>

<br />
<div class="zeltron-flex-middle">
	<progress aria-label={label} {max} value={progress.current}>
		{@render children?.()}
	</progress>
</div>
<br />
