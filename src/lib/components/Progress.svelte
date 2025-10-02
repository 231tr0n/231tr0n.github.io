<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { linear } from 'svelte/easing';
	import { animationDuration } from '$lib/animation.constants';

	let { value = 0, max = 100, children = null } = $props();

	let progress = new Tween(value, { duration: animationDuration, easing: linear });

	$effect(() => {
		progress.target = value;
	});
</script>

<br />
<div class="flex-middle">
	<progress value={progress.current} {max}>
		{@render children?.()}
	</progress>
</div>
<br />
