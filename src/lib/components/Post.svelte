<script lang="ts">
	import Accordion from '$lib/components/Accordion.svelte';
	import type { PostData } from '$lib/types';

	let { post = { name: '', url: '', description: '', badges: [] } }: { post: PostData } = $props();
</script>

{#if post['name'] && post['description']}
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
{:else}
	<div class="error">Blog post data is not accurate</div>
{/if}

<style>
	div {
		text-align: center;
	}
</style>
