<script lang="ts">
	import Page from '$lib/components/Page.svelte';
	import Post from '$lib/components/Post.svelte';
	import type { PostData } from '$lib/types';

	const miscPosts: PostData[] = [
		{
			name: 'HTML Playground',
			badges: ['html', 'css', 'javascript', 'browser'],
			description: 'A simple playground to play with html, css and javascript.',
			url: '/misc/htmlplayground',
			open: false,
			external: false
		},
		{
			name: 'Website Sourcemap',
			badges: ['html', 'css', 'javascript', 'svelte', 'browser'],
			description: 'Shows a source map of the website output bundle, useful for optimization.',
			url: '/misc/sourcemap',
			open: false,
			external: false
		}
	];
</script>

<Page>
	<h1>Miscellaneous</h1>

	{#each miscPosts as miscPost, _ (_)}
		<Post post={miscPost} />
	{/each}
</Page>
