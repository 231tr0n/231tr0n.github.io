<script lang="ts">
	import Accordion from '$lib/components/Accordion.svelte';
	import type { PostData } from '$lib/types';

	let { post = { name: '', url: '', description: '', badges: [] } }: { post: PostData } = $props();
</script>

<Accordion name={post['name']} url={post['url']}>
	<div>
		{#each post['badges'] as badge, _ (_)}
			<span class="badge">{badge}</span>
		{/each}
		<div>
			{post['description']}
		</div>
	</div>
</Accordion>

<style>
	div {
		text-align: center;
	}
</style>
