<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { linear } from 'svelte/easing';
	import { animationDuration } from '$lib/animation.constants';

	let { value = 0, max = 100, children = null } = $props();

	const progress = new Tween(value, { duration: animationDuration, easing: linear });

	$effect(() => {
		progress.target = value;
	});
</script>

<br />
<div class="zeltron-flex-middle">
	<progress {max} value={progress.current}>
		{@render children?.()}
	</progress>
</div>
<br />
