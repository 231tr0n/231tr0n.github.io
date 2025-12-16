<script lang="ts">
	import Accordion from '$lib/components/Accordion.svelte';
	import type { PostData } from '$lib/types';

	let { post }: { post: PostData } = $props();
</script>

<Accordion name={post.name} external={post.external} open={post.open} url={post.url}>
	<div>
		{#each post.badges as badge, _ (_)}
			<span class="zeltron-badge">{badge}</span>
		{/each}
		<div>
			{post.description}
		</div>
	</div>
</Accordion>

<style>
	div {
		text-align: center;
	}
</style>
