<script lang="ts">
	import Page from '$lib/components/Page.svelte';
	import Post from '$lib/components/Post.svelte';
	import type { PostData } from '$lib/types';

	let blogPosts: PostData[] = [
		{
			name: 'Neovim configuration',
			badges: ['neovim', 'configuration', 'lua'],
			description: 'Brief introduction about my neovim configuration.',
			url: '/blog/config',
			open: false,
			external: false
		}
	];
</script>

<Page>
	<h1>Blog</h1>

	{#each blogPosts as blogPost, _ (_)}
		<Post post={blogPost} />
	{/each}
</Page>
