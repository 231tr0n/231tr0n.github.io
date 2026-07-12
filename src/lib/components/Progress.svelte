<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { linear } from 'svelte/easing';
	import { animationDuration } from '$lib/constants/app.constants';
	import type { Snippet } from 'svelte';

	let {
		value,
		max,
		children
	}: {
		value: number;
		max: number;
		children?: Snippet;
	} = $props();

	const progressValue = $derived(value);
	const progress = new Tween(0, { duration: animationDuration, easing: linear });

	$effect(() => {
		progress.target = progressValue;
	});
</script>

<br />
<div class="zeltron-flex-middle">
	<progress {max} value={progress.current}>
		{@render children?.()}
	</progress>
</div>
<br />
